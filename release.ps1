# Songify Release Script (Closed Source)
# Builds app, creates version tag, and uploads .exe to GitHub Releases

Write-Host ""
Write-Host "╔════════════════════════════════════════╗"
Write-Host "║      Songify Release Tool (v2)         ║"
Write-Host "║    Closed Source Release Only          ║"
Write-Host "╚════════════════════════════════════════╝"
Write-Host ""

# ─────────────────────────────────────────
# 1. Get current version
# ─────────────────────────────────────────
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "Current version: $currentVersion"

# ─────────────────────────────────────────
# 2. Ask for new version
# ─────────────────────────────────────────
$newVersion = Read-Host "Enter new version (e.g., 1.3.6) or type (patch/minor/major) [Default: patch]"
if ([string]::IsNullOrWhiteSpace($newVersion)) {
    $newVersion = "patch"
}

Write-Host "Bumping to version: $newVersion..."

# ─────────────────────────────────────────
# 3. Build the app
# ─────────────────────────────────────────
Write-Host ""
Write-Host "Building Songify..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed!"
    exit 1
}

Write-Host "✓ Build successful"

# ─────────────────────────────────────────
# 4. Create electron installer (.exe)
# ─────────────────────────────────────────
Write-Host ""
Write-Host "Creating installer..."
npm run dist

if ($LASTEXITCODE -ne 0) {
    Write-Error "Installer creation failed!"
    exit 1
}

Write-Host "✓ Installer created"

# ─────────────────────────────────────────
# 5. Bump version in package.json
# ─────────────────────────────────────────
Write-Host ""
Write-Host "Bumping version..."
npm version $newVersion

if ($LASTEXITCODE -ne 0) {
    Write-Error "Version bump failed!"
    exit 1
}

# Get the new version
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$finalVersion = $packageJson.version
Write-Host "✓ Version bumped to $finalVersion"

# ─────────────────────────────────────────
# 6. Commit and tag
# ─────────────────────────────────────────
Write-Host ""
Write-Host "Committing to git..."
git add package.json package-lock.json
git commit -m "chore: release v$finalVersion"
git tag -a "v$finalVersion" -m "Release v$finalVersion"

# ─────────────────────────────────────────
# 7. Push to GitHub
# ─────────────────────────────────────────
Write-Host ""
Write-Host "Pushing to GitHub..."
git push origin main
git push origin --tags

if ($LASTEXITCODE -ne 0) {
    Write-Error "Git push failed!"
    exit 1
}

Write-Host "✓ Pushed to GitHub"

# ─────────────────────────────────────────
# 8. Find and upload .exe to GitHub Releases
# ─────────────────────────────────────────
Write-Host ""
Write-Host "Uploading installer to GitHub Releases..."

$exePath = Get-ChildItem -Path "release" -Filter "*.exe" -Recurse | Select-Object -First 1
if (-not $exePath) {
    Write-Error "No .exe file found in release/ folder!"
    exit 1
}

$exeFullPath = $exePath.FullName
$exeName = $exePath.Name

Write-Host "Found installer: $exeName"

# Create GitHub release with the .exe
$repoUrl = "https://api.github.com/repos/jozefbosi9821/Songify"
$ghToken = $env:GITHUB_TOKEN

if ([string]::IsNullOrWhiteSpace($ghToken)) {
    Write-Host ""
    Write-Host "⚠️  GITHUB_TOKEN not set. Manual upload required:"
    Write-Host "   1. Go to: https://github.com/jozefbosi9821/Songify/releases/new"
    Write-Host "   2. Select tag: v$finalVersion"
    Write-Host "   3. Upload this file: $exeFullPath"
    Write-Host ""
} else {
    # Create release
    $releaseBody = @{
        tag_name    = "v$finalVersion"
        name        = "Songify v$finalVersion"
        body        = "Release of Songify v$finalVersion. Download the installer below.`n`nFor changelog, see [CHANGELOG.md](https://github.com/jozefbosi9821/Songify/blob/main/CHANGELOG.md)"
        draft       = $false
        prerelease  = $false
    } | ConvertTo-Json

    Write-Host "Creating GitHub release..."
    $releaseResp = Invoke-RestMethod -Uri "$repoUrl/releases" -Method Post `
        -Headers @{ Authorization = "Bearer $ghToken"; "X-GitHub-Api-Version" = "2022-11-28" } `
        -Body $releaseBody -ContentType "application/json"

    $uploadUrl = $releaseResp.upload_url -replace '\{.*?\}', ''

    # Upload .exe
    Write-Host "Uploading $exeName..."
    $fileBytes = [System.IO.File]::ReadAllBytes($exeFullPath)
    
    Invoke-RestMethod -Uri "$uploadUrl`?name=$exeName" -Method Post `
        -Headers @{ Authorization = "Bearer $ghToken"; "X-GitHub-Api-Version" = "2022-11-28" } `
        -ContentType "application/octet-stream" `
        -Body $fileBytes | Out-Null

    Write-Host "✓ Release created and installer uploaded!"
}

Write-Host ""
Write-Host "╔════════════════════════════════════════╗"
Write-Host "║         Release Complete! ✓            ║"
Write-Host "╚════════════════════════════════════════╝"
Write-Host ""

    Write-Host "Backend changelog synced successfully!"
} catch {
    Write-Warning "Failed to sync backend changelog via API: $_"
}

# ─────────────────────────────────────────
# WEBHOOK STEPS
# ─────────────────────────────────────────
if ($doWebhook) {

    # Read version from package.json (works whether git ran or not)
    $updatedPackageJson = Get-Content "package.json" | ConvertFrom-Json
    $resolvedVersion = $updatedPackageJson.version

    # Read and parse CHANGELOG.md for the latest version entry
    Write-Host ""
    Write-Host "Reading CHANGELOG.md..."
    $changelogPath = "CHANGELOG.md"
    $changelogContent = ""

    if (Test-Path $changelogPath) {
        $lines = Get-Content $changelogPath
        $capture = $false
        $captured = [System.Collections.Generic.List[string]]::new()

        foreach ($line in $lines) {
            if (!$capture -and $line -match '^## ') {
                $capture = $true
                $captured.Add($line)
                continue
            }
            if ($capture -and $line -match '^## ') { break }
            if ($capture) { $captured.Add($line) }
        }

        while ($captured.Count -gt 0 -and [string]::IsNullOrWhiteSpace($captured[$captured.Count - 1])) {
            $captured.RemoveAt($captured.Count - 1)
        }

        $changelogContent = $captured -join "`n"
    } else {
        $changelogContent = "_No CHANGELOG.md found._"
        Write-Warning "CHANGELOG.md not found. Webhook will note this."
    }

    if ($changelogContent.Length -gt 4000) {
        $changelogContent = $changelogContent.Substring(0, 3997) + "..."
    }

    # Send Discord Webhook
    $webhookUrl = "https://discord.com/api/webhooks/1486835568724676609/W7ZEA9HyIrqJZbKDy7EIRDOEcixxOIXhBDud-TCpsf_gy5FBtOv32Ivj5TZdwHL_RtYT"

    $payload = @{
        content    = "<@&1440342652892741768>"
        embeds     = @(
            @{
                title       = "🎵 Songify Update"
                description = $changelogContent
                color       = 0x1DB954
                footer      = @{
                    text = "Songify v$resolvedVersion • Released via GitHub Actions"
                }
                timestamp   = (Get-Date -Format "o")
            }
        )
        components = @(
            @{
                type       = 1
                components = @(
                    @{
                        type  = 2
                        style = 5
                        label = "View Release on GitHub"
                        emoji = @{ name = "🚀" }
                        url   = "https://github.com/jozefbosi9821/Songify/releases/"
                    }
                )
            }
        )
    } | ConvertTo-Json -Depth 10

    Write-Host "Sending Discord webhook..."
    try {
        Invoke-RestMethod -Uri $webhookUrl -Method Post -Body $payload -ContentType "application/json"
        Write-Host "Discord notification sent!"
    } catch {
        Write-Warning "Failed to send Discord webhook: $_"
    }
}

# ─────────────────────────────────────────
Write-Host ""
Write-Host "All done!"