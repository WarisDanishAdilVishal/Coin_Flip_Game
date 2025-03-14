-- First, update any NULL statuses in the users table
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;

-- Then create or modify tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_active TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

-- Check if user_roles table exists and create if not
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create a test user if no users exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users) THEN
        -- Insert a test user with password 'password' (BCrypt encoded)
        INSERT INTO users (username, password, status) 
        VALUES ('testuser', '$2a$12$0fSGQobJ2hSXvkT8e5eDPu3G1Ki3gieLH1pKCGqkNShIQVQpri9q.', 'ACTIVE');
        
        -- Assign ROLE_USER role to test user
        INSERT INTO user_roles (user_id, role)
        VALUES (1, 'ROLE_USER');
        
        -- Insert an admin user
        INSERT INTO users (username, password, status) 
        VALUES ('admin', '$2a$12$SkUE6EXlu4KNtwnJWI5VF.gTn/cEK79rm3XLYW9g9wyFReijBBbga', 'ACTIVE');
        
        -- Assign ROLE_ADMIN role to admin user
        INSERT INTO user_roles (user_id, role)
        VALUES (2, 'ROLE_ADMIN');
    END IF;
END $$; 