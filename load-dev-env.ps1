# PowerShell script to load development environment variables
Write-Host "Loading development environment variables..." -ForegroundColor Cyan

# Read each line from .env.dev file
Get-Content .env.dev | ForEach-Object {
    # Skip comments and empty lines
    if (!$_.StartsWith('#') -and $_.Trim() -ne '') {
        $key, $value = $_.Split('=', 2)
        # Set environment variable
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        Write-Host "Set $key" -ForegroundColor Green
    }
}

Write-Host "Development environment variables loaded." -ForegroundColor Cyan
Write-Host "You can now start the application with: java -jar target/coin-flip-casino-0.0.1-SNAPSHOT.jar" -ForegroundColor Yellow 