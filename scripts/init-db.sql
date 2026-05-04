-- Initialize Document Management Database
-- This script runs when PostgreSQL container starts

-- Create database if it doesn't exist
-- (Handled by POSTGRES_DB environment variable)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set up database schema
-- The actual tables will be created by the application's DatabaseManager
-- This ensures the schema is always in sync with the code
