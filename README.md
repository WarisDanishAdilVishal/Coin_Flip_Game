# Coin Flip Casino

A Spring Boot application for a coin flip casino game with an Angular frontend.

## Environment Configuration

### Backend Configuration

This application uses environment variables for backend configuration. Two environment files are provided:

- `.env.dev` - Development environment configuration
- `.env.prod` - Production environment configuration

### Frontend Configuration

The Angular frontend uses environment files located in `src/environments/`:

- `environment.ts` - Default environment (development)
- `environment.development.ts` - Development environment
- `environment.prod.ts` - Production environment

### Syncing Environment Variables

To keep the frontend and backend environment variables in sync, use the provided scripts:

- Windows: `.\update-angular-env.ps1 [env]` (default: dev)
- Linux/Unix: `./update-angular-env.sh [env]` (default: dev)

These scripts will read from the corresponding `.env.[env]` file and update the Angular environment files accordingly.

## Running the Application

### Development Environment

#### Backend (Windows)

```powershell
# Load development environment variables
.\load-dev-env.ps1

# Start the application
java -jar target/coin-flip-casino-0.0.1-SNAPSHOT.jar
```

#### Backend (Linux/Unix)

```bash
# Make the script executable (first time only)
chmod +x load-dev-env.sh

# Load development environment variables
source ./load-dev-env.sh

# Start the application
java -jar target/coin-flip-casino-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
# Install dependencies
npm install

# Update environment files from backend configuration
./update-angular-env.sh dev  # On Linux/Unix
# OR
.\update-angular-env.ps1 dev  # On Windows

# Start the development server
ng serve
```

### Production Environment

#### Backend (Windows)

```powershell
# Load production environment variables
.\load-prod-env.ps1

# Start the application
java -jar target/coin-flip-casino-0.0.1-SNAPSHOT.jar
```

#### Backend (Linux/Unix)

```bash
# Make the script executable (first time only)
chmod +x load-prod-env.sh

# Load production environment variables
source ./load-prod-env.sh

# Start the application
java -jar target/coin-flip-casino-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
# Update environment files from production configuration
./update-angular-env.sh prod  # On Linux/Unix
# OR
.\update-angular-env.ps1 prod  # On Windows

# Build for production
ng build --configuration=production
```

### Docker Deployment

```bash
# Start the application using Docker Compose
docker-compose up -d
```

## Configuration Variables

### Backend Configuration

The following environment variables can be configured:

#### Database Configuration
- `DB_URL` - JDBC URL for the database
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

#### JPA Configuration
- `JPA_DDL_AUTO` - Hibernate DDL auto (update, validate, create, none)
- `SHOW_SQL` - Whether to show SQL in logs
- `FORMAT_SQL` - Whether to format SQL in logs

#### JWT Configuration
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRATION` - JWT token expiration time in milliseconds
- `JWT_REFRESH_EXPIRATION` - JWT refresh token expiration time in milliseconds

#### CORS Configuration
- `FRONTEND_URL` - URL of the frontend application for CORS

#### Logging Configuration
- `LOG_LEVEL_SECURITY` - Log level for Spring Security
- `LOG_LEVEL_WEB` - Log level for Spring Web
- `LOG_LEVEL_APP` - Log level for application code
- `LOG_LEVEL_SQL` - Log level for SQL statements
- `LOG_LEVEL_SQL_PARAMS` - Log level for SQL parameters

### Frontend Configuration

The Angular frontend uses the following environment properties:

- `production` - Whether the application is in production mode
- `apiUrl` - URL of the backend API
- `dbUrl` - Database URL (for reference only, not used directly by Angular)
- `dbUsername` - Database username (for reference only, not used directly by Angular)
- `dbPassword` - Database password (for reference only, not used directly by Angular)
- `frontendUrl` - URL of the frontend application

## Security Considerations

For production deployment:

1. Use a strong, unique JWT secret key
2. Set appropriate token expiration times
3. Use a secure database password
4. Consider using SSL for database connections
5. Set logging levels to INFO or WARN to reduce log volume