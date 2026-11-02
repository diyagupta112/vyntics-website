$ErrorActionPreference = "Stop"

$apiRoot = $PSScriptRoot
$frontendRoot = [IO.Path]::GetFullPath((Join-Path $apiRoot "../../frontend"))
$pythonPath = Join-Path $apiRoot ".venv/Scripts/python.exe"
$configPath = Join-Path $apiRoot ".env.sitemap.local"
$nodePath = (Get-Command node -ErrorAction Stop).Source
$nextPath = Join-Path $frontendRoot "node_modules/next/dist/bin/next"

if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "The API virtual environment must be installed before activation."
}

if (-not (Test-Path -LiteralPath $configPath)) {
    $randomBytes = New-Object byte[] 32
    $randomGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $randomGenerator.GetBytes($randomBytes) } finally { $randomGenerator.Dispose() }
    $localSecret = [BitConverter]::ToString($randomBytes).Replace("-", "").ToLowerInvariant()
    [IO.File]::WriteAllLines($configPath, @(
        "# Local activation only. This file is ignored by Git."
        "NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000"
        "API_BASE_URL=http://127.0.0.1:8000"
        "SITEMAP_REVALIDATION_SECRET=$localSecret"
    ))
}

$previousValues = @{}
$allowedKeys = @("NEXT_PUBLIC_SITE_URL", "API_BASE_URL", "SITEMAP_REVALIDATION_SECRET")
foreach ($line in Get-Content -LiteralPath $configPath) {
    if ($line -match "^\s*(#|$)") { continue }
    $parts = $line.Split("=", 2)
    if ($parts.Count -ne 2 -or $parts[0] -notin $allowedKeys) {
        throw "Unexpected local activation setting."
    }
    $previousValues[$parts[0]] = [Environment]::GetEnvironmentVariable($parts[0], "Process")
    [Environment]::SetEnvironmentVariable($parts[0], $parts[1], "Process")
}

function Wait-ForHealth([string] $Url) {
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $result = Invoke-WebRequest $Url -NoProxy -TimeoutSec 2
            if ($result.StatusCode -eq 200) { return }
        } catch { }
        Start-Sleep -Milliseconds 500
    }
    throw "Local service did not become ready at $Url. Check the new log files under apps/api/.venv."
}

try {
    $logPrefix = Join-Path $apiRoot (".venv/sitemap-local-" + (Get-Date -Format "yyyyMMdd-HHmmss-fff"))
    $apiListener = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($apiListener) {
        $apiOwner = Get-CimInstance Win32_Process -Filter "ProcessId=$($apiListener.OwningProcess)"
        if (-not $apiOwner.CommandLine.Contains("app.sitemap_main:app") -or
            $apiOwner.CommandLine.IndexOf($apiRoot, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "Port 8000 belongs to another service; it was left running."
        }
        Stop-Process -Id $apiOwner.ProcessId -Force
    }
    $apiProcess = Start-Process -FilePath $pythonPath -ArgumentList @(
        "-B", "-m", "uvicorn", "app.sitemap_main:app", "--host", "127.0.0.1", "--port", "8000"
    ) -WorkingDirectory $apiRoot -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput "$logPrefix-api.stdout.log" -RedirectStandardError "$logPrefix-api.stderr.log"
    Wait-ForHealth "http://127.0.0.1:8000/health"

    $frontendListener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($frontendListener) {
        $frontendOwner = Get-CimInstance Win32_Process -Filter "ProcessId=$($frontendListener.OwningProcess)"
        if ($frontendOwner.CommandLine.IndexOf($frontendRoot, [StringComparison]::OrdinalIgnoreCase) -lt 0) {
            throw "Port 3000 belongs to another service; it was left running."
        }
        $frontendParent = Get-CimInstance Win32_Process -Filter "ProcessId=$($frontendOwner.ParentProcessId)"
        Stop-Process -Id $frontendOwner.ProcessId -Force
        if ($frontendParent -and $frontendParent.CommandLine.IndexOf($frontendRoot, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
            Stop-Process -Id $frontendParent.ProcessId -Force -ErrorAction SilentlyContinue
        }
    }
    $frontendProcess = Start-Process -FilePath $nodePath -ArgumentList @(
        ('"' + $nextPath + '"'), "dev", "--hostname", "127.0.0.1", "--port", "3000"
    ) -WorkingDirectory $frontendRoot -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput "$logPrefix-web.stdout.log" -RedirectStandardError "$logPrefix-web.stderr.log"

    # Wait for a cheap endpoint before invoking the protected trigger.
    Wait-ForHealth "http://127.0.0.1:3000/robots.txt"
    $trigger = Invoke-WebRequest "http://127.0.0.1:3000/api/revalidate-sitemap" -Method Post `
        -Headers @{ Authorization = "Bearer $env:SITEMAP_REVALIDATION_SECRET" } -NoProxy -TimeoutSec 30
    [pscustomobject]@{
        ApiHealth = "HTTP 200"
        Trigger = "HTTP $($trigger.StatusCode)"
        ApiProcessId = $apiProcess.Id
        FrontendProcessId = $frontendProcess.Id
        LocalConfig = $configPath
    }
} finally {
    foreach ($key in $previousValues.Keys) {
        [Environment]::SetEnvironmentVariable($key, $previousValues[$key], "Process")
    }
}
