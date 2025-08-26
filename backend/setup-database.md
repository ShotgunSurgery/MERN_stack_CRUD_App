# Database Setup Guide

## Prerequisites
1. **MySQL Server** must be installed and running on your machine
2. **Node.js** and **npm** must be installed

## Step 1: Create .env file
Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=mern_crud_app

# Server Configuration
PORT=5000
```

**Important:** Replace `your_actual_mysql_password` with your actual MySQL root password.

## Step 2: Create Database and Tables
1. Open MySQL command line or MySQL Workbench
2. Run the SQL commands from `database_schema.sql` file:

```sql
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
```

## Step 3: Test Database Connection
1. Start your backend server: `npm start` (from backend directory)
2. Check the console output for environment variable status
3. Test the database connection: Visit `http://localhost:5000/api/db-test`

## Step 4: Insert Sample Data (Optional)
```sql
USE mern_crud_app;

INSERT INTO products (name) VALUES 
('Sample Product 1'),
('Sample Product 2'),
('Sample Product 3');
```

## Troubleshooting

### Common Issues:

1. **"Access denied for user 'root'@'localhost'"**
   - Check your MySQL password in the .env file
   - Make sure MySQL is running

2. **"Can't connect to MySQL server"**
   - Make sure MySQL service is running
   - Check if MySQL is running on port 3306

3. **"Unknown database 'mern_crud_app'"**
   - Run the CREATE DATABASE command first

4. **"Table 'products' doesn't exist"**
   - Run the CREATE TABLE commands from the schema

### Testing Steps:
1. Visit `http://localhost:5000/api/health` - Should show "Server is running"
2. Visit `http://localhost:5000/api/db-check` - Should show database connection status
3. Visit `http://localhost:5000/api/db-test` - Should show detailed database information

If you're still having issues, check the backend console output for detailed error messages.
