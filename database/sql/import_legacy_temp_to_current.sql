-- Legacy to current schema import script
-- Source DB  : legacy_temp
-- Target DB  : laravel (active website database)
-- Notes      : users table from legacy is intentionally ignored.

START TRANSACTION;

SET @legacy_now = NOW();

-- 1) Brands
INSERT INTO brands (
    id,
    name,
    brand_code,
    owner_name,
    description,
    logo_url,
    status,
    created_at,
    updated_at
)
SELECT
    b.id,
    TRIM(b.brand) AS name,
    CONCAT('LEGACY-BR-', LPAD(b.id, 4, '0')) AS brand_code,
    NULL AS owner_name,
    NULL AS description,
    NULL AS logo_url,
    1 AS status,
    COALESCE(b.created_at, @legacy_now) AS created_at,
    COALESCE(b.updated_at, b.created_at, @legacy_now) AS updated_at
FROM legacy_temp.brands b
ORDER BY b.id;

-- 2) Product SKU list (best-effort, one SKU per legacy brand)
INSERT INTO product_skus (
    name,
    sku_code,
    brand_id,
    category_l1_id,
    category_l2_id,
    category_l3_id,
    description,
    image_url,
    dynamic_fields,
    created_at,
    updated_at
)
SELECT
    TRIM(b.brand) AS name,
    CONCAT('LEGACY-SKU-', LPAD(b.id, 4, '0')) AS sku_code,
    b.id AS brand_id,
    NULL AS category_l1_id,
    NULL AS category_l2_id,
    NULL AS category_l3_id,
    'Migrated from legacy database' AS description,
    NULL AS image_url,
    NULL AS dynamic_fields,
    COALESCE(k_stats.min_created_at, b.created_at, @legacy_now) AS created_at,
    COALESCE(k_stats.max_updated_at, k_stats.min_created_at, b.updated_at, b.created_at, @legacy_now) AS updated_at
FROM legacy_temp.brands b
LEFT JOIN (
    SELECT
        k.brand,
        MIN(k.created_at) AS min_created_at,
        MAX(COALESCE(k.updated_at, k.created_at)) AS max_updated_at
    FROM legacy_temp.kodes k
    GROUP BY k.brand
) k_stats
    ON k_stats.brand = b.id
ORDER BY b.id;

-- 3) Build legacy batch groups (brand + code length)
DROP TEMPORARY TABLE IF EXISTS tmp_legacy_batch_groups;
CREATE TEMPORARY TABLE tmp_legacy_batch_groups (
    legacy_brand_id INT NOT NULL,
    code_len INT NOT NULL,
    quantity INT NOT NULL,
    min_kode_id INT NOT NULL,
    max_kode_id INT NOT NULL,
    min_created_at TIMESTAMP NULL,
    max_updated_at TIMESTAMP NULL,
    PRIMARY KEY (legacy_brand_id, code_len)
) ENGINE=MEMORY;

INSERT INTO tmp_legacy_batch_groups (
    legacy_brand_id,
    code_len,
    quantity,
    min_kode_id,
    max_kode_id,
    min_created_at,
    max_updated_at
)
SELECT
    k.brand AS legacy_brand_id,
    CHAR_LENGTH(TRIM(k.kode)) AS code_len,
    COUNT(*) AS quantity,
    MIN(k.id) AS min_kode_id,
    MAX(k.id) AS max_kode_id,
    MIN(k.created_at) AS min_created_at,
    MAX(COALESCE(k.updated_at, k.created_at)) AS max_updated_at
FROM legacy_temp.kodes k
WHERE k.kode IS NOT NULL
  AND TRIM(k.kode) <> ''
GROUP BY
    k.brand,
    CHAR_LENGTH(TRIM(k.kode));

-- 4) Tag batch history
INSERT INTO tag_batches (
    batch_code,
    product_name,
    brand_name,
    quantity,
    id_length,
    error_correction,
    use_pin,
    pin_length,
    status,
    suspend_reason,
    first_code,
    last_code,
    created_by,
    created_at,
    updated_at
)
SELECT
    CONCAT('LEGACY-BATCH-', LPAD(g.legacy_brand_id, 4, '0'), '-', LPAD(g.code_len, 2, '0')) AS batch_code,
    TRIM(b.brand) AS product_name,
    TRIM(b.brand) AS brand_name,
    g.quantity,
    g.code_len AS id_length,
    'M' AS error_correction,
    0 AS use_pin,
    NULL AS pin_length,
    'Generated' AS status,
    NULL AS suspend_reason,
    UPPER(TRIM(k_first.kode)) AS first_code,
    UPPER(TRIM(k_last.kode)) AS last_code,
    NULL AS created_by,
    COALESCE(g.min_created_at, @legacy_now) AS created_at,
    COALESCE(g.max_updated_at, g.min_created_at, @legacy_now) AS updated_at
FROM tmp_legacy_batch_groups g
JOIN legacy_temp.brands b
    ON b.id = g.legacy_brand_id
JOIN legacy_temp.kodes k_first
    ON k_first.id = g.min_kode_id
JOIN legacy_temp.kodes k_last
    ON k_last.id = g.max_kode_id
ORDER BY g.legacy_brand_id, g.code_len;

-- 5) Tag codes
INSERT INTO tag_codes (
    tag_batch_id,
    verification_code,
    product_name,
    brand_name,
    status,
    pin,
    error_correction,
    created_at,
    updated_at
)
SELECT
    tb.id AS tag_batch_id,
    UPPER(TRIM(k.kode)) AS verification_code,
    TRIM(b.brand) AS product_name,
    TRIM(b.brand) AS brand_name,
    'Aktif' AS status,
    NULL AS pin,
    'M' AS error_correction,
    COALESCE(k.created_at, @legacy_now) AS created_at,
    COALESCE(k.updated_at, k.created_at, @legacy_now) AS updated_at
FROM legacy_temp.kodes k
JOIN legacy_temp.brands b
    ON b.id = k.brand
JOIN tag_batches tb
    ON tb.batch_code = CONCAT(
        'LEGACY-BATCH-',
        LPAD(k.brand, 4, '0'),
        '-',
        LPAD(CHAR_LENGTH(TRIM(k.kode)), 2, '0')
    )
WHERE k.kode IS NOT NULL
  AND TRIM(k.kode) <> ''
ORDER BY k.id;

-- 6) Reconstruct scan activities (best-effort from cek/tgl/tgl2/tgl3)
DROP TEMPORARY TABLE IF EXISTS tmp_legacy_scan_events;
CREATE TEMPORARY TABLE tmp_legacy_scan_events (
    legacy_kode_id INT NOT NULL,
    event_order TINYINT NOT NULL,
    scanned_at TIMESTAMP NULL,
    scan_count INT NOT NULL,
    PRIMARY KEY (legacy_kode_id, event_order)
) ENGINE=MEMORY;

-- known scan timestamp #1
INSERT INTO tmp_legacy_scan_events (legacy_kode_id, event_order, scanned_at, scan_count)
SELECT
    k.id,
    1,
    k.tgl,
    1
FROM legacy_temp.kodes k
WHERE k.cek > 0
  AND k.tgl IS NOT NULL;

-- known scan timestamp #2
INSERT INTO tmp_legacy_scan_events (legacy_kode_id, event_order, scanned_at, scan_count)
SELECT
    k.id,
    2,
    k.tgl2,
    2
FROM legacy_temp.kodes k
WHERE k.cek > 0
  AND k.tgl2 IS NOT NULL;

-- known scan timestamp #3
INSERT INTO tmp_legacy_scan_events (legacy_kode_id, event_order, scanned_at, scan_count)
SELECT
    k.id,
    3,
    k.tgl3,
    3
FROM legacy_temp.kodes k
WHERE k.cek > 0
  AND k.tgl3 IS NOT NULL;

-- summary event for extra scans not timestamped in legacy schema
INSERT INTO tmp_legacy_scan_events (legacy_kode_id, event_order, scanned_at, scan_count)
SELECT
    k.id,
    9,
    COALESCE(k.updated_at, k.tgl3, k.tgl2, k.tgl, k.created_at, @legacy_now) AS scanned_at,
    k.cek AS scan_count
FROM legacy_temp.kodes k
WHERE k.cek > (
    (k.tgl IS NOT NULL) +
    (k.tgl2 IS NOT NULL) +
    (k.tgl3 IS NOT NULL)
);

INSERT INTO scan_activities (
    scanned_code,
    tag_code_id,
    verification_code,
    product_name,
    brand_name,
    tag_status,
    result_status,
    suspend_reason,
    scan_count,
    location_label,
    latitude,
    longitude,
    ip_address,
    user_agent,
    scanned_at,
    created_at,
    updated_at
)
SELECT
    UPPER(TRIM(k.kode)) AS scanned_code,
    tc.id AS tag_code_id,
    tc.verification_code AS verification_code,
    TRIM(b.brand) AS product_name,
    TRIM(b.brand) AS brand_name,
    tc.status AS tag_status,
    CASE
        WHEN e.scan_count <= 3 THEN 'Original'
        ELSE 'Peringatan'
    END AS result_status,
    NULL AS suspend_reason,
    e.scan_count,
    'Legacy Checker' AS location_label,
    NULL AS latitude,
    NULL AS longitude,
    NULL AS ip_address,
    'Legacy Import' AS user_agent,
    COALESCE(e.scanned_at, k.updated_at, k.created_at, @legacy_now) AS scanned_at,
    COALESCE(e.scanned_at, k.updated_at, k.created_at, @legacy_now) AS created_at,
    COALESCE(e.scanned_at, k.updated_at, k.created_at, @legacy_now) AS updated_at
FROM tmp_legacy_scan_events e
JOIN legacy_temp.kodes k
    ON k.id = e.legacy_kode_id
JOIN legacy_temp.brands b
    ON b.id = k.brand
JOIN tag_codes tc
    ON tc.verification_code = CONVERT(UPPER(TRIM(k.kode)) USING utf8mb4) COLLATE utf8mb4_unicode_ci
WHERE k.cek > 0
ORDER BY k.id, e.event_order;

DROP TEMPORARY TABLE IF EXISTS tmp_legacy_scan_events;
DROP TEMPORARY TABLE IF EXISTS tmp_legacy_batch_groups;

COMMIT;
