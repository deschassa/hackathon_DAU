'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { stringToHex, hexToString, web3, NodeProvider, groupOfAddress, ONE_ALPH } from '@alephium/web3'
import { ForumSondage } from '../../../artifacts/ts' 

export const TokenDapp = () => {
  // 🚨 REMPLACE PAR TA NOUVELLE ADRESSE :
  const CONTRACT_ADDRESS = "24o2SiaDyS4bNH7H8HE2oqNdhhncffp22XwZR8C6457uq" 
  const contractGroup = groupOfAddress(CONTRACT_ADDRESS)

  const { signer, account } = useWallet() 
  const [nouveauTitre, setNouveauTitre] = useState('')
  const [nouvelObjectif, setNouvelObjectif] = useState('') 
  
  // NOUVEAU : Un état pour gérer le montant libre de chaque projet
  const [montantsDon, setMontantsDon] = useState<{ [key: number]: string }>({})
  
  const [projets, setProjets] = useState<any[]>([])
  const [chargement, setChargement] = useState(false)
  const [tempsActuel, setTempsActuel] = useState(Date.now())

  // Met à jour l'horloge interne pour les comptes à rebours
  useEffect(() => {
    const timer = setInterval(() => setTempsActuel(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const chargerProjets = async () => {
    setChargement(true)
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)

    try {
      const totalResult = await ForumSondage.at(CONTRACT_ADDRESS).view.getTotalProjets()
      const total = Number(totalResult.returns)
      let projetsCharges = []

      for(let i = 0; i < total; i++) {
        const titreRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getTitre({ args: { id: BigInt(i) } })
        const objRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getObjectif({ args: { id: BigInt(i) } })
        const fondRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getFondsRecoltes({ args: { id: BigInt(i) } })
        const deadRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDeadline({ args: { id: BigInt(i) } })
        const clotureRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getEstCloture({ args: { id: BigInt(i) } })
        
        projetsCharges.push({
          id: i,
          titre: hexToString(titreRes.returns),
          objectif: Number(objRes.returns) / 1e18,
          recolte: Number(fondRes.returns) / 1e18,
          deadline: Number(deadRes.returns),
          estCloture: clotureRes.returns
        })
      }
      setProjets(projetsCharges)
    } catch (error) { console.error(error) }
    setChargement(false)
  }

  useEffect(() => { chargerProjets() }, [])

  // ==========================================
  // LES TRANSACTIONS
  // ==========================================
  const publierProjet = async () => {
      if (!signer || !account) return alert("Connecte ton wallet !")
      const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
      web3.setCurrentNodeProvider(node)

      try {
        const objectifEnAttoAlph = BigInt(nouvelObjectif) * ONE_ALPH
        await ForumSondage.at(CONTRACT_ADDRESS).transact.creerProjet({
          signer: signer,
          args: { titre: stringToHex(nouveauTitre), objectif: objectifEnAttoAlph },
          attoAlphAmount: ONE_ALPH / 10n 
        })
        alert(`🎉 PROJET CRÉÉ ! Validité : 5 minutes.`)
        setNouveauTitre('') ; setNouvelObjectif('')
      } catch (e) { console.error(e); alert("Erreur lors de la création.") }
  }

  const financerProjet = async (projetId: number) => {
    if (!signer || !account) return alert("Connecte ton wallet !")
    const montantSaisi = montantsDon[projetId]
    if (!montantSaisi || Number(montantSaisi) <= 0) return alert("Saisis un montant valide en ALPH !")

    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)

    try {
      const montantEnAttoAlph = BigInt(Math.floor(Number(montantSaisi) * 1e18))
      await ForumSondage.at(CONTRACT_ADDRESS).transact.financerProjet({
        signer: signer,
        args: { id: BigInt(projetId), montant: montantEnAttoAlph },
        attoAlphAmount: montantEnAttoAlph + (ONE_ALPH / 10n) 
      })
      alert(`💸 Don de ${montantSaisi} ALPH envoyé !`)
    } catch (e) { console.error(e); alert("Erreur de transaction.") }
  }

  const retirerFonds = async (projetId: number) => {
    if (!signer) return
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.retirerFonds({
        signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n
      })
      alert(`🏆 SUCCÈS ! Les fonds ont été virés sur ton wallet !`)
    } catch (e) { alert("Erreur : Seul le créateur peut retirer, et l'objectif doit être atteint.") }
  }

  const demanderRemboursement = async (projetId: number) => {
    if (!signer) return
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.rembourser({
        signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n
      })
      alert(`🛡️ REMBOURSÉ ! Ton argent est de retour sur ton wallet.`)
    } catch (e) { alert("Erreur : Tu n'as rien donné, ou le temps n'est pas encore écoulé.") }
  }

  // ==========================================
  // L'AFFICHAGE
  // ==========================================
  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
        <h3>🚀 Lancer un nouveau projet (Durée : 5 minutes)</h3>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <input type="text" placeholder="Nom du projet" value={nouveauTitre} onChange={(e) => setNouveauTitre(e.target.value)} style={{ flex: 2, padding: '10px' }} />
          <input type="number" placeholder="Objectif (ALPH)" value={nouvelObjectif} onChange={(e) => setNouvelObjectif(e.target.value)} style={{ flex: 1, padding: '10px' }} />
          <button onClick={publierProjet} style={{ padding: '10px 20px', background: '#0070f3', color: 'white', cursor: 'pointer' }}>Créer</button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Projets en cours</h3>
          <button onClick={chargerProjets} style={{ padding: '8px 16px', cursor: 'pointer' }}>🔄 Actualiser</button>
        </div>

        {chargement ? <p>⏳ Chargement...</p> : (
          projets.map((projet) => {
            const tempsRestant = Math.max(0, Math.floor((projet.deadline - tempsActuel) / 1000))
            const estFini = tempsRestant === 0
            const objectifAtteint = projet.recolte >= projet.objectif

            return (
              <div key={projet.id} style={{ background: 'white', padding: '20px', marginBottom: '15px', marginTop: '15px', borderRadius: '8px', borderLeft: projet.estCloture ? '6px solid #6c757d' : '6px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{projet.titre}</div>
                  
                  {projet.estCloture ? (
                    <span style={{ color: '#6c757d', fontWeight: 'bold' }}>🔒 CAISSE FERMÉE (Fonds retirés)</span>
                  ) : (
                    <span style={{ color: estFini ? 'red' : '#f59e0b', fontWeight: 'bold' }}>
                      {estFini ? '⏳ Temps écoulé' : `⏱️ Reste : ${tempsRestant} s`}
                    </span>
                  )}
                </div>

                <div style={{ margin: '15px 0' }}>
                  <strong>{projet.recolte} ALPH</strong> / {projet.objectif} ALPH
                  <div style={{ width: '100%', background: '#e9ecef', height: '8px', borderRadius: '4px', marginTop: '8px' }}>
                    <div style={{ width: `${Math.min((projet.recolte / projet.objectif) * 100, 100)}%`, background: objectifAtteint ? '#10b981' : '#0070f3', height: '100%' }}></div>
                  </div>
                </div>

                {!projet.estCloture && (
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
                    {/* SI LE TEMPS N'EST PAS ÉCOULÉ : ON PEUT DONNER */}
                    {!estFini && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input type="number" placeholder="Montant" value={montantsDon[projet.id] || ''} onChange={(e) => setMontantsDon({...montantsDon, [projet.id]: e.target.value})} style={{ padding: '8px', width: '100px' }} />
                        <button onClick={() => financerProjet(projet.id)} style={{ background: '#0070f3', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer' }}>Financer</button>
                      </div>
                    )}

                    {/* SI OBJECTIF ATTEINT : LE CRÉATEUR PEUT RETIRER */}
                    {objectifAtteint && (
                       <button onClick={() => retirerFonds(projet.id)} style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🏆 Retirer les fonds</button>
                    )}

                    {/* SI ÉCHEC ET TEMPS ÉCOULÉ : LES DONATEURS PEUVENT ÊTRE REMBOURSÉS */}
                    {estFini && !objectifAtteint && (
                      <button onClick={() => demanderRemboursement(projet.id)} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🛡️ Demander remboursement</button>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
