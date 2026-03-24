$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$librarySource = Join-Path $root "frontend\node_modules\badwords-ko\src\badwords.ko.config.json"
$backendTargetDir = Join-Path $root "backend\src\main\resources\profanity"
$backendTarget = Join-Path $backendTargetDir "badwords-ko.json"

if (!(Test-Path $librarySource)) {
  throw "badwords-ko source not found: $librarySource. Run 'npm install' in frontend first."
}

New-Item -ItemType Directory -Force -Path $backendTargetDir | Out-Null
Copy-Item -Path $librarySource -Destination $backendTarget -Force

Write-Output "Synced badwords-ko source to backend: $backendTarget"
