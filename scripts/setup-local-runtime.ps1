[CmdletBinding()]
param(
    [string]$NodeExecutable,
    [string]$NpmDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function ConvertTo-SemanticVersion {
    param([Parameter(Mandatory)][string]$Value)

    $parts = $Value.Trim().TrimStart([char[]]@('v', 'V')).Split('.')
    if ($parts.Length -lt 3) {
        return $null
    }

    $major = 0
    $minor = 0
    $patch = 0
    if (
        -not [int]::TryParse($parts[0], [ref]$major) -or
        -not [int]::TryParse($parts[1], [ref]$minor) -or
        -not [int]::TryParse($parts[2], [ref]$patch)
    ) {
        return $null
    }

    return [version]::new($major, $minor, $patch)
}

function Get-CompatibleNode {
    param([string]$ExplicitPath)

    $candidates = @()
    if ($ExplicitPath) {
        $candidates += $ExplicitPath
    }

    $systemNode = Get-Command node -ErrorAction SilentlyContinue
    if ($systemNode) {
        $candidates += $systemNode.Source
    }

    $candidates += (Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe')

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate)) {
            continue
        }

        $version = ConvertTo-SemanticVersion -Value ((& $candidate --version).Trim())
        if ($version -and $version -ge [version]'24.0.0') {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    throw 'No compatible Node.js 24 runtime was found. Install the version from .nvmrc first.'
}

function Get-NpmDirectory {
    param([string]$ExplicitPath)

    if ($ExplicitPath) {
        $candidate = $ExplicitPath
    }
    else {
        $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
        if (-not $npmCommand) {
            throw 'npm.cmd was not found. Install npm before creating the portable runtime.'
        }
        $candidate = Split-Path -Parent $npmCommand.Source
    }

    $npmPackage = Join-Path $candidate 'node_modules/npm'
    if (-not (Test-Path -LiteralPath $npmPackage)) {
        throw "npm package files were not found under $candidate"
    }

    return (Resolve-Path -LiteralPath $candidate).Path
}

function Assert-ChildPath {
    param(
        [Parameter(Mandatory)][string]$Parent,
        [Parameter(Mandatory)][string]$Child
    )

    $parentPath = [System.IO.Path]::GetFullPath($Parent).TrimEnd('\') + '\'
    $childPath = [System.IO.Path]::GetFullPath($Child)
    if (-not $childPath.StartsWith($parentPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to modify a path outside $parentPath"
    }
}

$nodeSource = Get-CompatibleNode -ExplicitPath $NodeExecutable
$npmSource = Get-NpmDirectory -ExplicitPath $NpmDirectory
$npmCliSource = Join-Path $npmSource 'node_modules/npm/bin/npm-cli.js'
$npmVersion = ConvertTo-SemanticVersion -Value ((& $nodeSource $npmCliSource --version).Trim())
if (-not $npmVersion -or $npmVersion -lt [version]'9.0.0') {
    throw 'The selected npm installation is not compatible with the selected Node.js runtime.'
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$toolsRoot = Join-Path $repositoryRoot '.tools'
$target = Join-Path $toolsRoot 'node'
$staging = Join-Path $toolsRoot "node.stage.$PID"
Assert-ChildPath -Parent $toolsRoot -Child $target
Assert-ChildPath -Parent $toolsRoot -Child $staging
New-Item -ItemType Directory -Force -Path $toolsRoot | Out-Null

try {
    if (Test-Path -LiteralPath $staging) {
        Remove-Item -LiteralPath $staging -Recurse -Force
    }

    $stagingNpmPackage = Join-Path $staging 'node_modules/npm'
    New-Item -ItemType Directory -Force -Path $stagingNpmPackage | Out-Null
    Copy-Item -LiteralPath $nodeSource -Destination (Join-Path $staging 'node.exe') -Force
    Copy-Item -LiteralPath (Join-Path $npmSource 'npm') -Destination $staging -Force
    Copy-Item -LiteralPath (Join-Path $npmSource 'npm.cmd') -Destination $staging -Force
    Copy-Item -LiteralPath (Join-Path $npmSource 'npx') -Destination $staging -Force
    Copy-Item -LiteralPath (Join-Path $npmSource 'npx.cmd') -Destination $staging -Force
    Copy-Item -Path (Join-Path $npmSource 'node_modules/npm/*') -Destination $stagingNpmPackage -Recurse -Force

    $stagedNode = Join-Path $staging 'node.exe'
    $stagedNpmCli = Join-Path $staging 'node_modules/npm/bin/npm-cli.js'
    $stagedNodeVersion = ConvertTo-SemanticVersion -Value ((& $stagedNode --version).Trim())
    $stagedNpmVersion = ConvertTo-SemanticVersion -Value ((& $stagedNode $stagedNpmCli --version).Trim())
    if ($stagedNodeVersion -lt [version]'24.0.0' -or $stagedNpmVersion -lt [version]'9.0.0') {
        throw 'The staged portable runtime failed version validation.'
    }

    if (Test-Path -LiteralPath $target) {
        Remove-Item -LiteralPath $target -Recurse -Force
    }
    Move-Item -LiteralPath $staging -Destination $target
}
catch {
    if (Test-Path -LiteralPath $staging) {
        Remove-Item -LiteralPath $staging -Recurse -Force
    }
    throw
}

Write-Host "Portable Node.js $stagedNodeVersion and npm $stagedNpmVersion created at $target" -ForegroundColor Green
Write-Host 'Dot-source scripts/activate-environment.ps1 before running npm commands.'
