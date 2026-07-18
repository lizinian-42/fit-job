[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-NodeVersion {
    param([Parameter(Mandatory)][string]$Executable)

    $rawVersion = (& $Executable --version).Trim()
    $parts = $rawVersion.TrimStart([char[]]@('v', 'V')).Split('.')
    if ($parts.Length -lt 3) {
        throw "Unable to parse the Node.js version: $rawVersion"
    }

    $major = 0
    $minor = 0
    $patch = 0
    if (
        -not [int]::TryParse($parts[0], [ref]$major) -or
        -not [int]::TryParse($parts[1], [ref]$minor) -or
        -not [int]::TryParse($parts[2], [ref]$patch)
    ) {
        throw "Unable to parse the Node.js version: $rawVersion"
    }

    return [version]::new($major, $minor, $patch)
}

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$portableBin = Join-Path $repositoryRoot '.tools/node'
$portableNode = Join-Path $portableBin 'node.exe'
$portableNpm = Join-Path $portableBin 'npm.cmd'

if ((Test-Path -LiteralPath $portableNode) -and (Test-Path -LiteralPath $portableNpm)) {
    $portableVersion = Get-NodeVersion -Executable $portableNode
    if ($portableVersion -lt [version]'24.0.0') {
        throw "The portable Node.js runtime is too old: $portableVersion"
    }

    $portablePath = $portableBin.TrimEnd('\')
    $pathContainsPortableRuntime = $false
    foreach ($pathEntry in $env:PATH.Split(';')) {
        if ([string]::Equals($pathEntry.TrimEnd('\'), $portablePath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $pathContainsPortableRuntime = $true
            break
        }
    }
    if (-not $pathContainsPortableRuntime) {
        $env:PATH = "$portableBin;$env:PATH"
    }
    Write-Host "Activated Fit Job portable Node.js $portableVersion." -ForegroundColor Green
    return
}

$systemNode = Get-Command node -ErrorAction SilentlyContinue
$systemNpm = Get-Command npm -ErrorAction SilentlyContinue
if ($systemNode -and $systemNpm) {
    $systemVersion = Get-NodeVersion -Executable $systemNode.Source
    if ($systemVersion -ge [version]'24.0.0') {
        Write-Host "Using system Node.js $systemVersion." -ForegroundColor Green
        return
    }
}

throw 'Node.js 24 is unavailable. Run scripts/setup-local-runtime.ps1 or install the version from .nvmrc.'
