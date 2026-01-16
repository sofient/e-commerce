# 🛍️ [STRANGERTHINGS] - E-boutique

> Plateforme e-commerce moderne pour la vente de packs et coffrets cadeaux avec donation solidaire.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## 🎯 À propos

[STRANGERTHINGS] E-boutique est une plateforme e-commerce qui vend des packs et coffrets cadeaux thématiques (enfants, adultes, éducatifs, Lego). **15% de chaque achat** est reversé à une association partenaire.

### ✨ Fonctionnalités

- 🛒 **Catalogue de produits** - 10 packs différents (enfants, adultes, Lego, bonbons)
- 💳 **Paiement sécurisé** - Intégration Snipcart (Stripe)
- 📦 **Gestion de stock** - Mise à jour automatique après achat
- 👤 **Authentification** - JWT, inscription/connexion
- 🎁 **Donation solidaire** - 15% reversés automatiquement
- 📱 **Design responsive** - Style Apple Store moderne
- 🔐 **Sécurité** - Rate limiting, CORS, sanitization
- 📊 **Panel admin** - Gestion produits et commandes

## 🚀 Démarrage rapide

### Installation en 5 minutes

```bash
# 1. Backend - Installer les dépendances
cd backend
npm install

# 2. Créer le fichier de configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer MongoDB et Redis avec Docker
cd ..
docker-compose up -d

# 4. Alimenter la base de données
cd backend
npm run seed

# 5. Démarrer le backend
npm run dev

# Le serveur démarre sur http://localhost:3000
```

### Configuration Snipcart

1. Créer un compte sur [app.snipcart.com](https://app.snipcart.com/)
2. Récupérer les clés dans **Account > API Keys**
3. Configurer dans `.env` et `Index.html`

### Démarrer le frontend

```bash
# Serveur local simple
npx serve .
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Backend README](backend/README.md)** - Documentation API complète
- **[TEST_SCENARIO.md](TEST_SCENARIO.md)** - Scénarios de test détaillés
- **[PROJECT_INFO.md](PROJECT_INFO.md)** - Informations projet

## 🎨 Design Apple Store

Le design s'inspire fortement de l'Apple Store avec typographie SF Pro, glassmorphism, transitions smooth et responsive mobile-first.

## 📡 API Endpoints

Voir [backend/README.md](backend/README.md) pour la documentation complète.

## 🔐 Sécurité

- JWT Authentication (15min access, 7j refresh)
- Bcrypt password hashing
- Rate limiting (anti brute-force)
- CORS, Helmet, MongoDB sanitization

## 📞 Contact

**Organisation:** El Mouahidine
**Email:** contact@el-mouahidine.org

---

**Fait avec ❤️ pour [STRANGERTHINGS] et la communauté**