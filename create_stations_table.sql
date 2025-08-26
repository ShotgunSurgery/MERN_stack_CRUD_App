-- Create the missing stations table
-- Run this SQL in your MySQL database after connecting to mern_crud_app

USE mern_crud_app;

-- Create stations table
CREATE TABLE IF NOT EXISTS stations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(255) NOT NULL,
    station_number INT NOT NULL,
    station_name VARCHAR(255) NOT NULL,
    cycle_time INT NOT NULL,
    daily_count INT NOT NULL,
    products_per_hour INT NOT NULL,
    report_type ENUM('Done', 'Pending', 'In process') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verify the table was created
DESCRIBE stations;

-- Show all tables in the database
SHOW TABLES;
