-- ================================================================
-- RUN ALL — execute in order via \i or psql
-- ================================================================
-- Usage:
--   psql -d your_db -f sql/run_all.sql
-- ================================================================

\echo '--- 00_foundation ---'
\i sql/00_foundation.sql

\echo '--- 01_identity ---'
\i sql/01_identity.sql

\echo '--- 02_core ---'
\i sql/02_core.sql

\echo '--- 03_rbac ---'
\i sql/03_rbac.sql

\echo '--- 06_audit ---'
\i sql/06_audit.sql

\echo '--- 04_spiritual ---'
\i sql/04_spiritual.sql

\echo '--- 05_magick ---'
\i sql/05_magick.sql
