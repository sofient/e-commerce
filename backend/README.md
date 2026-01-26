# 🛍️ [STRANGERTHINGS] E-boutique - Backend API

Backend Node.js/Express pour la plateforme e-commerce [STRANGERTHINGS].

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- MongoDB 7.0+
- Redis 7+ (optionnel, pour cache)
- npm ou yarn

### Installation

```bash
# 1. Installer les dépendances
cd backend
npm install

# 2. Créer le fichier .env
cp .env.example .env

# 3. Configurer les variables d'environnement
# Éditer .env avec vos valeurs

# 4. Démarrer MongoDB et Redis (avec Docker)
cd ..
docker-compose up -d mongo redis

# 5. Alimenter la base de données
npm run seed

# 6. Démarrer le serveur
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 📦 Scripts disponibles

```bash
npm start          # Démarrer en production
npm run dev        # Démarrer en développement (nodemon)
npm run seed       # Alimenter la base de données
npm test           # Lancer les tests
npm run lint       # Vérifier le code
```

## 🔑 Configuration Snipcart

### 1. Créer un compte Snipcart

1. Aller sur [https://app.snipcart.com/](https://app.snipcart.com/)
2. Créer un compte (mode test gratuit)
3. Récupérer vos clés API dans Account > API Keys

### 2. Configurer les clés

Dans `.env`:
```bash
SNIPCART_API_KEY=pk_test_your_public_key
SNIPCART_SECRET_KEY=your_secret_key
SNIPCART_WEBHOOK_SECRET=your_webhook_secret
```

Dans `Index.html`:
```javascript
window.SnipcartSettings = {
    publicApiKey: "pk_test_your_public_key",
    // ...
}
```

### 3. Configurer les webhooks Snipcart

Dans le dashboard Snipcart (Account > Webhooks):

**Webhook URL:** `https://votre-domaine.com/api/v1/snipcart/webhooks`

**Événements à activer:**
- ✅ order.completed
- ✅ order.status.changed
- ✅ order.refund.created
- ✅ shippingrates.fetch

### 4. Tester l'intégration

Mode test Snipcart utilise des cartes de test:

**Carte valide:**
- Numéro: `4242 4242 4242 4242`
- Date: N'importe quelle date future
- CVV: N'importe quel 3 chiffres

## 🧪 Scénario de test - Remplir le panier

### Test 1: Achat simple (utilisateur invité)

```bash
# Étape 1: Obtenir les produits disponibles
curl -X GET http://localhost:3000/api/v1/products

# Étape 2: Ajouter au panier via Snipcart (frontend)
# Cliquer sur "Ajouter au panier" sur Index.html

# Étape 3: Remplir le formulaire Snipcart
# - Email: test@example.com
# - Nom complet: Test User
# - Adresse de livraison
# - Sexe: Homme/Femme (champ personnalisé)
# - Carte de test: 4242 4242 4242 4242

# Étape 4: Valider la commande
# Snipcart appelle automatiquement notre webhook
# La commande est créée dans MongoDB
```

### Test 2: Achat avec authentification

```bash
# Étape 1: S'inscrire
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Réponse contient accessToken et refreshToken

# Étape 2: Se connecter
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test123!"
  }'

# Étape 3: Créer une commande (API directe)
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_FROM_DB",
        "quantity": 2
      },
      {
        "productId": "ANOTHER_PRODUCT_ID",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Rue de la Paix",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France",
      "phone": "+33612345678"
    },
    "paymentMethod": "card"
  }'
```

### Test 3: Scénario complet automatisé

Créer un fichier `test-scenario.js`:

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';

async function runTestScenario() {
  console.log('🧪 Démarrage du scénario de test...\n');

  // 1. Inscription
  console.log('1️⃣  Inscription...');
  const registerRes = await axios.post(`${API_URL}/auth/register`, {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User'
  });
  const { accessToken } = registerRes.data.data;
  console.log('✅ Inscription réussie\n');

  // 2. Récupérer les produits
  console.log('2️⃣  Récupération des produits...');
  const productsRes = await axios.get(`${API_URL}/products`);
  const products = productsRes.data.data.products;
  console.log(`✅ ${products.length} produits trouvés\n`);

  // 3. Créer une commande avec 3 produits
  console.log('3️⃣  Création de la commande...');
  const orderRes = await axios.post(
    `${API_URL}/orders`,
    {
      items: [
        { productId: products[0]._id, quantity: 2 },
        { productId: products[1]._id, quantity: 1 },
        { productId: products[5]._id, quantity: 1 }
      ],
      shippingAddress: {
        fullName: 'Test User',
        street: '123 Rue Test',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
        phone: '+33612345678'
      },
      paymentMethod: 'card'
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
  const order = orderRes.data.data.order;
  console.log(`✅ Commande créée: ${order.orderNumber}`);
  console.log(`   Total: ${order.total}€`);
  console.log(`   Donation: ${order.donationAmount}€\n`);

  // 4. Vérifier le stock
  console.log('4️⃣  Vérification du stock...');
  const updatedProduct = await axios.get(`${API_URL}/products/${products[0]._id}`);
  console.log(`✅ Stock mis à jour: ${updatedProduct.data.data.product.stock}\n`);

  // 5. Récupérer mes commandes
  console.log('5️⃣  Récupération de mes commandes...');
  const myOrdersRes = await axios.get(`${API_URL}/orders`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log(`✅ ${myOrdersRes.data.data.orders.length} commande(s) trouvée(s)\n`);

  console.log('🎉 Scénario de test terminé avec succès!');
}

runTestScenario().catch(err => {
  console.error('❌ Erreur:', err.response?.data || err.message);
});
```

Exécuter:
```bash
node test-scenario.js
```

## 📡 Endpoints API

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Inscription | Public |
| POST | `/api/v1/auth/login` | Connexion | Public |
| POST | `/api/v1/auth/refresh` | Rafraîchir token | Public |
| POST | `/api/v1/auth/logout` | Déconnexion | Private |
| GET | `/api/v1/auth/me` | Profil utilisateur | Private |

### Produits

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/v1/products` | Liste produits (filtres) | Public |
| GET | `/api/v1/products/:id` | Détail produit | Public |
| POST | `/api/v1/products` | Créer produit | Admin |
| PUT | `/api/v1/products/:id` | Modifier produit | Admin |
| DELETE | `/api/v1/products/:id` | Supprimer produit | Admin |

### Commandes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/v1/orders` | Créer commande | Optional |
| GET | `/api/v1/orders` | Mes commandes | Private |
| GET | `/api/v1/orders/:id` | Détail commande | Private |
| PATCH | `/api/v1/orders/:id/status` | Mettre à jour statut | Admin |
| GET | `/api/v1/orders/track/:orderNumber` | Suivre commande | Public |

### Snipcart

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/v1/snipcart/webhooks` | Webhooks Snipcart | Snipcart |
| GET | `/api/v1/snipcart/products/:id` | Validation produit | Snipcart |
| GET | `/api/v1/snipcart/config` | Config publique | Public |

## 🔐 Sécurité

### Middleware de sécurité activés

- ✅ Helmet (protection headers HTTP)
- ✅ CORS (contrôle origines)
- ✅ Rate Limiting (anti DDoS)
- ✅ MongoDB Sanitization (anti NoSQL injection)
- ✅ HTTPS redirect (production)
- ✅ JWT Authentication
- ✅ Bcrypt password hashing

### Variables sensibles

**JAMAIS** committer ces valeurs dans git:
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `MONGO_URI` (production)
- `STRIPE_SECRET_KEY`
- `SNIPCART_SECRET_KEY`
- `SMTP_PASS`

### Comptes par défaut

Après `npm run seed`:

**Admin:**
- Email: `admin@cercle-eboutique.com`
- Password: `Admin123!`

**User test:**
- Email: `test@example.com`
- Password: `Test123!`

⚠️ **IMPORTANT:** Changer ces mots de passe en production!

## 🐳 Docker

### Démarrer avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build
```

Services inclus:
- **backend** - API Node.js (port 3000)
- **mongo** - MongoDB (port 27017)
- **redis** - Redis (port 6379)
- **mongo-express** - UI MongoDB (port 8081)

## 📊 Monitoring

### Logs

Les logs sont écrits dans:
- `logs/error.log` - Erreurs uniquement
- `logs/combined.log` - Tous les logs

### Health Check

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/health
```

## 🚀 Déploiement

### Variables d'environnement production

```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/cercle
FRONTEND_URL=https://cercle-eboutique.com
ACCESS_TOKEN_SECRET=<générer un secret fort>
REFRESH_TOKEN_SECRET=<générer un autre secret fort>
```

### Générer secrets forts

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Platforms recommandées

- **Render.com** - Simple, PostgreSQL inclus
- **Railway.app** - Déploiement automatique depuis Git
- **DigitalOcean App Platform** - $5/mois
- **Heroku** - Classique mais cher
- **AWS EC2 + RDS** - Production-grade

## 📝 TODO

- [ ] Implémenter envoi emails (Nodemailer configuré)
- [ ] Ajouter tests unitaires (Jest configuré)
- [ ] Système de reviews produits
- [ ] Dashboard admin complet
- [ ] Export commandes CSV
- [ ] Analytics et rapports

## 📞 Support

Pour toute question: contact@el-test.org
