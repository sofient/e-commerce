# ⚡ Quick Start - Lancement en 10 minutes

## 🎯 But

Avoir le site e-commerce fonctionnel en 10 minutes.

## ✅ Prérequis

- [x] Node.js 18+ installé ([nodejs.org](https://nodejs.org/))
- [x] Docker Desktop installé ([docker.com](https://www.docker.com/))
- [x] Terminal/Command Prompt
- [x] Éditeur de texte (VS Code recommandé)

---

## 📝 Étape 1: Configurer Snipcart (3 min)

### 1.1 Créer compte test

1. Aller sur [app.snipcart.com/register](https://app.snipcart.com/register)
2. S'inscrire (email + password)
3. Mode test gratuit activé automatiquement

### 1.2 Récupérer clés API

1. Dans dashboard Snipcart: **Account > API Keys**
2. Copier:
   - **Public Test API key** (commence par `pk_test_`)
   - **Secret Test API key**

### 1.3 Configurer le backend

Ouvrir `backend/.env.example`, copier vers `backend/.env`:

```bash
# Dans votre terminal
cd backend
cp .env.example .env
```

Éditer `backend/.env`:
```bash
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/cercle_ecommerce
REDIS_URI=redis://localhost:6379

# IMPORTANT: Remplacer par vos vraies clés Snipcart
SNIPCART_API_KEY=pk_test_VOTRE_CLE_ICI
SNIPCART_SECRET_KEY=VOTRE_SECRET_ICI

# Générer des secrets JWT
ACCESS_TOKEN_SECRET=super_secret_access_token_change_me
REFRESH_TOKEN_SECRET=super_secret_refresh_token_change_me

FRONTEND_URL=http://localhost:5173
```

### 1.4 Configurer le frontend

Éditer `Index.html` ligne 264:

```javascript
window.SnipcartSettings = {
    publicApiKey: "pk_test_VOTRE_CLE_ICI", // ⚠️ Remplacer
    // ... reste de la config
}
```

Et ligne 284:
```html
<div hidden id="snipcart" data-api-key="pk_test_VOTRE_CLE_ICI"></div>
```

---

## 🐳 Étape 2: Démarrer l'infrastructure (2 min)

### 2.1 Démarrer Docker

**Windows/Mac:**
- Ouvrir Docker Desktop
- Attendre qu'il soit démarré (icône verte)

### 2.2 Lancer MongoDB + Redis

```bash
# Dans le dossier racine du projet
docker-compose up -d

# Vérifier que ça tourne
docker ps
```

Vous devez voir:
- `cercle-mongo`
- `cercle-redis`
- `cercle-mongo-express`

---

## 🔧 Étape 3: Démarrer le backend (3 min)

### 3.1 Installer dépendances

```bash
cd backend
npm install
```

### 3.2 Alimenter la base de données

```bash
npm run seed
```

Vous devez voir:
```
✅ 10 produits insérés
✅ 2 utilisateurs insérés
🎉 Seed terminé avec succès!
```

### 3.3 Démarrer le serveur

```bash
npm run dev
```

Vous devez voir:
```
╔════════════════════════════════════════════════════════╗
║   🚀 API C.E.R.C.L.E. E-boutique démarrée             ║
║   📍 URL: http://localhost:3000                       ║
╚════════════════════════════════════════════════════════╝
```

**Test:** Ouvrir [http://localhost:3000/health](http://localhost:3000/health)

Réponse attendue:
```json
{
  "success": true,
  "message": "API C.E.R.C.L.E. E-boutique - En ligne ✅"
}
```

---

## 🌐 Étape 4: Démarrer le frontend (2 min)

### Option A: Avec npx (recommandé)

```bash
# Dans un nouveau terminal, à la racine du projet
npx serve .
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Option B: Avec Python

```bash
python -m http.server 8000
```

Ouvrir [http://localhost:8000](http://localhost:8000)

### Option C: Avec VS Code Live Server

1. Installer extension "Live Server"
2. Clic droit sur `Index.html` > **Open with Live Server**

---

## 🧪 Étape 5: Tester un achat (2 min)

### 5.1 Ajouter au panier

1. Cliquer sur n'importe quel bouton **"Ajouter au panier"**
2. Modal Snipcart s'ouvre sur le côté ✅
3. Produit visible avec prix ✅

### 5.2 Checkout test

1. Cliquer **"Checkout"**
2. Remplir:
   - Email: `test@example.com`
   - Nom: `Test User`
   - Adresse: `123 Rue Test, Paris, 75001`
   - Sexe: `Homme`

3. Carte de test Stripe:
   - Numéro: `4242 4242 4242 4242`
   - Date: `12/26`
   - CVV: `123`

4. Cliquer **"Payer"**

### 5.3 Vérifier la commande

**MongoDB:**
```bash
docker exec -it cercle-mongo mongosh
use cercle_ecommerce
db.orders.find().pretty()
```

Vous devez voir votre commande avec:
- `orderNumber: "ORD-2026-XXXXXX"`
- `total: XX.XX`
- `orderStatus: "confirmed"`

**Ou via API:**
```bash
curl http://localhost:3000/api/v1/orders/track/ORD-2026-XXXXXX
```

---

## ✅ Checklist Validation

- [ ] Backend répond sur http://localhost:3000/health
- [ ] Frontend affiche 10 produits
- [ ] Panier Snipcart s'ouvre au clic
- [ ] Checkout test réussi (carte 4242...)
- [ ] Commande visible dans MongoDB
- [ ] Design Apple Store (gris clair, bleu, cartes arrondies)

---

## 🎉 C'est fait!

Votre site e-commerce est maintenant fonctionnel!

### Prochaines actions:

1. **Personnaliser:**
   - Changer images produits (remplacer placeholders)
   - Modifier textes (about.html, faq.html)
   - Ajuster couleurs si nécessaire

2. **Tester davantage:**
   - Suivre [TEST_SCENARIO.md](TEST_SCENARIO.md) pour tests complets
   - Tester authentification (register/login)
   - Tester panel admin (admin@cercle-eboutique.com / Admin123!)

3. **Déployer:**
   - Suivre [GETTING_STARTED.md](GETTING_STARTED.md) section déploiement
   - Railway (backend) + Vercel (frontend)

---

## 🐛 Problèmes?

### Backend ne démarre pas

**Vérifier:**
```bash
# MongoDB est lancé?
docker ps | grep mongo

# Port 3000 libre?
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Fichier .env existe?
ls backend/.env
```

### Snipcart ne s'ouvre pas

**Vérifier:**
1. Console navigateur (F12) pour erreurs
2. Clé API correcte dans Index.html
3. Internet connecté (CDN Snipcart)

### Commande non créée en MongoDB

**Vérifier:**
1. Backend reçoit webhook: voir logs
   ```bash
   docker-compose logs -f backend
   ```
2. URL webhook correcte dans Snipcart settings
3. Mode test activé

---

## 📚 Documentation Complète

- **[README.md](README.md)** - Overview
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Guide complet
- **[TEST_SCENARIO.md](TEST_SCENARIO.md)** - Tests détaillés
- **[backend/README.md](backend/README.md)** - API documentation

---

## 🆘 Support

**Email:** contact@el-mouahidine.org

**Documentation:** Voir fichiers MD dans le projet

---

**Temps total: ~10 minutes ⏱️**
**Difficulté: Facile ✅**
