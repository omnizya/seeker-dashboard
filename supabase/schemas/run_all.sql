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

\echo '--- 07_prayer ---'
\i sql/07_prayer.sql

\echo '--- 08_planetary ---'
\i sql/08_planetary.sql

\echo '--- 09_astro ---'
\i sql/09_astro.sql

\echo '--- 10_features ---'
\i sql/10_features.sql
