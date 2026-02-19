# Backup do projeto DHC (Modulo de eventos)
# Execute no PowerShell na pasta "Modulo de eventos" ou na pasta "DHC".
# O backup sera criado na mesma pasta que contem "DHC" (ex: Area de Trabalho).

$ErrorActionPreference = "Stop"
$scriptDir = $PSScriptRoot
$projectName = "DHC"

# Se o script esta dentro de "Modulo de eventos", sobe para DHC
if ($scriptDir -match "Modulo de eventos$") {
    $dhcRoot = Split-Path $scriptDir -Parent
} else {
    $dhcRoot = $scriptDir
}

$parentDir = Split-Path $dhcRoot -Parent
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmm"
$backupName = "${projectName}-backup-${timestamp}"
$backupPath = Join-Path $parentDir $backupName

if (-not (Test-Path $dhcRoot)) {
    Write-Host "Pasta do projeto nao encontrada: $dhcRoot" -ForegroundColor Red
    exit 1
}

Write-Host "Origem: $dhcRoot" -ForegroundColor Cyan
Write-Host "Backup: $backupPath" -ForegroundColor Cyan
Write-Host "Excluindo node_modules para economizar espaco (npm install restaura)..." -ForegroundColor Gray
Write-Host ""

New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
$result = robocopy $dhcRoot $backupPath /E /XD node_modules /NFL /NDL /NJH /NJS /NC /NS /R:1 /W:1

# Robocopy exit codes: 0-7 = success, 8+ = had errors
if ($LASTEXITCODE -ge 8) {
    Write-Host "Erro ao copiar. Codigo: $LASTEXITCODE" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Backup concluido com sucesso!" -ForegroundColor Green
Write-Host "Pasta: $backupPath" -ForegroundColor Green
Write-Host ""
Write-Host "Para restaurar: copie o conteudo dessa pasta de volta para DHC ou renomeie a pasta." -ForegroundColor Yellow
