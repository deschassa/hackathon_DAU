# 🚀 Trustless Launchpad (Alephium Crowdfunding)

**Une plateforme communautaire d'investissement décentralisé et sécurisé sur la blockchain Alephium.**

Développé dans le cadre du **Hackathon Hackin Dau 2026** (Track : Communauté).

---

## 🎯 Le Projet

**Investir et lever des fonds de manière simple, rapide et sans confiance aveugle (Trustless).**

Ce projet permet à la communauté Alephium de financer des projets de manière transparente, sécurisée et sans aucun intermédiaire. Fini les "Rug Pulls" ou les créateurs qui disparaissent avec la caisse : notre contrat intelligent protège les investisseurs grâce à un système de libération des fonds par étapes et de remboursements automatisés.

### ⚡ Pourquoi Alephium ?
* **Sécurité (sUTXO) :** Gestion des actifs infaillible grâce au modèle sUTXO natif. Les fonds sont gérés directement par la blockchain.
* **Fiabilité (Ralph) :** Smart contracts écrits en Ralph, conçus avec l'Asset Permission System (APS) pour éviter les failles classiques.
* **Performance :** Transactions rapides et frais minimes, idéals pour le micro-financement communautaire.

---

## 📈 Évolution du Projet (Sprint Hackathon)

* **V1 :** Système de forum et de votes simples sur la blockchain.
* **V2 :** Pivot vers un système complet de Crowdfunding avec gestion du temps (TimeLocks).
* **V3 :** Intégration de métadonnées enrichies (GitHub, email) pour renforcer la confiance et mise en place de durées de financement personnalisables.
* **V4 :** Implémentation d'un système de **hashtags on-chain** permettant le tri thématique et le filtrage dynamique des projets.
* **V5 (Sécurité) :** *Trustless Milestones* - Retraits sécurisés en deux phases (50% / 100%) débloqués par un **vote pondéré** des investisseurs. Remboursements garantis en cas d'abandon.
* **V6 (UI/UX) :** Dashboard repensé avec système d'onglets dynamiques et intégration d'un Mode Sombre intégral.

---

## 🔗 Liens Utiles

* **Dépôt GitHub :** [Voir le code source](https://github.com/deschassa/hackathon_DAU)
* **Adresse du contrat (Testnet) :** `xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq`
* **Explorateur Alephium :** [Voir le contrat sur l'Explorer](https://explorer.testnet.alephium.org/addresses/xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq)
* **Démo en ligne :** *(À venir)*

---

## 💻 Installation & Lancement (Local)

Le projet est configuré pour interagir avec le réseau **Testnet** d'Alephium.

**1. Cloner le projet :**

    git clone https://github.com/deschassa/hackathon_DAU.git
**2. Installer les dépendances :**

    npm install
    
**3. Compiler les contrats Ralph :**

    npx @alephium/cli@latest compile --network testnet

**4. Lancer l'interface graphique :**

    npm run dev

🌐 *Le site sera accessible sur :* [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture Technique

* **`/contracts` :** Cœur de la logique décentralisée. Contient le Smart Contract développé en Ralph (`ForumSondage.ral`).
* **( `/app`) :** Interface utilisateur (Frontend) développée avec **React/Next.js** et connectée à la blockchain via `@alephium/web3`.
* **`/scripts` :** Scripts automatisés de déploiement sur le réseau Testnet.
* **`/deployments` :** Stockage local de l'historique et des adresses des contrats déployés.

---

## 👥 Équipe

* **Fulgrim** : Développeur Web3 / Smart Contracts
* **Mr_glace** : Développeur Web3 / Smart Contracts

---
*Projet réalisé dans le cadre du Hackathon Hackin Dau 2026. Inspiré par le template "https://github.com/alephium/react-dapp-template" et propulsé par Gemini.*

