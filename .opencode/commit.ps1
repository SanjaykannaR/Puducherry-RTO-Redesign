param(
    [string]$Message = ""
)

$branch = git rev-parse --abbrev-ref HEAD
$status = git status --porcelain

if (-not $status) {
    Write-Host "Nothing to commit."
    exit 0
}

if (-not $Message) {
    $changed = @($status -split "`n" | Where-Object { $_ -match "^\s*[AMR]"}).Count
    $added = @($status -split "`n" | Where-Object { $_ -match "^\?\?"}).Count
    $modified = @($status -split "`n" | Where-Object { $_ -match "^\s*M"}).Count
    $deleted = @($status -split "`n" | Where-Object { $_ -match "^\s*D"}).Count
    $parts = @()
    if ($added -gt 0) { $parts += "+$added" }
    if ($modified -gt 0) { $parts += "~$modified" }
    if ($deleted -gt 0) { $parts += "-$deleted" }
    $Message = "auto: $($parts -join ' ') file(s) changed"
}

git add -A
git commit -m "$Message"
Write-Host "Committed to $branch : $Message"
