# 🧪 Scénario de Test Complet - C.E.R.C.L.E. E-boutique

## 📋 Objectif

Tester l'ensemble du parcours client du site e-commerce, de la navigation à l'achat.

---

## 🎯 Test 1: Navigation et Découverte des Produits

### Étapes

1. **Ouvrir le site**
   - URL: `file:///path/to/Index.html` ou via serveur local
   - Vérifier que la page charge correctement

2. **Inspecter le header**
   - ✅ Logo "C.E.R.C.L.E. - E-boutique" visible
   - ✅ Menu navigation (Accueil, Produits, Qui sommes-nous, F.A.Q.)
   - ✅ Icône panier avec compteur (0 items, 0.00 €)
   - ✅ Effect hover sur les liens de navigation

3. **Hero section**
   - ✅ Titre: "Packs Exclusifs — Édition Limitée"
   - ✅ Sous-titre avec mention "15% reversés à une association"
   - ✅ Typographie Apple-style (grande, claire, espacement)

4. **Grille de produits**
   - ✅ 10 produits affichés en grille responsive
   - ✅ Cartes produits avec:
     - Image placeholder colorée
     - Titre cliquable
     - Description
     - Prix
     - Bouton "Ajouter au panier" bleu Apple
   - ✅ Hover effect: carte monte légèrement, ombre plus prononcée

5. **Tester le responsive**
   - Desktop (>1068px): Grille multi-colonnes
   - Tablet (768px-1068px): 2 colonnes
   - Mobile (<768px): 1 colonne

### ✅ Résultat attendu

Navigation fluide, design Apple-style épuré, tous les éléments visibles et fonctionnels.

---

## 🛒 Test 2: Ajouter des Produits au Panier (Snipcart)

### Prérequis

- Snipcart configuré avec clé API test
- Backend démarré (`npm run dev` dans `/backend`)

### Étapes

1. **Ajouter Pack 01 (Enfant Garçon)**
   - Cliquer sur "Ajouter au panier"
   - ✅ Modal Snipcart s'ouvre sur le côté
   - ✅ Produit affiché: "Pack 01: Enfant - Garçon" - 19.99€
   - ✅ Quantité: 1
   - Fermer le modal

2. **Vérifier le compteur**
   - ✅ Header affiche: "1" item et "19.99 €"

3. **Ajouter Pack 06 (Lego Mekka)**
   - Cliquer sur "Ajouter au panier"
   - ✅ Modal affiche maintenant 2 produits
   - ✅ Total: 54.98€ (19.99 + 34.99)

4. **Modifier la quantité**
   - Dans le modal Snipcart, augmenter Pack 01 à quantité 3
   - ✅ Total mis à jour: 94.96€ (59.97 + 34.99)

5. **Ajouter Pack 09 (Triptyque en promo)**
   - Ajouter au panier
   - ✅ Prix affiché: 39.99€ (prix réduit, pas 44.99€)
   - ✅ Total: 134.95€

6. **Supprimer un produit**
   - Retirer Pack 01 du panier
   - ✅ Total: 74.98€ (34.99 + 39.99)

### ✅ Résultat attendu

Panier Snipcart fonctionnel, calculs corrects, quantités modifiables.

---

## 💳 Test 3: Processus de Checkout (Mode Test)

### Étapes

1. **Cliquer sur "Checkout" dans Snipcart**

2. **Formulaire Client**
   - Email: `test@example.com`
   - Nom complet: `Jean Dupont`
   - ✅ Champs validés

3. **Adresse de livraison**
   - Adresse: `123 Rue de la Paix`
   - Ville: `Paris`
   - Code postal: `75001`
   - Pays: `France`
   - Téléphone: `+33612345678`

4. **Champ personnalisé: Sexe**
   - ✅ Dropdown "Sexe (Civil)" affiché
   - Sélectionner: "Homme"

5. **Champ personnalisé: Message cadeau (optionnel)**
   - Taper: "Joyeux anniversaire! 🎂"
   - ✅ Texte enregistré

6. **Méthode de livraison**
   - Options affichées (si shippingRatesFetch configuré):
     - ✅ Livraison standard GRATUITE (si > 50€)
     - ✅ Livraison express: 12.90€
     - ✅ Point relais: 3.90€
   - Sélectionner: "Livraison standard"

7. **Récapitulatif**
   - Sous-total: 74.98€
   - Frais de livraison: 0.00€
   - TVA (20%): 14.99€
   - **Total: 89.97€**
   - ✅ Montant donation calculé: 11.25€ (15% de 74.98€)

8. **Paiement (Carte test Stripe)**
   - Numéro de carte: `4242 4242 4242 4242`
   - Date d'expiration: `12/26`
   - CVV: `123`
   - ✅ Formulaire Stripe Elements chargé

9. **Valider le paiement**
   - Cliquer sur "Payer maintenant"
   - ✅ Paiement accepté (mode test)
   - ✅ Page de confirmation affichée
   - ✅ Numéro de commande: `ORD-2026-XXXXXX`

10. **Email de confirmation**
    - ✅ Email reçu à `test@example.com`
    - Contient: détails commande, numéro de suivi

### ✅ Résultat attendu

Checkout complet réussi, paiement test accepté, commande créée.

---

## 🔧 Test 4: Backend API et Base de Données

### Vérifier que la commande est dans MongoDB

```bash
# Se connecter à MongoDB
docker exec -it cercle-mongo mongosh

# Utiliser la DB
use cercle_ecommerce

# Trouver la dernière commande
db.orders.findOne({}, { sort: { createdAt: -1 } })
```

**Vérifications:**
- ✅ Commande existe avec orderNumber `ORD-2026-XXXXXX`
- ✅ Items corrects (2 produits)
- ✅ Total: 89.97€
- ✅ donationAmount: 11.25€
- ✅ orderStatus: "confirmed"
- ✅ paymentStatus: "completed"
- ✅ shippingAddress remplie correctement
- ✅ customFields: sexe="Homme", message_cadeau="Joyeux anniversaire! 🎂"

### Vérifier le stock des produits

```bash
# Produit Pack 06 (Lego Mekka)
db.products.findOne({ sku: "PACK-06" })
```

**Vérifications:**
- ✅ Stock initial: 30
- ✅ Stock après achat: 29 (décrémenté de 1)
- ✅ soldCount: 1

### Vérifier via API

```bash
# Récupérer la commande via API
curl -X GET http://localhost:3000/api/v1/orders/track/ORD-2026-XXXXXX
```

**Réponse attendue:**
```json
{
  "success": true,
  "data": {
    "order": {
      "orderNumber": "ORD-2026-XXXXXX",
      "orderStatus": "confirmed",
      "statusHistory": [...],
      "estimatedDelivery": null,
      "trackingNumber": null,
      "shippingCarrier": null
    }
  }
}
```

---

## 🔐 Test 5: Authentification et Commandes Utilisateur

### Inscription

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marie@example.com",
    "password": "SecurePass123!",
    "firstName": "Marie",
    "lastName": "Martin"
  }'
```

**Vérifications:**
- ✅ Status: 201 Created
- ✅ Réponse contient: `accessToken`, `refreshToken`, `user`
- ✅ Password hashé dans MongoDB (pas en clair)

### Connexion

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marie@example.com",
    "password": "SecurePass123!"
  }'
```

**Vérifications:**
- ✅ Status: 200 OK
- ✅ `lastLogin` mis à jour dans MongoDB

### Récupérer son profil

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Vérifications:**
- ✅ Status: 200 OK
- ✅ Profil retourné sans `passwordHash`

### Créer une commande authentifiée

```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID_1",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "fullName": "Marie Martin",
      "street": "45 Avenue des Champs",
      "city": "Lyon",
      "postalCode": "69001",
      "country": "France",
      "phone": "+33698765432"
    },
    "paymentMethod": "card"
  }'
```

**Vérifications:**
- ✅ Status: 201 Created
- ✅ Commande liée à `userId` de Marie
- ✅ Stock décrémenté automatiquement

### Voir mes commandes

```bash
curl -X GET http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Vérifications:**
- ✅ Liste de commandes de Marie uniquement
- ✅ Pagination fonctionnelle

---

## 🔒 Test 6: Sécurité

### Rate Limiting

```bash
# Tenter 10 connexions rapides
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done
```

**Vérifications:**
- ✅ Après 5 tentatives: Status 429 Too Many Requests
- ✅ Message: "Trop de tentatives de connexion"

### NoSQL Injection

```bash
# Tenter injection dans email
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": {"$ne": null},
    "password": "anything"
  }'
```

**Vérifications:**
- ✅ Status: 400 Bad Request
- ✅ Requête sanitisée par `express-mongo-sanitize`

### Token expiré

```bash
# Utiliser un vieux token (après 15 min)
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer OLD_EXPIRED_TOKEN"
```

**Vérifications:**
- ✅ Status: 403 Forbidden
- ✅ Error: "Token expiré. Veuillez vous reconnecter."

---

## 👨‍💼 Test 7: Panel Admin

### Se connecter en admin

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cercle-eboutique.com",
    "password": "Admin123!"
  }'
```

### Créer un nouveau produit

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -d '{
    "sku": "PACK-11",
    "name": "Pack 11: Pack Premium",
    "slug": "pack-11-premium",
    "description": "Pack premium exclusif avec produits haut de gamme",
    "shortDescription": "Pack premium",
    "price": 59.99,
    "stock": 20,
    "category": "autre",
    "weight": 1500,
    "images": [{
      "url": "https://placehold.co/400x300?text=Pack+11",
      "altText": "Pack 11 Premium",
      "isPrimary": true
    }]
  }'
```

**Vérifications:**
- ✅ Status: 201 Created
- ✅ Produit visible dans `/api/v1/products`

### Voir toutes les commandes (admin)

```bash
curl -X GET http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Vérifications:**
- ✅ Admin voit TOUTES les commandes (pas juste les siennes)

### Mettre à jour statut commande

```bash
curl -X PATCH http://localhost:3000/api/v1/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -d '{
    "status": "shipped",
    "note": "Expédié via Colissimo, suivi: 6A123456789"
  }'
```

**Vérifications:**
- ✅ Status: 200 OK
- ✅ `statusHistory` mis à jour avec timestamp
- ✅ `orderStatus`: "shipped"

### Utilisateur normal tente action admin

```bash
# User normal essaie de créer un produit
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -d '{...}'
```

**Vérifications:**
- ✅ Status: 403 Forbidden
- ✅ Error: "Accès refusé. Droits administrateur requis."

---

## 🎨 Test 8: Design Apple Store

### Vérifications visuelles

**Header:**
- ✅ Glassmorphism (flou background)
- ✅ Sticky top
- ✅ Hauteur: 44px (standard iOS)
- ✅ Transitions smooth sur hover

**Typography:**
- ✅ Font: -apple-system, SF Pro
- ✅ Hero h1: Grande (clamp 2.5rem-4rem)
- ✅ Letter-spacing négatif (-0.015em)
- ✅ Line-height serré (1.05)

**Cartes produits:**
- ✅ Border-radius: 18px
- ✅ Box-shadow subtile
- ✅ Hover: translateY(-4px)
- ✅ Transition: cubic-bezier(0.28, 0.11, 0.32, 1)

**Boutons:**
- ✅ Pill shape (border-radius: 980px)
- ✅ Bleu Apple (#0071e3)
- ✅ Hover: scale(1.02)
- ✅ Active: scale(0.98)

**Couleurs:**
- ✅ Background: #f5f5f7 (gris clair Apple)
- ✅ Text main: #1d1d1f
- ✅ Text muted: #86868b
- ✅ Card: #ffffff pur

**Responsive:**
- ✅ Mobile-first
- ✅ Breakpoints Apple (768px, 1068px)
- ✅ Safe areas iOS (env(safe-area-inset))

---

## 📊 Résultats Attendus

### ✅ Succès si:

1. **Frontend:**
   - Design Apple-style épuré et moderne
   - Navigation fluide et responsive
   - Snipcart intégré et fonctionnel

2. **Backend:**
   - API répond correctement (200/201/400/403/500)
   - MongoDB enregistre les commandes
   - Stock mis à jour automatiquement
   - Authentification JWT sécurisée

3. **Sécurité:**
   - Rate limiting actif
   - NoSQL injection bloquée
   - Passwords hashés
   - CORS configuré

4. **Webhooks Snipcart:**
   - order.completed crée commande en DB
   - shippingRatesFetch retourne options livraison
   - Stock synchronisé

### ❌ Échec si:

- Erreurs 500 fréquentes
- Panier Snipcart ne s'ouvre pas
- Commandes non enregistrées en DB
- Stock non décrémenté
- Design cassé sur mobile
- Tokens non validés

---

## 🚀 Prochaines Étapes

Après validation de ce scénario:

1. **Email notifications**
   - Confirmation commande
   - Notification expédition
   - Suivi livraison

2. **Dashboard Admin**
   - UI pour gérer produits
   - Tableau de bord commandes
   - Analytics et stats

3. **Tests automatisés**
   - Jest pour tests unitaires
   - Supertest pour tests API
   - CI/CD avec GitHub Actions

4. **Production**
   - Déployer sur Render/Railway
   - MongoDB Atlas
   - Domain personnalisé
   - SSL/TLS (Let's Encrypt)

---

**Date de test:** ___________
**Testeur:** ___________
**Résultat:** ☐ PASS  ☐ FAIL
**Notes:** _______________________________
