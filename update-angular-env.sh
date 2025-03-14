#!/bin/bash
# Bash script to update Angular environment files from backend .env files

ENV=${1:-dev} # Default to dev environment if not specified

echo -e "\e[36mUpdating Angular environment files from .$ENV environment...\e[0m"

ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "\e[31mError: $ENV_FILE not found!\e[0m"
  exit 1
fi

# Ensure the environments directory exists
mkdir -p src/environments

# Determine which Angular environment file to update
if [ "$ENV" = "prod" ]; then
  TARGET_FILE="src/environments/environment.prod.ts"
elif [ "$ENV" = "dev" ]; then
  TARGET_FILE="src/environments/environment.development.ts"
else
  TARGET_FILE="src/environments/environment.ts"
fi

# Read values from the .env file
API_URL=$(grep FRONTEND_URL "$ENV_FILE" | cut -d '=' -f2)
DB_URL=$(grep DB_URL "$ENV_FILE" | cut -d '=' -f2)
DB_USERNAME=$(grep DB_USERNAME "$ENV_FILE" | cut -d '=' -f2)
DB_PASSWORD=$(grep DB_PASSWORD "$ENV_FILE" | cut -d '=' -f2)
FRONTEND_URL=$(grep FRONTEND_URL "$ENV_FILE" | cut -d '=' -f2)

# Set production value based on environment
if [ "$ENV" = "prod" ]; then
  PRODUCTION="true"
else
  PRODUCTION="false"
fi

# Create content for the environment file
cat > "$TARGET_FILE" << EOF
export const environment = {
  production: $PRODUCTION,
  apiUrl: '$API_URL',
  dbUrl: '$DB_URL',
  dbUsername: '$DB_USERNAME',
  dbPassword: '$DB_PASSWORD',
  frontendUrl: '$FRONTEND_URL'
};
EOF

echo -e "\e[32mUpdated $TARGET_FILE with values from $ENV_FILE\e[0m"

# Always update the default environment.ts file as well if not already updated
if [ "$TARGET_FILE" != "src/environments/environment.ts" ]; then
  cp "$TARGET_FILE" "src/environments/environment.ts"
  echo -e "\e[32mAlso updated src/environments/environment.ts\e[0m"
fi

echo -e "\e[36mAngular environment files updated successfully!\e[0m" 