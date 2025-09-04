USE mern_crud_app

-- user table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,           -- store bcrypt/argon2 hash
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  nickname VARCHAR(100),
  mobile_number VARCHAR(20),
  designation VARCHAR(100),
  joining_date DATE,
  user_type ENUM('Operator','Supervisor','Admin') NOT NULL DEFAULT 'Operator',
  status ENUM('Active','Inactive','Locked') NOT NULL DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user_permissions table 
CREATE TABLE user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  module_name VARCHAR(100) NOT NULL,              -- e.g. 'Product Configuration'
  can_view TINYINT(1) NOT NULL DEFAULT 0,
  can_add  TINYINT(1) NOT NULL DEFAULT 0,
  can_update TINYINT(1) NOT NULL DEFAULT 0,
  can_delete TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_user_module (user_id, module_name),
  CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- shifts table 
CREATE TABLE shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  start_time TIME NOT NULL,       -- shift daily start (e.g., '07:00:00')
  end_time TIME NOT NULL,         -- shift daily end (may be less than start_time for overnight shift)
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- station shifts 
CREATE TABLE station_shifts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  station_id INT NOT NULL,
  shift_id INT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_station_shift (station_id, shift_id),
  CONSTRAINT fk_ss_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  CONSTRAINT fk_ss_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- station allocation table 
CREATE TABLE station_allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  station_id INT NOT NULL,
  shift_id INT NULL,                 -- nullable: you can assign explicit shift or custom time range
  allocation_date DATE NOT NULL,     -- the date for this assignment (use same date for overnight start)
  start_time TIME NOT NULL,          -- effective start (on allocation_date)
  end_time TIME NOT NULL,            -- effective end (if < start_time, it means spans to next day)
  notes TEXT,
  created_by INT,                    -- admin who created this allocation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_alloc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_station FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  CONSTRAINT fk_alloc_shift FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, allocation_date),
  INDEX idx_station_date (station_id, allocation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- allocation audit trail 
CREATE TABLE allocation_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  allocation_id INT,
  user_id INT NOT NULL,
  action ENUM('assigned','revoked','access_attempt','access_granted','access_denied') NOT NULL,
  action_by INT,         -- admin or system user that performed action
  action_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  CONSTRAINT fk_aa_alloc FOREIGN KEY (allocation_id) REFERENCES station_allocations(id) ON DELETE SET NULL,
  CONSTRAINT fk_aa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TRIGGERS 
DELIMITER $$
CREATE TRIGGER trg_alloc_before_insert
BEFORE INSERT ON station_allocations
FOR EACH ROW
BEGIN
  -- Check overlaps for same user on that date
  IF EXISTS (
    SELECT 1 FROM station_allocations a
    WHERE a.user_id = NEW.user_id
      AND a.allocation_date = NEW.allocation_date
      AND (
        -- non-overnight existing vs non-overnight new
        (a.end_time > a.start_time AND NEW.end_time > NEW.start_time AND NOT (
             NEW.end_time <= a.start_time OR NEW.start_time >= a.end_time
           ))
        -- existing overnight OR new overnight: check by expanding to two intervals or compare carefully
        OR
        ( (a.end_time <= a.start_time) -- existing overnight
          AND (
            NOT (NEW.end_time <= a.start_time AND NEW.start_time >= a.end_time) -- loose check
          )
        )
        OR
        ( (NEW.end_time <= NEW.start_time) -- new overnight
          AND (
            NOT (a.end_time <= a.start_time AND a.start_time >= NEW.end_time) -- loose check
          )
        )
      )
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Overlapping allocation for user on this date';
  END IF;
END$$
DELIMITER ;

-- current 
-- SELECT COUNT(*) AS allowed
-- FROM station_allocations a
-- WHERE a.user_id = ? 
--   AND (
--     (a.allocation_date = CURDATE() AND
--      TIMESTAMP(CURDATE(), a.start_time) <= NOW() AND
--      ( (a.end_time > a.start_time AND TIMESTAMP(CURDATE(), a.end_time) > NOW())
--        OR (a.end_time <= a.start_time AND TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), a.end_time) > NOW())
--      )
--     )
--   );