# PowerShell script to set production environment variables
# This script can be customized for different environments (dev, staging, production)

# Database Configuration
$env:DB_URL = "jdbc:postgresql://prod-db-server:5432/coingame_prod"
$env:DB_USERNAME = "prod_user"
$env:DB_PASSWORD = "secure_password"

# JPA Configuration
$env:JPA_DDL_AUTO = "validate"  # Use 'validate' in production, not 'update'
$env:SHOW_SQL = "false"  # Disable SQL logging in production
$env:FORMAT_SQL = "false"

# SQL Configuration
$env:SQL_INIT_MODE = "never"  # Don't run schema.sql in production

# Server Configuration
$env:PORT = "8080"  # Your production port

# JWT Configuration - Use a strong, unique secret for production
$env:JWT_SECRET = "REPLACE_WITH_SECURE_PRODUCTION_SECRET_KEY"
$env:JWT_EXPIRATION = "30000"  # 5 minutes
$env:JWT_REFRESH_EXPIRATION = "60000"  # 10 minutes

# CORS Configuration
$env:FRONTEND_URL = "https://your-production-domain.com"

# Logging Configuration - Use more conservative logging in production
$env:LOG_LEVEL_SECURITY = "INFO"
$env:LOG_LEVEL_WEB = "INFO"
$env:LOG_LEVEL_APP = "INFO"
$env:LOG_LEVEL_SQL = "WARN"
$env:LOG_LEVEL_SQL_PARAMS = "INFO"

Write-Host "Production environment variables have been set." -ForegroundColor Green
Write-Host "Start your application with: java -jar coin-flip-casino-0.0.1-SNAPSHOT.jar" -ForegroundColor Yellow 