[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RequiredCommand {
    param([Parameter(Mandatory)][string]$Name)

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) {
        throw "Missing required command: $Name. See docs/local-development.md."
    }

    return $command
}

function Get-SemanticVersion {
    param(
        [Parameter(Mandatory)][string]$Value,
        [Parameter(Mandatory)][string]$Name
    )

    $tokens = $Value.Trim().Split(
        [char[]]@(' ', "`t"),
        [System.StringSplitOptions]::RemoveEmptyEntries
    )

    foreach ($token in $tokens) {
        $parts = $token.TrimStart([char[]]@('v', 'V')).Split('.')
        if ($parts.Length -lt 3) {
            continue
        }

        $major = 0
        $minor = 0
        $patch = 0
        if (
            [int]::TryParse($parts[0], [ref]$major) -and
            [int]::TryParse($parts[1], [ref]$minor) -and
            [int]::TryParse($parts[2], [ref]$patch)
        ) {
            return [version]::new($major, $minor, $patch)
        }
    }

    $preview = if ($Value.Length -le 120) { $Value } else { $Value.Substring(0, 120) + '...' }
    throw "Unable to parse the $Name version: $preview"
}

Get-RequiredCommand -Name node | Out-Null
Get-RequiredCommand -Name npm | Out-Null
Get-RequiredCommand -Name git | Out-Null

$nodeVersion = Get-SemanticVersion -Value ((& node --version).Trim()) -Name 'Node.js'
$npmVersion = Get-SemanticVersion -Value ((& npm --version).Trim()) -Name 'npm'
$gitVersion = Get-SemanticVersion -Value ((& git --version).Trim()) -Name 'Git'

if ($nodeVersion -lt [version]'24.0.0') {
    throw "Node.js $nodeVersion is unsupported. Fit Job requires Node.js >= 24.0.0."
}

if ($npmVersion -lt [version]'9.0.0') {
    throw "npm $npmVersion is unsupported. Fit Job requires npm >= 9.0.0."
}

if ($gitVersion -lt [version]'2.40.0') {
    throw "Git $gitVersion is unsupported. Fit Job requires Git >= 2.40.0."
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$packageManifest = Join-Path $repositoryRoot 'web/package.json'
if (-not (Test-Path -LiteralPath $packageManifest)) {
    throw "Missing project manifest: $packageManifest"
}

Write-Host 'Fit Job local environment check passed.' -ForegroundColor Green
Write-Host "Node.js : $nodeVersion"
Write-Host "npm     : $npmVersion"
Write-Host "Git     : $gitVersion"
Write-Host "Web app : $packageManifest"
