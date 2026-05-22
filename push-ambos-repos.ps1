# Envia o mesmo código para regrasdetratativas e moduloeventos (dois deploys Vercel)
Set-Location $PSScriptRoot
$ErrorActionPreference = "Stop"

$msg = if ($args[0]) { $args[0] } else { "Deploy producao - regras de tratativa (ambos repos)" }

git add .
git status
git commit -m $msg
if ($LASTEXITCODE -ne 0) {
  Write-Host "(Nenhuma alteracao nova para commit)" -ForegroundColor Gray
}

git push origin main
if ($LASTEXITCODE -ne 0) { exit 1 }

$modulo = git remote get-url moduloeventos 2>$null
if ($LASTEXITCODE -ne 0) {
  git remote add moduloeventos https://github.com/marianmv6/moduloeventos.git
}
git push moduloeventos main
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "Pronto! Mesma versao em:" -ForegroundColor Green
Write-Host "  https://regrasdetratativas.vercel.app" -ForegroundColor Cyan
Write-Host "  https://moduloeventos.vercel.app" -ForegroundColor Cyan
