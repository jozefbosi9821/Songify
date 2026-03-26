# Release Script

# ─────────────────────────────────────────
# 0. Choose release mode
# ─────────────────────────────────────────
Write-Host ""
Write-Host "╔════════════════════════════════════╗"
Write-Host "║         Songify Release Tool        ║"
Write-Host "╠════════════════════════════════════╣"
Write-Host "║  [1] Full Release (Git + Webhook)   ║"
Write-Host "║  [2] Git Only                       ║"
Write-Host "║  [3] Webhook Only                   ║"
Write-Host "╚════════════════════════════════════╝"
Write-Host ""

$mode = Read-Host "Choose mode (1/2/3) [Default: 1]"
if ([string]::IsNullOrWhiteSpace($mode)) { $mode = "1" }

if ($mode -notin @("1", "2", "3")) {
    Write-Error "Invalid option. Please run the script again and choose 1, 2, or 3."
    exit 1
}

$doGit     = $mode -eq "1" -or $mode -eq "2"
$doWebhook = $mode -eq "1" -or $mode -eq "3"

# ─────────────────────────────────────────
# GIT STEPS
# ─────────────────────────────────────────
if ($doGit) {

    # 1. Pull latest changes
    Write-Host ""
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

    Write-Host "Git steps complete!"
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