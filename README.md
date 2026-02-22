# 🚀 Trustless Launchpad (Alephium Crowdfunding)

**A decentralized and secure community investment platform built on the Alephium blockchain.**

Developed for the **Hackin' DAU 2026 Hackathon** (Track: Community).

---

## 🎯 The Project

**Invest and raise funds simply, quickly, and without blind trust (Trustless).**

This project empowers the Alephium community to fund projects transparently, securely, and without any intermediaries. Say goodbye to "Rug Pulls" or creators disappearing with the treasury: our smart contract protects investors through a milestone-based fund release system and automated refunds.

### ⚡ Why Alephium?
* **Security (sUTXO):** Bulletproof asset management thanks to the native sUTXO model. Funds are managed directly by the blockchain.
* **Reliability (Ralph):** Smart contracts written in Ralph, leveraging the Asset Permission System (APS) to prevent common vulnerabilities by design.
* **Performance:** Lightning-fast transactions with minimal fees, making it ideal for community micro-funding.

---

## 📈 Project Evolution (Hackathon Sprint)

* **V1:** Simple on-chain forum and voting system.
* **V2:** Pivot to a full Crowdfunding ecosystem with time management (TimeLocks).
* **V3:** Integration of enriched metadata (GitHub, email) to build trust.
* **V4:** Implementation of an **on-chain hashtag** system for dynamic project filtering.
* **V5 (Security):** *Trustless Milestones* - Secure two-phase withdrawals (50% / 100%) unlocked by a weighted investor vote. Guaranteed refunds in case of project abandonment.
* **V6 (UI/UX):** Fully redesigned dashboard with dynamic tabs, token-gating (private Discord access), on-chain reputation profiling, and native Dark Mode.

---

## 🔗 Useful Links

* **GitHub Repository:** [https://github.com/deschassa/hackathon_DAU](https://github.com/deschassa/hackathon_DAU)
* **Contract Address (Testnet):** xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq
* **Alephium Explorer:** [https://explorer.testnet.alephium.org/addresses/xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq](https://explorer.testnet.alephium.org/addresses/xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq)

---

## 💻 Setup & Local Launch

The project is configured to interact with the Alephium **Testnet** network.

**1. Clone the repository:**
git clone [https://github.com/deschassa/hackathon_DAU.git](https://github.com/deschassa/hackathon_DAU.git)
cd hackathon_DAU

**2. Install dependencies:**
npm install

**3. Compile Ralph smart contracts:**
npx @alephium/cli@latest compile --network testnet

**4. Run the frontend development server:**
npm run dev

🌐 *The application will be available at:* http://localhost:3000

---

## 🏗️ Technical Architecture

* **/contracts:** Core decentralized logic. Contains the Smart Contract written in Ralph (ForumSondage.ral).
* **/src/app & /src/components:** Frontend user interface built with React/Next.js and connected to the blockchain via @alephium/web3-react.
* **/scripts:** Automated deployment scripts for the Testnet network.
* **/deployments:** Local storage tracking deployment history and deployed contract addresses.

---

## 👥 Team

* **Fulgrim**: Web3 / Smart Contract Developer
* **Mr_glace**: Web3 / Smart Contract Developer

---
*Project built for the Hackin' DAU 2026 Hackathon. Inspired by the Alephium react-dapp-template and powered by Gemini.*

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
    cd hackathon_DAU
    
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

