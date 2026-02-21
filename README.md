# Crowfounding

Un outil communautaire de [d'investissement] décentralisé sur la blockchain Alephium.

---


##  Évolution du Projet (Hackathon)
- **V1  :** Système de forum et de votes simples sur la blockchain.
- **V2  :** Pivot vers un système complet de Crowdfunding (Financement participatif) avec gestion du temps (TimeLocks), remboursements automatiques en cas d'échec, et retraits sécurisés pour les créateurs.
- **V3  :** Intégration de métadonnées enrichies (GitHub, contact) pour renforcer la confiance et mise en place de durées de financement personnalisables via des TimeLocks natifs
- **V4  :** Implémentation d'un système de hashtags on-chain permettant le tri thématique et le filtrage dynamique des projets pour une expérience utilisateur fluide et scalable.

##  LE PROJET

[Investir de manière simple et rapide par Alephium].
Ce projet permet à la communauté Alephium de [financer] de manière transparente, sécurisée et sans intermédiaire, en utilisant la puissance du modèle sUTXO.

### Pourquoi Alephium ?
- Sécurité : Modèle sUTXO pour une gestion d'actifs infaillible.
- Performance : Transactions rapides et frais minimes.
- Fiabilité : Smart contracts écrits en Ralph, conçus pour éviter les failles classiques.

---

##  LIENS UTILES

- Démo en ligne : [pas_encore_disponible]
- Adresse du contrat (Testnet) : [xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq]
- Explorateur Alephium : https://explorer.testnet.alephium.org/addresses/[xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq]

---

##  INSTALLATION & LANCEMENT (LOCAL)

Le projet est configuré pour interagir avec le réseau Testnet.

1. Cloner le projet :
git clone [https://github.com/deschassa/hackathon_DAU]
cd [hackathon_DAU]

2. Installer les dépendances :
npm install
npm install dotenv

4. Compiler les contrats Ralph :
npx @alephium/cli@latest compile --network testnet

5. Lancer l'interface graphique :
npm run dev

Le site sera accessible sur : http://localhost:3000

---

##  ARCHITECTURE TECHNIQUE

- Smart Contracts : Situés dans /contracts, développés en Ralph.
- Frontend : Situé dans /app (ou /src), développé avec Next.js et @alephium/web3.
- Déploiement : Les scripts de déploiement sont dans /scripts.
- Configuration : Les adresses des contrats déployés sont stockées dans /deployments.

---

##  ÉQUIPE

- [Fulgrim] : Dev
- [Mr_glace] : Dev

---

Projet réalisé dans le cadre du Hackathon Alephium 2026. 
Inspiré par le template "Livre d'or" et propulsé par Gemini
