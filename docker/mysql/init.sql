-- Create databases
CREATE DATABASE IF NOT EXISTS db_employee
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS db_attendance
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Create application user
CREATE USER IF NOT EXISTS 'hruser'@'%'
    IDENTIFIED BY 'hrpassword';

-- Grant access to employee database
GRANT ALL PRIVILEGES ON db_employee.* 
    TO 'hruser'@'%';

-- Grant access to attendance database
GRANT ALL PRIVILEGES ON db_attendance.* 
    TO 'hruser'@'%';

FLUSH PRIVILEGES;