# Release Script

# 1. Pull latest changes
Write-Host "Pulling latest changes..."
git pull origin main

# 2. Check for uncommitted changes and commit them
$changes = git status --porcelain
if ($changes) {
    Write-Host "Uncommitted changes detected. Committing..."
    git add .
    git commit -m "chore: prepare for release"
}

# 3. Get current version
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "Current version: $currentVersion"

# 4. Ask for new version
$newVersion = Read-Host "Enter new version (e.g., 1.2.0) or increment type (patch, minor, major) [Default: patch]"
if ([string]::IsNullOrWhiteSpace($newVersion)) {
    $newVersion = "patch"
}

# 5. Bump version
# This command updates package.json, commits the change, and creates a git tag
Write-Host "Bumping version to $newVersion..."
try {
    npm version $newVersion
} catch {
    Write-Error "Failed to update version. Please check your input."
    exit 1
}

# 6. Push to GitHub
Write-Host "Pushing to GitHub..."
git push origin main
git push origin --tags

Write-Host "Done! GitHub Actions will now build and release your new version."
