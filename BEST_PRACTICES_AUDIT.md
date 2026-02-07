# Audit Best Practices - Projet [STRANGERTHINGS] E-boutique

> Date : 2026-02-07
> Scope : Analyse complète du code source (backend + frontend + DevOps)

## SECURITE (Critique)

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 1 | **CRITIQUE** | `docker-compose.yml` | 66-67 | Identifiants Mongo Express en dur (`admin` / `admin123`) | Utiliser des variables d'environnement ou Docker secrets |
| 2 | **CRITIQUE** | `docker-compose.yml` | 35,50 | MongoDB (27017) et Redis (6379) exposent leurs ports sur l'hôte sans authentification | Ne pas exposer les ports DB en production, ou ajouter auth MongoDB (`MONGO_INITDB_ROOT_USERNAME/PASSWORD`) |
| 3 | **CRITIQUE** | `Index.html` | 335 | Clé API Snipcart en dur dans le HTML (`YzNkN2VmYm...`) | Injecter via un build process ou un endpoint backend (`/api/v1/snipcart/config` existe mais n'est pas utilisé) |
| 4 | **CRITIQUE** | `snipcart.js` | 31-37 | Vérification webhook Snipcart incorrecte : compare un HMAC du token avec le token lui-même (`signature !== requestToken`). La vérification ne peut jamais passer correctement. | Suivre la doc Snipcart : valider le token via un appel API à `https://app.snipcart.com/api/requestvalidation/{token}` |
| 5 | **CRITIQUE** | `seed.js` | 278 | Le mot de passe admin est affiché en clair dans les logs (`logger.info('Admin password:', ...)`) | Ne jamais logger de mots de passe |
| 6 | **HAUTE** | `.env.example` | 56-57 | Mot de passe admin par défaut prévisible (`ChangeMe123!`) dans le fichier d'exemple, utilisé tel quel dans `seed.js` | Ne pas inclure de credentials par défaut, forcer la configuration |
| 7 | **HAUTE** | `security.js` | 77 | Utilisation de `console.warn` au lieu du logger Winston pour la détection d'injection NoSQL | Utiliser `logger.warn()` pour centraliser les logs de sécurité |
| 8 | **HAUTE** | `security.js` | 85-86 | `httpsRedirect` se base sur `req.secure` qui ne fonctionne pas derrière un reverse proxy (Nginx, ALB) | Utiliser `req.headers['x-forwarded-proto']` et activer `app.set('trust proxy', 1)` |
| 9 | **HAUTE** | `security.js` | 97 | Header `X-XSS-Protection: 1; mode=block` est obsolète et peut introduire des vulnérabilités | Le retirer ; Helmet le désactive déjà par défaut. Privilégier CSP |
| 10 | **HAUTE** | `authController.js` | 64-71 | Le refresh token est stocké en clair dans MongoDB | Stocker un hash du refresh token (comme pour les mots de passe) |
| 11 | **HAUTE** | `auth.js` (middleware) | 53-55 | Le rôle utilisateur est lu depuis le JWT (`decoded.role`) sans re-vérifier en DB | Un utilisateur révoqué/dégradé garde ses privilèges jusqu'à expiration du token. Vérifier le rôle en DB. |

## ARCHITECTURE & DESIGN PATTERNS

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 12 | **HAUTE** | `routes/products.js` | 126-128 | `new Product(req.body)` passe le body brut au modèle (mass assignment) | Whitelist explicite des champs autorisés ou utiliser `express-validator` (installé mais jamais utilisé) |
| 13 | **HAUTE** | `routes/products.js` | 150-153 | `findByIdAndUpdate(req.params.id, req.body)` — mass assignment sur l'update également | Extraire et valider uniquement les champs modifiables |
| 14 | **HAUTE** | `routes/orders.js` | 37-91 | Logique métier complexe directement dans le handler de route (pas de controller/service) | Extraire dans un `OrderService` pour séparation des responsabilités |
| 15 | **HAUTE** | `routes/orders.js` | 86-91 | Stock décrémenté après le `order.save()` sans transaction : si le décrément échoue, la commande est créée mais le stock est incorrect | Utiliser une transaction MongoDB (`session.startTransaction()`) |
| 16 | **HAUTE** | `snipcart.js` | 110-117 | `productId: item.id` — l'ID Snipcart n'est pas un ObjectId MongoDB valide, ce qui va causer des erreurs de validation | Résoudre le vrai productId en cherchant par SKU avant l'insertion |
| 17 | **MOYENNE** | `routes/products.js` | 208-227 | La route `/meta/categories` est définie après `/:identifier`, donc elle ne sera jamais atteinte (Express la matche comme un identifier) | Placer les routes statiques AVANT les routes paramétrées |
| 18 | **MOYENNE** | `routes/products.js` | 107-108 | `viewCount` incrémenté avec `save()` à chaque requête GET — pas atomique et coûteux | Utiliser `Product.findOneAndUpdate(..., { $inc: { viewCount: 1 } })` |
| 19 | **MOYENNE** | `routes/orders.js` | 38 | Queries MongoDB séquentielles dans une boucle `for` pour vérifier le stock | Utiliser `Product.find({ _id: { $in: productIds } })` en une seule requête |
| 20 | **MOYENNE** | `server.js` | 27 | `connectDB()` appelé sans `await`, le serveur démarre sans attendre la connexion DB | `await connectDB()` dans une fonction async de démarrage |
| 21 | **MOYENNE** | `Order.js` | 269 | `process.env.DONATION_PERCENTAGE` lu dans une méthode de modèle — couplage avec l'environnement | Passer en paramètre ou utiliser une constante de configuration |

## VALIDATION & GESTION D'ERREURS

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 22 | **HAUTE** | `authController.js` | 38-91 | Aucune validation d'input sur `register` (pas de vérif longueur/complexité du mot de passe, format email) | Utiliser `express-validator` (déjà en dépendance mais jamais importé ni utilisé nulle part) |
| 23 | **MOYENNE** | `routes/products.js` | 50,56 | `Number(page)` et `Number(limit)` sans validation — `NaN`, négatifs ou très grands nombres possibles | Valider et borner les valeurs de pagination (min 1, max 100) |
| 24 | **MOYENNE** | `routes/products.js` | 53-57 | `sort` pris directement du query string sans validation — injection MongoDB possible via le sort | Whitelist des champs de tri autorisés |
| 25 | **MOYENNE** | `routes/orders.js` | 237-261 | La route `/track/:orderNumber` permet l'énumération de commandes par force brute (pas de rate limiting spécifique ni captcha) | Ajouter un rate limiter ou exiger un email en plus du numéro |
| 26 | **FAIBLE** | `routes/*.js` | — | Les erreurs sont interceptées mais les messages génériques masquent les vrais problèmes en dev | Logger `error.message` dans le catch avant de renvoyer le message générique |

## RACE CONDITIONS & CONCURRENCE

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 27 | **HAUTE** | `Order.js` | 235-247 | `generateOrderNumber()` — race condition : deux requêtes concurrentes peuvent obtenir le même numéro | Utiliser un compteur atomique (`findOneAndUpdate` avec `$inc`) ou un UUID |
| 28 | **HAUTE** | `Product.js` | 214-221 | `decrementStock()` fait `read-modify-write` non atomique. Deux achats concurrents peuvent vendre plus que le stock | Utiliser `findOneAndUpdate({ stock: { $gte: quantity } }, { $inc: { stock: -quantity } })` |

## FRONTEND

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 29 | **HAUTE** | `Index.html` | 40-317 | Code HTML massif dupliqué (10x le même bloc product-card avec seules les données qui changent) | Générer dynamiquement via un template engine, un framework, ou JavaScript |
| 30 | **MOYENNE** | `Index.html` | 1 | Le fichier s'appelle `Index.html` avec un I majuscule | Convention : `index.html` en minuscules (sensibilité casse sur Linux) |
| 31 | **MOYENNE** | `Index.html` | 342 | Script Snipcart inline minifié de ~2KB directement dans le HTML | Extraire dans un fichier JS séparé pour la mise en cache et la lisibilité |
| 32 | **MOYENNE** | `Index.html` | 411-423 | CSS inline dans une balise `<style>` en fin de body | Déplacer dans `site.css` |
| 33 | **MOYENNE** | `Index.html` | 333-409 | ~75 lignes de JavaScript inline dans le HTML | Extraire dans un fichier JS dédié |
| 34 | **FAIBLE** | `Index.html` | 47,75,103... | Utilisation de `<br>` pour l'espacement entre éléments | Utiliser des marges CSS (`margin-top` sur `.btn-buy`) |
| 35 | **FAIBLE** | `css/site.css` | 19 | Reset universel `* { margin: 0; padding: 0 }` | Utiliser un reset CSS normalisé (normalize.css ou modern-normalize) |

## DEVOPS & CONFIGURATION

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 36 | **HAUTE** | `docker-compose.yml` | 1 | `version: '3.8'` est obsolète (deprecated dans Docker Compose V2) | Retirer le champ `version` |
| 37 | **HAUTE** | `package.json` | 9 | `jest --coverage` configuré mais aucun fichier de test n'existe dans le projet | Écrire des tests unitaires et d'intégration |
| 38 | **MOYENNE** | `Dockerfile` | 14 | `COPY . .` copie tout le répertoire dont potentiellement `.env`, logs, etc. | Vérifier que `.dockerignore` exclut bien les fichiers sensibles |
| 39 | **MOYENNE** | `Dockerfile` | 11 | `npm ci --only=production` — le flag `--only` est deprecated dans npm 7+ | Utiliser `npm ci --omit=dev` |
| 40 | **MOYENNE** | `package.json` | — | `express-validator` est en dépendance mais n'est utilisé nulle part dans le code | Retirer la dépendance inutile ou l'implémenter |
| 41 | **MOYENNE** | `package.json` | — | `redis` est en dépendance mais n'est jamais initialisé ni utilisé dans le code | Retirer ou implémenter le cache Redis |
| 42 | **MOYENNE** | `package.json` | — | `stripe` est en dépendance mais aucune route Stripe n'existe (seul Snipcart est implémenté) | Retirer ou implémenter l'intégration Stripe |
| 43 | **MOYENNE** | `package.json` | — | `nodemailer` est en dépendance mais aucun email n'est envoyé dans le code | Retirer ou implémenter les notifications email |
| 44 | **FAIBLE** | `package.json` | — | Pas de fichier `.eslintrc` de configuration ESLint malgré la dépendance | Créer une configuration ESLint |
| 45 | **FAIBLE** | Projet | — | Pas de pipeline CI/CD (pas de `.github/workflows`, `.gitlab-ci.yml`, etc.) | Mettre en place un pipeline CI minimum (lint + test + build) |

## QUALITE DE CODE

| # | Sev. | Fichier | Ligne | Problème | Best Practice |
|---|------|---------|-------|----------|---------------|
| 46 | **MOYENNE** | `authController.js` | 316 | `module.exports = exports` est redondant — `exports` est déjà `module.exports` | Utiliser l'un ou l'autre, pas les deux |
| 47 | **MOYENNE** | `auth.js` (middleware) | 142 | Même pattern `module.exports = exports` redondant | Choisir un style d'export consistent |
| 48 | **MOYENNE** | `User.js` | 15 | Regex email `^\S+@\S+\.\S+$` est trop permissive (accepte `a@b.c`) | Utiliser une validation email plus robuste (validator.js ou express-validator) |
| 49 | **FAIBLE** | Tout le backend | — | Utilisation de `require()` (CommonJS) au lieu d'ESM (`import/export`) | Migrer vers ESM (`"type": "module"` dans package.json) pour un projet Node 18+ |
| 50 | **FAIBLE** | `server.js` | 168-179 | Art ASCII dans les logs de démarrage avec emojis — bruit dans les logs de production | Utiliser un format de log structuré en production |

---

## Résumé par sévérité

| Sévérité | Nombre | % |
|----------|--------|---|
| CRITIQUE | 5 | 10% |
| HAUTE | 18 | 36% |
| MOYENNE | 19 | 38% |
| FAIBLE | 8 | 16% |
| **Total** | **50** | **100%** |

## Top 5 des actions prioritaires

1. **Corriger la vérification webhook Snipcart** — la logique actuelle est cassée (`snipcart.js:31-37`)
2. **Sécuriser Docker** — retirer les ports exposés, ajouter l'auth MongoDB, supprimer les credentials en dur
3. **Ajouter des transactions MongoDB** — les opérations stock/commande ne sont pas atomiques
4. **Implémenter la validation d'input** — `express-validator` est installé mais jamais utilisé
5. **Nettoyer les dépendances mortes** — redis, stripe, nodemailer, express-validator ne sont pas utilisés
