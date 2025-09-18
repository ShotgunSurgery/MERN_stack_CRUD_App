-- Upgrade script: users columns + user_permissions table
-- Run this in your MySQL connected to the correct database (e.g., USE mern_crud_app;)

-- 1) Ensure users table has required columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE NULL,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nickname VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS designation VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS joining_date DATE NULL,
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL,
  ADD COLUMN IF NOT EXISTS role VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS status ENUM('Active','Inactive') DEFAULT 'Active' NULL;

-- 2) Create permissions table if missing
CREATE TABLE IF NOT EXISTS user_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  can_view TINYINT(1) DEFAULT 0,
  can_add TINYINT(1) DEFAULT 0,
  can_update TINYINT(1) DEFAULT 0,
  can_delete TINYINT(1) DEFAULT 0,
  UNIQUE KEY uniq_user_module (user_id, module_name),
  CONSTRAINT fk_user_permissions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- 3) Optional: seed common modules for all existing users (idempotent)
INSERT IGNORE INTO user_permissions (user_id, module_name, can_view, can_add, can_update, can_delete)
SELECT u.id, m.module_name, 0, 0, 0, 0
FROM users u
CROSS JOIN (SELECT 'Products' AS module_name
            UNION ALL SELECT 'Stations'
            UNION ALL SELECT 'Shifts'
            UNION ALL SELECT 'Users') m
LEFT JOIN user_permissions up ON up.user_id = u.id AND up.module_name = m.module_name
WHERE up.id IS NULL;


