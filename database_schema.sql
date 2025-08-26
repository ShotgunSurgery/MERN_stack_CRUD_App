-- MERN Stack CRUD App Database Schema
-- Run this SQL in your MySQL database

-- Create database (if not already created)
CREATE DATABASE IF NOT EXISTS mern_crud_app;
USE mern_crud_app;

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parameters table
CREATE TABLE parameters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    parameterName VARCHAR(255),
    max_value VARCHAR(50),
    min_value VARCHAR(50),
    unit VARCHAR(50),
    evaluation VARCHAR(255),
    sample_size VARCHAR(50),
    compulsory TINYINT(1) DEFAULT 0,
    status ENUM('Active','Inactive','Pending') DEFAULT 'Pending',
    CONSTRAINT fk_parameters_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Parameter values table
CREATE TABLE parameter_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    record_name VARCHAR(255) NOT NULL,
    parameter_name VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paramvalues_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Stations table
CREATE TABLE stations (
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

