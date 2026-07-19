[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RequiredCommand {
    param([Parameter(Mandatory)][string]$Name)

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) {
        throw "Missing required command: $Name"
    }

    return $command
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$requiredPaths = @(
    'docs/architecture.md',
    'docs/local-development.md',
    'platform/app-manifest.example.yaml',
    'platform/model-inventory.md',
    'platform/kwc/README.md',
    'platform/java/README.md',
    'platform/ai/README.md'
)

Get-RequiredCommand -Name git | Out-Null

foreach ($relativePath in $requiredPaths) {
    $fullPath = Join-Path $repositoryRoot $relativePath
    if (-not (Test-Path -LiteralPath $fullPath)) {
        throw "Missing required repository baseline file: $relativePath"
    }
}

$obsoleteReactManifest = Join-Path $repositoryRoot 'web/package.json'
if (Test-Path -LiteralPath $obsoleteReactManifest) {
    throw 'Obsolete React/Vite frontend detected at web/package.json.'
}

$java = Get-Command java -ErrorAction SilentlyContinue
$maven = Get-Command mvn -ErrorAction SilentlyContinue
$javaVersion = if ($java) {
    (& cmd.exe /d /c 'java -version 2>&1' | Select-Object -First 1)
}
else {
    'not installed; use the target Cangqiong supported JDK'
}
$mavenVersion = if ($maven) {
    (& cmd.exe /d /c 'mvn --version 2>&1' | Select-Object -First 1)
}
else {
    'not installed; use the official generated Java project build tool'
}

Write-Host 'Fit Job repository baseline check passed.' -ForegroundColor Green
Write-Host "Git     : $((& git --version).Trim())"
Write-Host "Java    : $javaVersion"
Write-Host "Maven   : $mavenVersion"
Write-Host 'Manual  : verify Cangqiong tenant access, model permissions, KWC scaffold, and Java deployment in the target environment.'
