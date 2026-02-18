# Script para enviar o projeto ao GitHub (Opção A)
# Execute no PowerShell nesta pasta: .\push-github.ps1

Set-Location $PSScriptRoot

$ErrorActionPreference = "Stop"

# Se ja tiver remote, atualiza; senao adiciona
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    git init
    git add .
    git status
    git commit -m "Primeiro commit - Modulo de Eventos"
    git branch -M main
    git remote add origin https://github.com/marianmv6/moduloeventos.git
} else {
    Write-Host "Remote origin ja existe. Adicionando alteracoes e enviando..." -ForegroundColor Cyan
    git add .
    git status
    git commit -m "Atualizacao - Modulo de Eventos" 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Host "(Nenhuma alteracao nova para commit)" -ForegroundColor Gray }
    git branch -M main
}

Write-Host "Enviando para o GitHub (branch: main)..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERRO no push. Verifique:" -ForegroundColor Red
    Write-Host "1. Usuario e senha (use Personal Access Token como senha)." -ForegroundColor Yellow
    Write-Host "2. GitHub -> Settings -> Developer settings -> Personal access tokens -> repo" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Pronto! Codigo enviado para https://github.com/marianmv6/moduloeventos" -ForegroundColor Green
Write-Host "Confira no GitHub se a pasta src e os arquivos aparecem. Depois conecte na Vercel." -ForegroundColor Yellow
