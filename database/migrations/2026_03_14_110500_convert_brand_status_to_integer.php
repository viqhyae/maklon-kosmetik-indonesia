<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('brands') || !Schema::hasColumn('brands', 'status')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("UPDATE brands SET status = CASE WHEN status IN ('Aktif', '1', 1) THEN 1 ELSE 0 END");
            DB::statement("ALTER TABLE brands MODIFY status TINYINT(1) NOT NULL DEFAULT 1");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("UPDATE brands SET status = CASE WHEN status IN ('Aktif', '1', 'true') THEN '1' ELSE '0' END");
            DB::statement("ALTER TABLE brands ALTER COLUMN status TYPE SMALLINT USING status::smallint");
            DB::statement("ALTER TABLE brands ALTER COLUMN status SET DEFAULT 1");
            return;
        }

        if ($driver === 'sqlite') {
            DB::statement("UPDATE brands SET status = CASE WHEN status IN ('Aktif', '1', 1) THEN 1 ELSE 0 END");
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('brands') || !Schema::hasColumn('brands', 'status')) {
            return;
        }

        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE brands MODIFY status VARCHAR(255) NOT NULL DEFAULT 'Aktif'");
            DB::statement("UPDATE brands SET status = CASE WHEN status = 1 THEN 'Aktif' ELSE 'Non-aktif' END");
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE brands ALTER COLUMN status TYPE VARCHAR(255) USING status::varchar");
            DB::statement("ALTER TABLE brands ALTER COLUMN status SET DEFAULT 'Aktif'");
            DB::statement("UPDATE brands SET status = CASE WHEN status = '1' THEN 'Aktif' ELSE 'Non-aktif' END");
            return;
        }

        if ($driver === 'sqlite') {
            DB::statement("UPDATE brands SET status = CASE WHEN status = 1 THEN 'Aktif' ELSE 'Non-aktif' END");
        }
    }
};
