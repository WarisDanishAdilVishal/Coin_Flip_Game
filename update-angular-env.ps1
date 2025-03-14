# PowerShell script to update Angular environment files from backend .env files
param (
    [string]$env = "dev" # Default to dev environment
)

Write-Host "Updating Angular environment files from .$env environment..." -ForegroundColor Cyan

$envFile = ".env.$env"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: $envFile not found!" -ForegroundColor Red
    exit 1
}

# Read environment variables from file
$envVars = @{}
Get-Content $envFile | ForEach-Object {
    if (!$_.StartsWith('#') -and $_.Trim() -ne '') {
        $key, $value = $_.Split('=', 2)
        $envVars[$key] = $value
    }
}

# Determine which Angular environment file to update
$targetFile = if ($env -eq "prod") {
    "src/environments/environment.prod.ts"
} elseif ($env -eq "dev") {
    "src/environments/environment.development.ts"
} else {
    "src/environments/environment.ts"
}

# Ensure the directory exists
if (-not (Test-Path "src/environments")) {
    New-Item -Path "src/environments" -ItemType Directory | Out-Null
}

# Create Angular environment file content
$content = @"
export const environment = {
  production: $(if ($env -eq "prod") { "true" } else { "false" }),
  apiUrl: '${envVars.FRONTEND_URL.Replace("http:", "").Replace("https:", "").TrimEnd("/")}',
  dbUrl: '${envVars.DB_URL}',
  dbUsername: '${envVars.DB_USERNAME}',
  dbPassword: '${envVars.DB_PASSWORD}',
  frontendUrl: '${envVars.FRONTEND_URL}'
};
"@

# Write to the target file
Set-Content -Path $targetFile -Value $content

Write-Host "Updated $targetFile with values from $envFile" -ForegroundColor Green

# Always update the default environment.ts file as well if not already updated
if ($targetFile -ne "src/environments/environment.ts") {
    Set-Content -Path "src/environments/environment.ts" -Value $content
    Write-Host "Also updated src/environments/environment.ts" -ForegroundColor Green
}

Write-Host "Angular environment files updated successfully!" -ForegroundColor Cyan 