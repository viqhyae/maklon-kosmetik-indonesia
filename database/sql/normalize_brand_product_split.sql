-- Normalize legacy-imported combined names into canonical Brand + Product names.
-- Example: "ASSC Love Me Harder" => brand "ASSC", product "Love Me Harder"

START TRANSACTION;

SET @normalize_now = NOW();

DROP TEMPORARY TABLE IF EXISTS tmp_brand_product_map;
CREATE TEMPORARY TABLE tmp_brand_product_map (
    old_brand_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    canonical_brand VARCHAR(255) NOT NULL,
    canonical_product VARCHAR(255) NOT NULL,
    old_created_at TIMESTAMP NULL,
    old_updated_at TIMESTAMP NULL,
    old_status TINYINT NULL,
    old_owner_name VARCHAR(255) NULL
) ENGINE=InnoDB;

INSERT INTO tmp_brand_product_map (
    old_brand_id,
    full_name,
    canonical_brand,
    canonical_product,
    old_created_at,
    old_updated_at,
    old_status,
    old_owner_name
)
SELECT
    b.id AS old_brand_id,
    TRIM(b.name) AS full_name,
    CASE
        WHEN UPPER(TRIM(b.name)) = 'ASSC' OR UPPER(TRIM(b.name)) LIKE 'ASSC %' THEN 'ASSC'
        WHEN UPPER(TRIM(b.name)) = 'BLIMEY!' OR UPPER(TRIM(b.name)) LIKE 'BLIMEY! %' THEN 'BLIMEY!'
        WHEN UPPER(TRIM(b.name)) = 'THERD' OR UPPER(TRIM(b.name)) LIKE 'THERD %' THEN 'THERD'
        WHEN UPPER(TRIM(b.name)) = 'LAVENIR' OR UPPER(TRIM(b.name)) LIKE 'LAVENIR %' THEN 'LAVENIR'
        WHEN LOWER(TRIM(b.name)) = 'littlekimy' OR LOWER(TRIM(b.name)) LIKE 'littlekimy %' THEN 'littlekimy'
        WHEN UPPER(TRIM(b.name)) = 'PANDEKA SCENT' OR UPPER(TRIM(b.name)) LIKE 'PANDEKA SCENT %' THEN 'PANDEKA SCENT'
        WHEN LOCATE(' ', TRIM(b.name)) > 0 THEN SUBSTRING_INDEX(TRIM(b.name), ' ', 1)
        ELSE TRIM(b.name)
    END AS canonical_brand,
    CASE
        WHEN UPPER(TRIM(b.name)) LIKE 'ASSC %'
            THEN TRIM(SUBSTRING(TRIM(b.name), CHAR_LENGTH('ASSC') + 2))
        WHEN UPPER(TRIM(b.name)) LIKE 'BLIMEY! %'
            THEN TRIM(SUBSTRING(TRIM(b.name), CHAR_LENGTH('BLIMEY!') + 2))
        WHEN UPPER(TRIM(b.name)) LIKE 'THERD %'
            THEN TRIM(SUBSTRING(TRIM(b.name), CHAR_LENGTH('THERD') + 2))
        WHEN UPPER(TRIM(b.name)) LIKE 'LAVENIR %'
            THEN TRIM(SUBSTRING(TRIM(b.name), CHAR_LENGTH('LAVENIR') + 2))
        WHEN LOWER(TRIM(b.name)) LIKE 'littlekimy %'
            THEN TRIM(SUBSTRING(TRIM(b.name), CHAR_LENGTH('littlekimy') + 2))
        WHEN UPPER(TRIM(b.name)) LIKE 'PANDEKA SCENT %'
            THEN TRIM(SUBSTRING(TRIM(b.name), CHAR_LENGTH('PANDEKA SCENT') + 2))
        WHEN UPPER(TRIM(b.name)) = 'PANDEKA SCENT'
            THEN 'PANDEKA SCENT'
        WHEN LOCATE(' ', TRIM(b.name)) > 0
            THEN TRIM(SUBSTRING(TRIM(b.name), LOCATE(' ', TRIM(b.name)) + 1))
        ELSE TRIM(b.name)
    END AS canonical_product,
    b.created_at AS old_created_at,
    b.updated_at AS old_updated_at,
    b.status AS old_status,
    b.owner_name AS old_owner_name
FROM brands b;

UPDATE tmp_brand_product_map
SET canonical_product = canonical_brand
WHERE canonical_product IS NULL OR TRIM(canonical_product) = '';

DROP TEMPORARY TABLE IF EXISTS tmp_canonical_brands;
CREATE TEMPORARY TABLE tmp_canonical_brands (
    canonical_brand VARCHAR(255) NOT NULL PRIMARY KEY,
    brand_code VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NULL,
    status TINYINT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;

INSERT INTO tmp_canonical_brands (
    canonical_brand,
    brand_code,
    owner_name,
    status,
    created_at,
    updated_at
)
SELECT
    m.canonical_brand,
    CONCAT('CANON-BR-', UPPER(SUBSTRING(MD5(m.canonical_brand), 1, 10))) AS brand_code,
    MAX(NULLIF(TRIM(m.old_owner_name), '')) AS owner_name,
    MAX(COALESCE(m.old_status, 1)) AS status,
    MIN(COALESCE(m.old_created_at, @normalize_now)) AS created_at,
    MAX(COALESCE(m.old_updated_at, m.old_created_at, @normalize_now)) AS updated_at
FROM tmp_brand_product_map m
GROUP BY m.canonical_brand;

INSERT INTO brands (
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
    c.canonical_brand AS name,
    c.brand_code,
    c.owner_name,
    NULL AS description,
    NULL AS logo_url,
    c.status,
    c.created_at,
    c.updated_at
FROM tmp_canonical_brands c
ORDER BY c.canonical_brand;

DROP TEMPORARY TABLE IF EXISTS tmp_brand_id_remap;
CREATE TEMPORARY TABLE tmp_brand_id_remap (
    old_brand_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    new_brand_id BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB;

INSERT INTO tmp_brand_id_remap (old_brand_id, new_brand_id)
SELECT
    m.old_brand_id,
    b_new.id AS new_brand_id
FROM tmp_brand_product_map m
JOIN tmp_canonical_brands c
    ON c.canonical_brand = m.canonical_brand
JOIN brands b_new
    ON b_new.brand_code = c.brand_code;

UPDATE product_skus ps
JOIN tmp_brand_product_map m
    ON m.old_brand_id = ps.brand_id
JOIN tmp_brand_id_remap r
    ON r.old_brand_id = ps.brand_id
SET
    ps.brand_id = r.new_brand_id,
    ps.name = m.canonical_product,
    ps.updated_at = @normalize_now;

UPDATE tag_batches tb
JOIN tmp_brand_product_map m
    ON tb.brand_name = m.full_name
SET
    tb.brand_name = m.canonical_brand,
    tb.product_name = m.canonical_product,
    tb.updated_at = @normalize_now;

UPDATE tag_codes tc
JOIN tmp_brand_product_map m
    ON tc.brand_name = m.full_name
SET
    tc.brand_name = m.canonical_brand,
    tc.product_name = m.canonical_product,
    tc.updated_at = @normalize_now;

UPDATE scan_activities sa
JOIN tmp_brand_product_map m
    ON sa.brand_name = m.full_name
SET
    sa.brand_name = m.canonical_brand,
    sa.product_name = CASE
        WHEN sa.product_name = m.full_name THEN m.canonical_product
        ELSE sa.product_name
    END,
    sa.updated_at = @normalize_now;

DELETE b_old
FROM brands b_old
JOIN tmp_brand_product_map m
    ON m.old_brand_id = b_old.id;

DROP TEMPORARY TABLE IF EXISTS tmp_brand_id_remap;
DROP TEMPORARY TABLE IF EXISTS tmp_canonical_brands;
DROP TEMPORARY TABLE IF EXISTS tmp_brand_product_map;

COMMIT;
