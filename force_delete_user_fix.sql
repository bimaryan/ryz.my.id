-- Jalankan script ini di SQL Editor.
-- Script ini akan mencari SEMUA relasi (Foreign Key) yang terhubung ke 
-- tabel auth.users maupun public.users, apa pun nama constraint-nya,
-- dan mengubah semuanya menjadi ON DELETE CASCADE secara paksa.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT
            tc.table_schema, 
            tc.table_name, 
            tc.constraint_name,
            kcu.column_name, 
            ccu.table_schema AS foreign_table_schema,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
        WHERE ccu.table_name IN ('users') 
          AND ccu.table_schema IN ('auth', 'public')
          AND rc.delete_rule != 'CASCADE'
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I;', r.table_schema, r.table_name, r.constraint_name);
        EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I.%I(%I) ON DELETE CASCADE;', 
            r.table_schema, r.table_name, r.constraint_name, r.column_name, r.foreign_table_schema, r.foreign_table_name, r.foreign_column_name);
    END LOOP;
END;
$$;
