#!/bin/bash
# =============================================================
# PodSpace Club — Script de Deploy (Ubuntu 22.04 VPS)
# Uso: ./deploy.sh [--setup]
#   --setup  Instala todas as dependencias (rodar apenas na 1a vez)
# =============================================================

set -e

APP_DIR="/var/www/podspace"
REPO_URL="https://github.com/PodSpaceclub/hubpodspace.git"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC}  $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

# ── SETUP INICIAL (apenas na 1a vez) ─────────────────────────
if [[ "$1" == "--setup" ]]; then
  log "Atualizando o sistema..."
  apt-get update -qq && apt-get upgrade -y -qq

  log "Instalando Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs

  log "Instalando PM2..."
  npm install -g pm2 2>/dev/null

  log "Instalando Nginx..."
  apt-get install -y nginx

  log "Instalando Certbot (SSL)..."
  apt-get install -y certbot python3-certbot-nginx

  log "Clonando repositorio..."
  mkdir -p $APP_DIR
  git clone $REPO_URL $APP_DIR || true

  log "Setup concluido! Configure o .env antes de continuar:"
  echo ""
  echo "  cp $APP_DIR/.env.example $APP_DIR/.env"
  echo "  nano $APP_DIR/.env"
  echo ""
  echo "Depois rode: ./deploy.sh"
  exit 0
fi

# ── DEPLOY ────────────────────────────────────────────────────
log "Iniciando deploy do PodSpace..."

if [ ! -f "$APP_DIR/.env" ]; then
  err ".env nao encontrado em $APP_DIR. Copie o .env.example e preencha os valores."
fi

cd $APP_DIR

log "Atualizando codigo..."
git pull origin main

log "Instalando dependencias..."
npm ci --production=false

log "Gerando Prisma Client..."
npx prisma generate

log "Aplicando migracoes do banco..."
npx prisma db push

log "Fazendo build de producao..."
npm run build

log "Reiniciando servico com PM2..."
if pm2 describe podspace > /dev/null 2>&1; then
  pm2 reload podspace --update-env
else
  pm2 start npm --name "podspace" -- start
  pm2 save
  pm2 startup systemd -u root --hp /root 2>/dev/null || true
fi

log "Deploy concluido com sucesso!"
echo ""
pm2 status podspace
echo ""
echo "Acesse: https://podspaceclub.com.br"
