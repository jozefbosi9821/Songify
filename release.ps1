# Release Script
param (
    [string]$type = "patch"
)

# 1. Pull latest changes
Write-Host "Pulling latest changes..."
git pull origin main

# 1.5. Check for uncommitted changes and commit them
$changes = git status --porcelain
if ($changes) {
    Write-Host "Uncommitted changes detected. Committing..."
    git add .
    git commit -m "chore: prepare for release"
}

# 2. Bump version (patch, minor, or major)
# This command updates package.json, commits the change, and creates a git tag
Write-Host "Bumping version ($type)..."
npm version $type

# 3. Push to GitHub
Write-Host "Pushing to GitHub..."
git push origin main
git push origin --tags

Write-Host "Done! GitHub Actions will now build and release your new version."
