'use client'

import React, { useState, useEffect } from 'react' // 👈 AJOUT DE useEffect
import { useWallet } from '@alephium/web3-react'
// 👈 AJOUT DE hexToString pour traduire le langage blockchain en français
import { stringToHex, hexToString, web3, NodeProvider, groupOfAddress, ONE_ALPH } from '@alephium/web3'
import { ForumSondage } from '../../../artifacts/ts'

export const TokenDapp = () => {
  // 🚨 REMPLACE PAR TA TOUTE NOUVELLE ADRESSE :
  const CONTRACT_ADDRESS = "xRLgxuP211rUVprGbTdsJJtzSi6gcwLmKYCk2gER3CKq" 
  const contractGroup = groupOfAddress(CONTRACT_ADDRESS)

  const { signer, account } = useWallet() 
  const [nouveauTitre, setNouveauTitre] = useState('')
  const [sondages, setSondages] = useState<{id: number, titre: string, votes: number}[]>([])
  
  // Petit bonus visuel pour montrer que ça charge
  const [chargement, setChargement] = useState(false)

  // ==========================================
  // 👓 NOUVEAU : LA FONCTION QUI LIT LA BLOCKCHAIN
  // ==========================================
  const chargerSondages = async () => {
    setChargement(true)
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)

    try {
      // 1. On demande au contrat : "Combien as-tu de sondages en stock ?"
      const totalResult = await ForumSondage.at(CONTRACT_ADDRESS).view.getTotalSondages()
      const total = Number(totalResult.returns)
      
      let sondagesCharges = []

      // 2. On boucle pour lire le titre et les votes de CHAQUE sondage
      for(let i = 0; i < total; i++) {
        const titreResult = await ForumSondage.at(CONTRACT_ADDRESS).view.getTitre({ args: { id: BigInt(i) } })
        const votesResult = await ForumSondage.at(CONTRACT_ADDRESS).view.getVotes({ args: { id: BigInt(i) } })
        
        sondagesCharges.push({
          id: i,
          titre: hexToString(titreResult.returns), // On traduit l'Hexadécimal en texte
          votes: Number(votesResult.returns)
        })
      }
      
      // 3. On met à jour l'affichage avec l'historique officiel !
      setSondages(sondagesCharges)
    } catch (error) {
      console.error("Erreur lors de la lecture sur la blockchain", error)
    }
    setChargement(false)
  }

  // Ce 'useEffect' lance la fonction 'chargerSondages' TOUT SEUL dès que la page s'ouvre !
  useEffect(() => {
    chargerSondages()
  }, []) // Les crochets vides veulent dire : "Fais-le une seule fois au démarrage"

  // ==========================================
  // FONCTIONS D'ÉCRITURE (Créer et Voter)
  // ==========================================
  const publierSondage = async () => {
      if (!signer || !account) return alert("⚠️ Connecte d'abord ton wallet !")
      if (account.group !== contractGroup) return alert(`❌ ERREUR D'UNIVERS : Passe sur le Groupe ${contractGroup}.`)

      const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
      web3.setCurrentNodeProvider(node)

      try {
        const resultat = await ForumSondage.at(CONTRACT_ADDRESS).transact.creerSondage({
          signer: signer,
          args: { titre: stringToHex(nouveauTitre) },
          attoAlphAmount: ONE_ALPH / 10n 
        })
        alert(`🎉 SONDAGE CRÉÉ !\nPatiente 30s puis clique sur "Rafraîchir" pour le voir !`)
        setNouveauTitre('') 
      } catch (error) {
        console.error(error)
        alert("❌ Oups, la transaction a échoué.")
      }
    }

  const voterPourSondage = async (sondageId: number) => {
    if (!signer || !account) return alert("⚠️ Connecte d'abord ton wallet !")

    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)

    try {
      const resultat = await ForumSondage.at(CONTRACT_ADDRESS).transact.voterPour({
        signer: signer,
        args: { id: BigInt(sondageId) },
        attoAlphAmount: ONE_ALPH / 10n 
      })
      alert(`🗳️ A VOTÉ !\nPatiente 30s puis clique sur "Rafraîchir" pour voir le score monter !`)
    } catch (error) {
      console.error(error)
      alert("❌ Oups, le vote a échoué.")
    }
  }

  // ==========================================
  // L'AFFICHAGE DU SITE
  // ==========================================
  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      
      <div style={{ padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ffeeba' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🕵️ Scanner de Sharding</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '16px' }}>
          <li>Univers du Contrat : <strong>Groupe {contractGroup}</strong></li>
          <li>Univers de votre Portefeuille : <strong>Groupe {account ? account.group : 'Non connecté'}</strong></li>
        </ul>
      </div>

      <h2 style={{ borderBottom: '2px solid #e9ecef', paddingBottom: '10px' }}>📢 Forum des Initiatives</h2>
      
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
        <h3>Créer un nouveau sondage</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input 
            type="text" 
            placeholder="Ex: Faut-il construire un Kickstarter Web3 ?" 
            value={nouveauTitre}
            onChange={(e) => setNouveauTitre(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
          />
          <button onClick={publierSondage} style={{ padding: '12px 24px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Publier sur la Blockchain
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Initiatives en cours</h3>
          {/* Un petit bouton pour mettre à jour la page sans faire F5 */}
          <button onClick={chargerSondages} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            🔄 Rafraîchir les données
          </button>
        </div>

        {chargement ? (
          <p style={{ color: '#0070f3', fontWeight: 'bold' }}>⏳ Connexion à la blockchain en cours...</p>
        ) : sondages.length === 0 ? (
           <p style={{ color: '#6c757d', fontStyle: 'italic' }}>Aucun sondage pour le moment. Soyez le premier !</p>
        ) : (
          sondages.map((sondage) => (
            <div key={sondage.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px', marginBottom: '15px', marginTop: '15px', borderRadius: '8px', borderLeft: '6px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '18px', fontWeight: '500' }}>{sondage.titre}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '16px', color: '#6c757d', fontWeight: 'bold' }}>Votes: {sondage.votes}</span>
                <button onClick={() => voterPourSondage(sondage.id)} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
                  Voter POUR (+1)
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}