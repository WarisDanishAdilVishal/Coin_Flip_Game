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

-- Check if transactions table exists and create if not
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    details TEXT,
    payment_method VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add payment_method column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE transactions ADD COLUMN payment_method VARCHAR(100);
    END IF;
END $$;

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
        
        -- Insert test deposit transactions
        INSERT INTO transactions (user_id, amount, type, status, timestamp, details, payment_method)
        VALUES 
            (1, 500.00, 'DEPOSIT', 'COMPLETED', NOW() - INTERVAL '7 day', 'Initial deposit', 'UPI'),
            (1, 1000.00, 'DEPOSIT', 'COMPLETED', NOW() - INTERVAL '5 day', 'Deposit via Bank Transfer', 'Bank Transfer'),
            (1, 200.00, 'DEPOSIT', 'COMPLETED', NOW() - INTERVAL '2 day', 'Quick deposit', 'UPI'),
            (1, 5000.00, 'DEPOSIT', 'COMPLETED', NOW() - INTERVAL '1 day', 'Large deposit', 'Bank Transfer');
            
        -- Insert test deposit transactions for admin
        INSERT INTO transactions (user_id, amount, type, status, timestamp, details, payment_method)
        VALUES 
            (2, 1000.00, 'DEPOSIT', 'COMPLETED', NOW() - INTERVAL '6 day', 'Admin test deposit', 'Credit Card'),
            (2, 2000.00, 'DEPOSIT', 'COMPLETED', NOW() - INTERVAL '3 day', 'Admin deposit via UPI', 'UPI');
    END IF;
END $$; 