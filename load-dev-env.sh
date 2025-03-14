#!/bin/bash
# Bash script to load development environment variables

echo -e "\e[36mLoading development environment variables...\e[0m"

# Load variables from .env.dev file
if [ -f .env.dev ]; then
  # Export all valid environment variables from the file
  export $(grep -v '^#' .env.dev | xargs)
  echo -e "\e[32mEnvironment variables loaded from .env.dev\e[0m"
else
  echo -e "\e[31mError: .env.dev file not found\e[0m"
  exit 1
fi

echo -e "\e[36mDevelopment environment variables loaded.\e[0m"
echo -e "\e[33mYou can now start the application with: java -jar target/coin-flip-casino-0.0.1-SNAPSHOT.jar\e[0m" 