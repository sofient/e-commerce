# 🚀 Guide de démarrage - [STRANGERTHINGS] E-boutique

## 📋 Ce qui a été fait

### ✅ Design Frontend
- [Index.html](Index.html) amélioré avec design Apple Store
- [css/site.css](css/site.css) redesign complet :
  - Typographie Apple (SF Pro)
  - Couleurs Apple (#f5f5f7, #0071e3)
  - Glassmorphism header
  - Transitions smooth (cubic-bezier)
  - Responsive mobile-first
  - Hover effects sur cartes et boutons

### ✅ Backend API complet
Architecture Node.js/Express/MongoDB avec:

**Configuration & Infrastructure:**
- `backend/package.json` - Dépendances complètes
- `backend/.env.example` - Template configuration
- `backend/Dockerfile` - Containerisation
- `docker-compose.yml` - MongoDB + Redis + Backend
- `backend/src/config/database.js` - Connexion MongoDB
- `backend/src/utils/logger.js` - Winston logging

**Modèles de données:**
- `backend/src/models/User.js` - Utilisateurs avec auth JWT
- `backend/src/models/Product.js` - Produits avec stock
- `backend/src/models/Order.js` - Commandes avec calcul donation

**Sécurité:**
- `backend/src/middleware/security.js` - Helmet, CORS, rate limiting
- `backend/src/middleware/auth.js` - JWT verification, roles
- Bcrypt password hashing
- MongoDB sanitization (anti NoSQL injection)

**API Endpoints:**
- `backend/src/routes/auth.js` - Inscription/connexion
- `backend/src/routes/products.js` - CRUD produits
- `backend/src/routes/orders.js` - Gestion commandes
- `backend/src/routes/snipcart.js` - Webhooks Snipcart
- `backend/src/controllers/authController.js` - Logique auth

**Scripts utiles:**
- `backend/src/scripts/seed.js` - Alimenter DB avec 10 produits

**Serveur:**
- `backend/src/server.js` - Express app complet avec error handling

### ✅ Intégration Snipcart
- Configuration dans [Index.html](Index.html)
- Champs personnalisés (sexe, message cadeau)
- Webhooks pour synchronisation commandes
- Validation produits backend
- Calcul frais de livraison dynamique

### ✅ Documentation
- [README.md](README.md) - Documentation principale
- [backend/README.md](backend/README.md) - Guide API complet
- [TEST_SCENARIO.md](TEST_SCENARIO.md) - Tests détaillés
- Ce fichier - Guide de démarrage

---

## 🎯 Prochaines étapes

### 1️⃣ Configurer Snipcart (15 min)

**Actions:**
1. Créer compte sur [app.snipcart.com](https://app.snipcart.com/)
2. Récupérer clés API (mode test gratuit)
3. Configurer dans `backend/.env`:
   ```bash
   SNIPCART_API_KEY=pk_test_votre_cle
   SNIPCART_SECRET_KEY=votre_secret
   ```
4. Configurer dans [Index.html](Index.html) ligne 264:
   ```javascript
   publicApiKey: "pk_test_votre_cle"
   ```

**Référence:** [Snipcart Documentation](https://docs.snipcart.com/v3/setup/installation)

---

### 2️⃣ Démarrer le backend (10 min)

**Actions:**
```bash
# Terminal 1: Démarrer Docker (MongoDB + Redis)
docker-compose up -d

# Vérifier que les conteneurs sont lancés
docker ps

# Terminal 2: Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs (voir étape 1)
npm run seed
npm run dev
```

**Test:**
```bash
curl http://localhost:3000/health
# Réponse: {"success":true,"message":"API [STRANGERTHINGS] E-boutique - En ligne ✅"}
```

---

### 3️⃣ Tester le frontend (5 min)

**Actions:**
```bash
# Terminal 3: Frontend
npx serve .
# Ou ouvrir directement Index.html dans le navigateur
```

**Tests:**
1. Ouvrir [http://localhost:3000](http://localhost:3000)
2. Vérifier que les 10 produits s'affichent
3. Cliquer sur "Ajouter au panier"
4. Modal Snipcart doit s'ouvrir

---

### 4️⃣ Test achat complet (10 min)

Suivre [TEST_SCENARIO.md](TEST_SCENARIO.md) section "Test 3: Processus de Checkout"

**Carte de test:**
- Numéro: `4242 4242 4242 4242`
- Date: `12/26`
- CVV: `123`

**Vérification:**
```bash
# MongoDB - Voir la commande
docker exec -it cercle-mongo mongosh
use cercle_ecommerce
db.orders.find().pretty()
```

---

## 🔧 Configuration avancée

### Configurer les webhooks Snipcart

**Quand le backend est en production (déployé):**

1. Dashboard Snipcart > Account > Webhooks
2. URL: `https://votre-domaine.com/api/v1/snipcart/webhooks`
3. Activer événements:
   - ✅ order.completed
   - ✅ order.status.changed
   - ✅ shippingrates.fetch

### Générer secrets JWT sécurisés

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier dans `.env`:
```bash
ACCESS_TOKEN_SECRET=<généré ci-dessus>
REFRESH_TOKEN_SECRET=<générer un autre>
```

### Configurer emails (optionnel)

Dans `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application
```

**Pour Gmail:**
1. Activer "Authentification à deux facteurs"
2. Générer "Mot de passe d'application"
3. Utiliser ce mot de passe dans SMTP_PASS

---

## 🐛 Dépannage

### Problème: MongoDB ne démarre pas

**Solution:**
```bash
docker-compose down
docker volume prune
docker-compose up -d
```

### Problème: Port 3000 déjà utilisé

**Solution:**
```bash
# Trouver le processus
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Tuer le processus ou changer le port dans .env
PORT=3001
```

### Problème: Snipcart ne s'ouvre pas

**Vérifications:**
1. Clé API correcte dans Index.html
2. Pas d'erreurs console navigateur (F12)
3. CDN Snipcart accessible (vérifier internet)

### Problème: Erreur CORS

**Solution:**
Dans `backend/.env`:
```bash
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```

### Problème: JWT Token expiré

**Normal!** Les access tokens expirent après 15 minutes.

**Solution:**
Utiliser le refresh token pour obtenir un nouveau access token:
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"VOTRE_REFRESH_TOKEN"}'
```

---

## 📱 Tester sur mobile

### Option 1: ngrok (expose local à internet)

```bash
# Installer ngrok
npm install -g ngrok

# Exposer le backend
ngrok http 3000

# Mettre à jour FRONTEND_URL dans .env avec l'URL ngrok
```

### Option 2: Même réseau local

1. Trouver votre IP locale:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Accéder depuis mobile:
   ```
   http://192.168.X.X:3000
   ```

---

## 🚀 Déployer en production

### Backend: Railway.app (recommandé)

1. Push code sur GitHub
2. Créer compte [railway.app](https://railway.app/)
3. New Project > Deploy from GitHub
4. Ajouter MongoDB (Railway PostgreSQL ou MongoDB Atlas externe)
5. Configurer variables d'environnement
6. Déployer ✅

### Frontend: Vercel

1. Push code sur GitHub
2. Créer compte [vercel.com](https://vercel.com/)
3. New Project > Import Git Repository
4. Déployer ✅

### Base de données: MongoDB Atlas

1. Créer compte [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créer cluster gratuit (M0)
3. Obtenir connection string
4. Mettre dans `MONGO_URI` en production

---

## ✅ Checklist de lancement

- [ ] Backend démarre sans erreurs
- [ ] Seed base de données effectué (10 produits)
- [ ] Frontend affiche les produits
- [ ] Snipcart s'ouvre au clic
- [ ] Achat test réussi avec carte 4242...
- [ ] Commande apparaît dans MongoDB
- [ ] Stock décrémenté automatiquement
- [ ] Login/Register fonctionnels
- [ ] Panel admin accessible (admin@cercle-eboutique.com)

---

## 📚 Ressources

**Snipcart:**
- [Documentation](https://docs.snipcart.com/v3/)
- [Webhooks](https://docs.snipcart.com/v3/webhooks/)
- [Customisation](https://docs.snipcart.com/v3/setup/customization)

**Stripe (paiements):**
- [Cartes de test](https://stripe.com/docs/testing)

**MongoDB:**
- [Mongoose docs](https://mongoosejs.com/docs/)
- [Atlas setup](https://www.mongodb.com/docs/atlas/getting-started/)

**Node.js/Express:**
- [Express.js](https://expressjs.com/)
- [JWT](https://jwt.io/)

---

## 💡 Améliorations futures

### Court terme
- [ ] Envoi emails automatiques (confirmation, expédition)
- [ ] Dashboard admin UI (Vue.js ou React)
- [ ] Filtres et recherche produits avancés
- [ ] Système de reviews produits
- [ ] Wishlist

### Moyen terme
- [ ] Analytics (Google Analytics, Plausible)
- [ ] Codes promo et coupons de réduction
- [ ] Programme de fidélité
- [ ] Export commandes CSV/Excel
- [ ] Multi-langue (FR/EN/AR)

### Long terme
- [ ] Application mobile (React Native)
- [ ] Live chat support
- [ ] Recommandations produits IA
- [ ] Intégration comptabilité (Stripe Tax)
- [ ] Multi-devise

---

## 🆘 Support

**Problème technique?**
- Consulter [TEST_SCENARIO.md](TEST_SCENARIO.md)
- Vérifier les logs: `docker-compose logs -f backend`
- Issues GitHub: [votre-repo/issues](https://github.com/votre-repo/issues)

**Questions?**
- Email: contact@el-mouahidine.org
- Documentation: [README.md](README.md)

---

**Bon courage! 🚀**
