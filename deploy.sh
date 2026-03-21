#!/bin/bash
# ==============================================
# PodSpace Club — Script de Deploy (VPS)
# ==============================================
# Uso: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 Iniciando deploy do PodSpace Club..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm ci --production=false

# 2. Gerar cliente Prisma
echo "🗄️  Gerando cliente Prisma..."
npx prisma generate

# 3. Aplicar migrações de schema
echo "🗄️  Aplicando schema do banco de dados..."
npx prisma db push

# 4. Build de produção
echo "🔨 Construindo aplicação..."
npm run build

# 5. Criar pasta de logs se não existir
mkdir -p logs

# 6. Reiniciar ou iniciar o servidor PM2
echo "⚡ Iniciando servidor..."
pm2 restart podspace 2>/dev/null || pm2 start ecosystem.config.js

echo "✅ Deploy concluído! Aplicação rodando na porta 3000."
echo "   Verifique com: pm2 status"
