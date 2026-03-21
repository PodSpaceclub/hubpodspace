# PodSpace Club — Hub de Parceiros

Marketplace premium que conecta parceiros locais ao universo dos podcasts.
Parceiros cadastram suas lojas e produtos; ouvintes compram diretamente pelo link do episódio.

---

## Stack Tecnológico

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Linguagem** | TypeScript |
| **Estilização** | Tailwind CSS + shadcn/ui |
| **Banco de dados** | SQLite (dev/VPS) · PostgreSQL (opcional) |
| **ORM** | Prisma |
| **Autenticação** | NextAuth.js (credentials provider) |
| **Pagamentos** | Stripe (PaymentIntent + Webhooks) |
| **QR Codes** | qrcode (canvas) |
| **Charts** | Recharts |

---

## Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Stripe](https://stripe.com) (para pagamentos)

---

## Instalação e Setup Local

```bash
# 1. Clonar o repositório
git clone https://github.com/podspaceclub/hub-parceiros
cd hub-parceiros

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves

# 4. Criar e popular o banco de dados
npx prisma db push
npm run db:seed

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:3000`

---

## Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="gere-com-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

NEXT_PUBLIC_APP_URL="https://podspaceclub.com.br"
```

> **Gerar NEXTAUTH_SECRET seguro:**
> ```bash
> openssl rand -base64 32
> ```

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Verificar erros de linting |
| `npm run db:push` | Aplicar schema Prisma ao banco |
| `npm run db:seed` | Popular banco com dados iniciais |
| `npm run db:studio` | Abrir Prisma Studio (porta 5555) |

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (admin)/          # Rotas protegidas — painel admin
│   │   └── admin/
│   │       ├── page.tsx         # Dashboard admin
│   │       ├── partners/        # Gestão de parceiros
│   │       └── sales/           # Relatórios de vendas
│   ├── (auth)/           # Rotas de autenticação
│   │   ├── login/
│   │   └── register/
│   ├── (partner)/        # Rotas protegidas — painel do parceiro
│   │   └── dashboard/
│   │       ├── page.tsx         # Dashboard do parceiro
│   │       ├── products/        # Gestão de produtos
│   │       ├── orders/          # Pedidos recebidos
│   │       └── profile/         # Perfil da loja
│   ├── (store)/          # Rotas públicas — marketplace
│   │   ├── loja/                # Listagem de parceiros
│   │   └── store/[slug]/        # Loja individual
│   ├── checkout/         # Fluxo de compra
│   │   ├── page.tsx             # Checkout (Stripe Elements)
│   │   └── success/             # Confirmação + WhatsApp
│   └── api/              # API Routes
│       ├── auth/                # NextAuth handler
│       ├── partners/            # CRUD parceiros
│       ├── products/            # CRUD produtos
│       ├── orders/              # Criar e listar pedidos
│       ├── tracking/            # Códigos de rastreamento
│       ├── store/[slug]/        # Dados públicos da loja
│       ├── admin/stats/         # Estatísticas do admin
│       └── stripe/webhook/      # Webhook Stripe
├── components/
│   ├── admin/            # Componentes do painel admin
│   ├── consumer/         # Componentes da loja pública
│   ├── layout/           # Sidebar, Header, MobileNav
│   └── ui/               # Primitivos shadcn/ui
├── lib/
│   ├── auth.ts           # Configuração NextAuth
│   ├── db.ts             # Singleton Prisma
│   ├── stripe.ts         # Stripe client + helpers
│   └── utils.ts          # Utilitários gerais
├── middleware.ts          # Proteção de rotas /admin e /dashboard
prisma/
├── schema.prisma         # Modelos do banco de dados
└── seed.ts               # Dados iniciais
public/
├── isotipo-branco.svg    # Logo — isotipo branco (fundos escuros)
├── isotipo-preto.svg     # Logo — isotipo preto (fundos claros)
├── logo-principal-branco.svg
└── logo-principal-preto.svg
```

---

## Modelos do Banco de Dados

```
User         → autenticação (email/senha/role)
Partner      → loja do parceiro (slug, categoria, status)
Product      → produtos da loja
Order        → pedido do cliente (stripeId, status)
OrderItem    → itens do pedido
TrackingCode → códigos QR para rastrear origem de compras
Settings     → configurações chave-valor
```

**Status do pedido:** `PENDING → PAID → PROCESSING → DELIVERED` (ou `CANCELLED`)

---

## Fluxo de Pagamento (Stripe)

```
1. Cliente adiciona produtos ao carrinho na loja do parceiro
2. Vai para /checkout → preenche nome, email, WhatsApp
3. Sistema cria Order (PENDING) + PaymentIntent no Stripe
4. Cliente preenche dados do cartão no Stripe PaymentElement
5. stripe.confirmPayment() processa o pagamento
6. Webhook /api/stripe/webhook recebe payment_intent.succeeded
7. Order atualizada para PAID no banco
8. Cliente redirecionado para /checkout/success com link WhatsApp
```

**Cartão de teste Stripe:** `4242 4242 4242 4242` | Validade: qualquer data futura | CVV: qualquer 3 dígitos

---

## Configurar Webhook do Stripe (após deploy)

1. Acesse o [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Clique em **Add endpoint**
3. URL: `https://podspaceclub.com.br/api/stripe/webhook`
4. Eventos a escutar:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copie o **Signing secret** gerado
6. Adicione ao `.env` no servidor: `STRIPE_WEBHOOK_SECRET=whsec_...`
7. Reinicie o servidor: `pm2 restart podspace`

---

## Deploy em VPS

### Requisitos do servidor
- Ubuntu 20.04+ (ou equivalente)
- Node.js 18+
- PM2: `npm install -g pm2`
- Nginx
- Certbot (Let's Encrypt)

### Passos

```bash
# 1. Clonar e configurar
git clone https://github.com/podspaceclub/hub-parceiros /var/www/podspace
cd /var/www/podspace
cp .env.example .env
nano .env  # preencher variáveis de produção

# 2. Deploy
chmod +x deploy.sh
./deploy.sh

# 3. Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/podspaceclub.com.br
sudo ln -s /etc/nginx/sites-available/podspaceclub.com.br /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. SSL com Let's Encrypt
sudo certbot --nginx -d podspaceclub.com.br -d www.podspaceclub.com.br

# 5. PM2 — iniciar com o sistema
pm2 startup
pm2 save
```

### Atualizar após mudanças

```bash
git pull origin main
./deploy.sh
```

---

## Acesso Inicial (após seed)

| Perfil | Email | Senha |
|---|---|---|
| **Admin** | admin@podspace.club | admin123 |
| **Parceiro demo** | cafe@podspace.club | partner123 |

> ⚠️ Altere as senhas imediatamente após o primeiro login em produção.

---

## Identidade Visual

| Elemento | Valor |
|---|---|
| **Azul elétrico** | `#3B3BFF` |
| **Laranja** | `#E85A00` |
| **Verde neon** | `#55FF33` |
| **Rosa** | `#FF33CC` |
| **Fonte display** | Barlow Condensed (Google Fonts) |
| **Fonte corpo** | Inter |

---

## Licença

Proprietário — PodSpace Club © 2025. Todos os direitos reservados.
