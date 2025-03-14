#!/bin/bash
# Bash script to set production environment variables
# This script can be customized for different environments (dev, staging, production)

# Database Configuration
export DB_URL="jdbc:postgresql://prod-db-server:5432/coingame_prod"
export DB_USERNAME="prod_user"
export DB_PASSWORD="secure_password"

# JPA Configuration
export JPA_DDL_AUTO="validate"  # Use 'validate' in production, not 'update'
export SHOW_SQL="false"  # Disable SQL logging in production
export FORMAT_SQL="false"

# SQL Configuration
export SQL_INIT_MODE="never"  # Don't run schema.sql in production

# Server Configuration
export PORT="8080"  # Your production port

# JWT Configuration - Use a strong, unique secret for production
export JWT_SECRET="REPLACE_WITH_SECURE_PRODUCTION_SECRET_KEY"
export JWT_EXPIRATION="900000"  # 15 minutes
export JWT_REFRESH_EXPIRATION="86400000"  # 24 hours

# CORS Configuration
export FRONTEND_URL="https://your-production-domain.com"

# Logging Configuration - Use more conservative logging in production
export LOG_LEVEL_SECURITY="INFO"
export LOG_LEVEL_WEB="INFO"
export LOG_LEVEL_APP="INFO"
export LOG_LEVEL_SQL="WARN"
export LOG_LEVEL_SQL_PARAMS="INFO"

echo "Production environment variables have been set."
echo "Start your application with: java -jar coin-flip-casino-0.0.1-SNAPSHOT.jar" 