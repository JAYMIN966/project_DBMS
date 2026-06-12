-- Sports Registration System - Database Initialization Script
-- Run this script in your PostgreSQL database

-- Drop existing tables if they exist (optional - uncomment if needed)
-- DROP TABLE IF EXISTS player_sports CASCADE;
-- DROP TABLE IF EXISTS player_email CASCADE;
-- DROP TABLE IF EXISTS sports CASCADE;
-- DROP TABLE IF EXISTS player CASCADE;

-- Create player table
CREATE TABLE IF NOT EXISTS player (
    player_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0)
);

-- Create sports table
CREATE TABLE IF NOT EXISTS sports (
    sports_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Create player_email table (composite primary key)
CREATE TABLE IF NOT EXISTS player_email (
    player_id VARCHAR(50),
    email VARCHAR(255),
    PRIMARY KEY (player_id, email),
    FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE
);

-- Create player_sports table (composite primary key)
CREATE TABLE IF NOT EXISTS player_sports (
    player_id VARCHAR(50),
    sports_id INTEGER,
    PRIMARY KEY (player_id, sports_id),
    FOREIGN KEY (player_id) REFERENCES player(player_id) ON DELETE CASCADE,
    FOREIGN KEY (sports_id) REFERENCES sports(sports_id) ON DELETE CASCADE
);

-- Insert initial sports data
INSERT INTO sports (name) VALUES 
    ('Football'),
    ('Basketball'),
    ('Tennis'),
    ('Cricket'),
    ('Swimming'),
    ('Volleyball'),
    ('Badminton'),
    ('Hockey')
ON CONFLICT (name) DO NOTHING;

-- Verify tables created
SELECT 'Tables created successfully!' as status;

-- Show current sports
SELECT * FROM sports ORDER BY sports_id;
