-- MINOR FIX: Remove unused uuid-ossp extension
-- All UUIDs go through native gen_random_uuid()

drop extension if exists "uuid-ossp";
