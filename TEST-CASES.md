# Test Cases — Mahall E-boutique

**URL**: https://sofient.github.io/e-commerce/
**Date**: 13/02/2026
**Navigateurs cibles**: Chrome, Firefox, Safari, Edge (desktop + mobile)

---

## 1. NAVIGATION & HEADER

### TC-NAV-01 : Logo redirige vers l'accueil (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur n'importe quelle page (ex: faq.html) |
| **Action** | Cliquer sur "Mahall - E-boutique" dans le header |
| **Resultat attendu** | Redirection vers index.html |

### TC-NAV-02 : Liens de navigation fonctionnels (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html |
| **Action** | Cliquer successivement sur: Accueil, Produits, Qui sommes-nous ?, F.A.Q. |
| **Resultat attendu** | Accueil -> index.html, Produits -> scroll vers #products, Qui sommes-nous -> about.html, F.A.Q. -> faq.html |

### TC-NAV-03 : Header sticky au scroll (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html |
| **Action** | Scroller vers le bas de la page |
| **Resultat attendu** | Le header reste visible en haut avec un effet blur (glassmorphism). Apres 60px de scroll, une ombre subtile apparait (classe .shrink) |

### TC-NAV-04 : Navigation clavier (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html |
| **Action** | Utiliser Tab pour naviguer entre les elements, Enter pour activer |
| **Resultat attendu** | Tous les liens et boutons sont accessibles au clavier. Les product-cards ont tabindex="0" et reagissent a Enter |

### TC-NAV-05 : Navigation mobile responsive (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir le site sur mobile (< 768px) |
| **Action** | Verifier le header et la navigation |
| **Resultat attendu** | Menu se reorganise: logo en haut, nav en dessous avec espacement egal. Tous les liens restent cliquables |

---

## 2. PAGE ACCUEIL (index.html)

### TC-HOME-01 : Affichage des 10 produits (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir index.html |
| **Action** | Verifier la grille de produits |
| **Resultat attendu** | 10 product-cards affichees avec nom, description, prix et bouton "Ajouter au panier" |

### TC-HOME-02 : Grille responsive (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir index.html |
| **Action** | Redimensionner la fenetre: >1068px, 768-1068px, <768px |
| **Resultat attendu** | 3 colonnes -> 2 colonnes -> 1 colonne |

### TC-HOME-03 : Hover sur product-card (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html, desktop |
| **Action** | Survoler une product-card |
| **Resultat attendu** | La carte monte de 4px (translateY), l'ombre s'intensifie, l'image zoom legerement (scale 1.08) |

### TC-HOME-04 : Lien vers page produit (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html |
| **Action** | Cliquer sur l'image ou le titre du Pack 01 |
| **Resultat attendu** | Redirection vers pack-01.html |

### TC-HOME-05 : Animation fade-in au scroll (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir index.html |
| **Action** | Scroller vers les produits |
| **Resultat attendu** | Les cards apparaissent en fondu avec un mouvement vers le haut. Chaque card a un leger delai (stagger effect) |

### TC-HOME-06 : Animation desactivee si reduced-motion (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Activer "prefers-reduced-motion: reduce" dans les parametres OS |
| **Action** | Ouvrir index.html |
| **Resultat attendu** | Aucune animation. Tous les elements sont visibles immediatement. Pas de parallax ni de pulse sur le panier |

### TC-HOME-07 : Donation card affichee (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html |
| **Action** | Scroller apres les produits |
| **Resultat attendu** | Card "Notre engagement" visible avec lien "En savoir plus" vers about.html |

### TC-HOME-08 : Footer avec lien privacy (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html |
| **Action** | Scroller jusqu'au footer |
| **Resultat attendu** | Copyright 2026 + lien "Politique de Confidentialite" menant a privacy.html |

---

## 3. PAGES PRODUIT (pack-01.html a pack-10.html)

### TC-PROD-01 : Affichage complet page produit (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir pack-01.html |
| **Action** | Verifier le contenu |
| **Resultat attendu** | Hero avec titre, carousel d'images (3 photos), purchase-box avec prix (19.99 EUR), bouton "Ajouter au panier", contenu du pack, card donation |

### TC-PROD-02 : Carousel images - fleches (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir une page produit |
| **Action** | Cliquer sur la fleche droite puis gauche du carousel |
| **Resultat attendu** | L'image suivante apparait avec scroll smooth. Retour a l'image precedente avec fleche gauche |

### TC-PROD-03 : Carousel images - swipe mobile (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir une page produit sur mobile |
| **Action** | Swiper horizontalement sur le carousel |
| **Resultat attendu** | Les images defilent avec snap (scroll-snap-type: x mandatory) |

### TC-PROD-04 : Prix corrects sur chaque pack (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir chaque page produit |
| **Action** | Verifier le prix affiche et data-item-price |
| **Resultat attendu** | Pack 01-02: 19.99, Pack 03-04: 24.99, Pack 05: 14.99, Pack 06-07-08: 34.99, Pack 09: 44.99, Pack 10: 9.99 |

### TC-PROD-05 : Coherence prix index vs page produit (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Pour chaque pack |
| **Action** | Comparer le prix sur index.html avec celui sur la page detail |
| **Resultat attendu** | Les prix sont identiques sur les deux pages |

### TC-PROD-06 : Responsive page produit (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir pack-06.html sur mobile (< 768px) |
| **Action** | Verifier la mise en page |
| **Resultat attendu** | Layout passe de 2 colonnes a 1 colonne. Carousel au-dessus, purchase-box en dessous |

---

## 4. PANIER SNIPCART — AJOUT & CUSTOM FIELDS

### TC-CART-01 : Ajouter un produit au panier (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur index.html, panier vide |
| **Action** | Cliquer "Ajouter au panier" sur Pack 01 |
| **Resultat attendu** | Le panier Snipcart s'ouvre en side-panel. Pack 01 affiche avec prix 19.99 EUR, quantite 1 |

### TC-CART-02 : Compteur panier mis a jour (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier vide |
| **Action** | Ajouter Pack 01 au panier |
| **Resultat attendu** | Le compteur dans le header passe de 0 a 1. Le total passe a 19.99 EUR |

### TC-CART-03 : Ajouter plusieurs produits differents (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier vide |
| **Action** | Ajouter Pack 01 (19.99) + Pack 10 (9.99) |
| **Resultat attendu** | 2 articles dans le panier. Total: 29.98 EUR. Compteur: 2 |

### TC-CART-04 : Ajouter le meme produit 2 fois (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier vide |
| **Action** | Cliquer 2 fois "Ajouter au panier" sur Pack 01 |
| **Resultat attendu** | Pack 01 avec quantite 2 dans le panier. Total: 39.98 EUR |

### TC-CART-05 : Custom field "Destination" present (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier vide |
| **Action** | Ajouter un produit et verifier dans le panier |
| **Resultat attendu** | Le dropdown "Destination" est visible avec les options "Pour moi" (defaut) et "Pour une action/association" |

### TC-CART-06 : Destination "Pour moi" -> Association desactivee (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Produit dans le panier, Destination = "Pour moi" |
| **Action** | Verifier l'etat du dropdown Association |
| **Resultat attendu** | Le dropdown "Association beneficiaire" est grise (opacity 0.4), desactive, non cliquable |

### TC-CART-07 : Destination "Pour une action/association" -> Association activee (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Produit dans le panier |
| **Action** | Changer Destination a "Pour une action/association" |
| **Resultat attendu** | Le dropdown "Association beneficiaire" s'active (opacity 1), les 10 associations sont selectionnables |

### TC-CART-08 : Toutes les associations presentes (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Destination = "Pour une action/association" |
| **Action** | Ouvrir le dropdown Association |
| **Resultat attendu** | Options: -, Secours Islamique France, Secours Populaire, Restos du Coeur, Croissant Rouge, Muslim Hands, Islamic Relief, Life ONG, Barakacity, Human Appeal, Autre association locale |

### TC-CART-09 : Champ commentaire present (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Produit dans le panier |
| **Action** | Verifier la presence du champ "Commentaire achat" |
| **Resultat attendu** | Textarea visible avec placeholder "Cet achat est-il pour vous ou pour quelqu'un d'autre ?" |

### TC-CART-10 : Supprimer un produit du panier (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | 1 produit dans le panier |
| **Action** | Supprimer le produit via le panier Snipcart |
| **Resultat attendu** | Panier vide. Compteur revient a 0. Total: 0.00 EUR |

### TC-CART-11 : Ouvrir le panier vide (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier vide |
| **Action** | Cliquer sur l'icone panier dans le header |
| **Resultat attendu** | Le side-panel s'ouvre avec un message "Votre panier est vide" (ou equivalent Snipcart) |

### TC-CART-12 : Basculer Destination association -> Pour moi (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Destination = "Pour une action/association", association "Secours Islamique France" selectionnee |
| **Action** | Changer Destination a "Pour moi" |
| **Resultat attendu** | Association se desactive, la valeur selectionnee est effacee (reset a vide), dropdown grise |

---

## 5. CHECKOUT & CUSTOM ADDRESS FIELDS

### TC-CHECK-01 : Acces au checkout (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | 1+ produit dans le panier |
| **Action** | Cliquer sur "Commander" dans le panier Snipcart |
| **Resultat attendu** | Formulaire de checkout s'affiche avec les champs d'adresse standard |

### TC-CHECK-02 : Champ custom "Sexe" dans formulaire adresse (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre dans le formulaire de checkout/adresse |
| **Action** | Verifier la presence du champ "Sexe" en haut du formulaire |
| **Resultat attendu** | Dropdown "Sexe" present avec options: -- Selectionnez --, Homme, Femme |

### TC-CHECK-03 : Champ custom "Commentaire" dans formulaire adresse (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre dans le formulaire de checkout/adresse |
| **Action** | Verifier la presence du champ "Commentaire" |
| **Resultat attendu** | Champ input visible avec placeholder "255 caracteres maximum" |

### TC-CHECK-04 : Checkout avec tous les champs remplis (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier avec 1 produit |
| **Action** | Remplir: Sexe=Homme, Commentaire="Test commande", Nom, Prenom, Email, Adresse, Ville, Code postal, Pays |
| **Resultat attendu** | Passage a l'etape paiement sans erreur |

### TC-CHECK-05 : Checkout sans remplir le sexe (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier avec 1 produit |
| **Action** | Laisser Sexe sur "-- Selectionnez --", remplir le reste, valider |
| **Resultat attendu** | Le formulaire passe quand meme (champ non requis). Si requis: message d'erreur sous le champ |

### TC-CHECK-06 : Checkout avec commentaire vide (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier avec 1 produit |
| **Action** | Laisser le commentaire vide, remplir le reste |
| **Resultat attendu** | Checkout passe normalement (champ optionnel) |

### TC-CHECK-07 : Checkout sans adresse email (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier avec 1 produit |
| **Action** | Laisser l'email vide, remplir le reste |
| **Resultat attendu** | Snipcart affiche un message d'erreur: champ email requis |

### TC-CHECK-08 : Checkout avec email invalide (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Panier avec 1 produit |
| **Action** | Entrer "pasunemail" dans le champ email |
| **Resultat attendu** | Message d'erreur: format email invalide |

### TC-CHECK-09 : Devise correcte au checkout (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Produit dans le panier |
| **Action** | Verifier la devise affichee dans tout le checkout |
| **Resultat attendu** | Tous les montants sont en EUR (euros) |

---

## 6. FAQ (faq.html)

### TC-FAQ-01 : Accordion ouvre une question (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir faq.html |
| **Action** | Cliquer sur "Comment passer commande ?" |
| **Resultat attendu** | La reponse s'affiche avec animation. La fleche tourne de 180 degres |

### TC-FAQ-02 : Accordion ferme la question ouverte (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Une question est ouverte |
| **Action** | Cliquer a nouveau sur la meme question |
| **Resultat attendu** | La reponse se ferme. La fleche revient a sa position initiale |

### TC-FAQ-03 : Une seule question ouverte a la fois (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | "Comment passer commande ?" est ouvert |
| **Action** | Cliquer sur "Quels sont les modes de paiement acceptes ?" |
| **Resultat attendu** | La premiere se ferme, la seconde s'ouvre |

### TC-FAQ-04 : Toutes les 9 questions presentes (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir faq.html |
| **Action** | Compter les questions |
| **Resultat attendu** | 9 questions: Commande, Paiement, Livraison, Retour, Don aux associations, Edition limitee, Personnalisation, Contact, Halal |

### TC-FAQ-05 : Email de contact correct (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir faq.html |
| **Action** | Ouvrir la question "Comment vous contacter ?" |
| **Resultat attendu** | Email affiche: contact@mahall-eboutique.com (et non .fr) |

---

## 7. PAGE ABOUT (about.html)

### TC-ABOUT-01 : Contenu complet (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir about.html |
| **Action** | Verifier le contenu |
| **Resultat attendu** | Titre "Qui sommes-nous ?", sections Mission, Valeurs (3 cards: Solidarite, Qualite, Generosite), Engagement, bouton "Decouvrir nos packs" |

### TC-ABOUT-02 : Bouton "Decouvrir nos packs" (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre sur about.html |
| **Action** | Cliquer sur "Decouvrir nos packs" |
| **Resultat attendu** | Redirection vers index.html |

### TC-ABOUT-03 : Values grid responsive (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir about.html sur mobile |
| **Action** | Verifier la grille des valeurs |
| **Resultat attendu** | Les 3 cards s'empilent verticalement sur ecran < 768px |

---

## 8. PRIVACY POLICY (privacy.html)

### TC-PRIV-01 : Contenu complet (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir privacy.html |
| **Action** | Verifier les sections |
| **Resultat attendu** | 7 sections: Responsable, Donnees collectees, Utilisation, Partage, Conservation, Droits, Cookies |

### TC-PRIV-02 : Email coherent (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir privacy.html |
| **Action** | Verifier toutes les adresses email |
| **Resultat attendu** | Toutes les occurrences sont contact@mahall-eboutique.com |

### TC-PRIV-03 : Lien retour boutique (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir privacy.html |
| **Action** | Cliquer "Retour a la boutique" |
| **Resultat attendu** | Redirection vers index.html |

### TC-PRIV-04 : Adresse sans placeholder (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir privacy.html |
| **Action** | Verifier l'adresse du responsable |
| **Resultat attendu** | "Bruxelles, Belgique" (pas de "Rue Exemple") |

---

## 9. SNIPCART INIT & TEMPLATES

### TC-SNIP-01 : Snipcart se charge (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir index.html |
| **Action** | Ouvrir DevTools > Console. Interagir avec la page (scroll/click) |
| **Resultat attendu** | Pas d'erreur Snipcart en console. Le script snipcart.js et snipcart.css sont charges dans le DOM |

### TC-SNIP-02 : Chargement lazy (on-user-interaction) (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir index.html |
| **Action** | Verifier DevTools > Network AVANT toute interaction |
| **Resultat attendu** | snipcart.js n'est PAS charge au debut. Il se charge apres le premier scroll/click/focus (ou apres 2750ms timeout) |

### TC-SNIP-03 : Templates URL accessible (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Site deploye sur GitHub Pages |
| **Action** | Ouvrir https://sofient.github.io/e-commerce/snipcart-templates.html |
| **Resultat attendu** | La page s'affiche (meme si visuellement vide). Pas d'erreur 404 |

### TC-SNIP-04 : Pas d'erreur console au chargement (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir n'importe quelle page |
| **Action** | Ouvrir DevTools > Console |
| **Resultat attendu** | Aucune erreur JavaScript. Pas de 404 pour les ressources |

### TC-SNIP-05 : data-item-url correspond au deploiement (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Inspecter le code de index.html |
| **Action** | Verifier chaque data-item-url |
| **Resultat attendu** | Tous les URLs pointent vers https://sofient.github.io/e-commerce/pack-XX.html et ces pages existent |

---

## 10. BACK TO TOP BUTTON

### TC-BTT-01 : Bouton apparait apres scroll (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre en haut de index.html |
| **Action** | Scroller vers le bas (> 300px) |
| **Resultat attendu** | Un bouton rond "fleche haut" apparait en bas a droite |

### TC-BTT-02 : Bouton cache en haut de page (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre en haut de la page |
| **Action** | Verifier le bouton |
| **Resultat attendu** | Le bouton back-to-top n'est PAS visible |

### TC-BTT-03 : Clic remonte en haut (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Etre en bas de la page, bouton visible |
| **Action** | Cliquer sur le bouton |
| **Resultat attendu** | Scroll smooth jusqu'en haut de la page |

### TC-BTT-04 : Remontee instantanee si reduced-motion (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | prefers-reduced-motion active, etre en bas de page |
| **Action** | Cliquer sur le bouton |
| **Resultat attendu** | La page remonte instantanement (pas de smooth scroll) |

---

## 11. TESTS CROSS-BROWSER & PERFORMANCE

### TC-PERF-01 : Chargement initial rapide (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Reseau 4G/wifi standard |
| **Action** | Ouvrir index.html, mesurer avec DevTools > Lighthouse |
| **Resultat attendu** | First Contentful Paint < 2s. Pas de render-blocking resources (Snipcart est lazy) |

### TC-PERF-02 : Pas de layout shift (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Ouvrir index.html |
| **Action** | Mesurer CLS avec Lighthouse |
| **Resultat attendu** | Cumulative Layout Shift < 0.1 |

### TC-CROSS-01 : Chrome desktop (Positif)
| Champ | Valeur |
|-------|--------|
| **Action** | Parcourir tout le site sur Chrome desktop |
| **Resultat attendu** | Pas de bugs visuels. Glassmorphism header, animations, carousel, Snipcart fonctionnent |

### TC-CROSS-02 : Safari iOS (Positif)
| Champ | Valeur |
|-------|--------|
| **Action** | Parcourir tout le site sur Safari iPhone |
| **Resultat attendu** | Responsive correct. -webkit-backdrop-filter fonctionne. Scroll-snap sur carousel. Safe-area-insets respectes |

### TC-CROSS-03 : Firefox desktop (Positif)
| Champ | Valeur |
|-------|--------|
| **Action** | Parcourir tout le site sur Firefox |
| **Resultat attendu** | Backdrop-filter peut ne pas etre supporte sur anciennes versions. Le header doit avoir un fallback de background opaque |

---

## 12. TESTS DE SECURITE & DONNEES

### TC-SEC-01 : API key Snipcart est la cle publique (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Inspecter snipcart-init.js |
| **Action** | Verifier que la cle API est bien la cle publique (pas la cle secrete) |
| **Resultat attendu** | La cle commence par un identifiant public. La cle secrete n'est nulle part dans le code source |

### TC-SEC-02 : Pas de donnees sensibles dans le code (Negatif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Rechercher dans tous les fichiers |
| **Action** | Chercher: password, secret, private_key, token (hors cle publique Snipcart) |
| **Resultat attendu** | Aucune donnee sensible trouvee |

### TC-SEC-03 : HTTPS force (Positif)
| Champ | Valeur |
|-------|--------|
| **Precondition** | Site deploye sur GitHub Pages |
| **Action** | Acceder via http://sofient.github.io/e-commerce/ |
| **Resultat attendu** | Redirection automatique vers HTTPS (gere par GitHub Pages) |

---

## 13. TESTS DATA-ITEM SNIPCART (COHERENCE)

### TC-DATA-01 : Chaque produit a un ID unique (Positif)
| Champ | Valeur |
|-------|--------|
| **Action** | Verifier tous les data-item-id dans index.html |
| **Resultat attendu** | pack-01 a pack-10, tous uniques |

### TC-DATA-02 : Poids configures (Positif)
| Champ | Valeur |
|-------|--------|
| **Action** | Verifier data-item-weight sur chaque produit |
| **Resultat attendu** | Valeurs coherentes: Pack 10 (400g) < Pack 05 (600g) < Pack 01-02 (800g) < Pack 03-04 (1200g) < Pack 06-08 (2000g) < Pack 09 (2500g) |

### TC-DATA-03 : data-item-url pointe vers le bon pack (Negatif - regression)
| Champ | Valeur |
|-------|--------|
| **Action** | Verifier que data-item-url de pack-03 sur index.html pointe vers pack-03.html (et non pack-01.html) |
| **Resultat attendu** | Chaque data-item-url correspond exactement a son propre pack |

---

## RESUME

| Categorie | Positifs | Negatifs | Total |
|-----------|----------|----------|-------|
| Navigation & Header | 5 | 0 | 5 |
| Page Accueil | 8 | 0 | 8 |
| Pages Produit | 6 | 0 | 6 |
| Panier & Custom Fields | 10 | 2 | 12 |
| Checkout & Address Fields | 7 | 2 | 9 |
| FAQ | 5 | 0 | 5 |
| About | 3 | 0 | 3 |
| Privacy | 4 | 0 | 4 |
| Snipcart Init & Templates | 4 | 1 | 5 |
| Back to Top | 4 | 0 | 4 |
| Cross-Browser & Performance | 5 | 0 | 5 |
| Securite & Donnees | 2 | 1 | 3 |
| Coherence Data Snipcart | 2 | 1 | 3 |
| **TOTAL** | **65** | **7** | **72** |
