'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { stringToHex, hexToString, web3, NodeProvider, groupOfAddress, ONE_ALPH } from '@alephium/web3'
import { ForumSondage } from '../../../artifacts/ts' 

export const TokenDapp = () => {
  // 🚨 ADRESSE DU CONTRAT
  const CONTRACT_ADDRESS = "23NxVaQXXDmgaqtvdynerjr4TyNFR9caE1LQSQ3taAoF5" 
  const contractGroup = groupOfAddress(CONTRACT_ADDRESS)

  const { signer, account } = useWallet() 
  
  // États pour le formulaire de création
  const [nouveauTitre, setNouveauTitre] = useState('')
  const [nouvelleDescription, setNouvelleDescription] = useState('')
  const [nouveauxLiens, setNouveauxLiens] = useState('')             
  const [nouvelObjectif, setNouvelObjectif] = useState('')
  const [nouvelleDuree, setNouvelleDuree] = useState('5')            
  const [nouveauxTags, setNouveauxTags] = useState('') // 🆕 Hashtags à la création
  
  // États pour les dons et l'affichage
  const [montantsDon, setMontantsDon] = useState<{ [key: number]: string }>({})
  const [projets, setProjets] = useState<any[]>([])
  const [chargement, setChargement] = useState(false)
  
  // Horloge interne pour les comptes à rebours
  const [tempsActuel, setTempsActuel] = useState(Date.now())
  
  // 🆕 État pour le filtrage actif
  const [filtreActif, setFiltreActif] = useState('')   

  useEffect(() => {
    const timer = setInterval(() => setTempsActuel(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ==========================================
  // 👓 LECTURE DES PROJETS
  // ==========================================
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
        
        const tagsRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getHashtags({ args: { id: BigInt(i) } })
        const descRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDescription({ args: { id: BigInt(i) } })
        const liensRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getLiens({ args: { id: BigInt(i) } })
        
        projetsCharges.push({
          id: i,
          titre: hexToString(titreRes.returns),
          description: hexToString(descRes.returns),
          liens: hexToString(liensRes.returns),      
          objectif: Number(objRes.returns) / 1e18,
          recolte: Number(fondRes.returns) / 1e18,
          deadline: Number(deadRes.returns),         
          hashtags: hexToString(tagsRes.returns), // 🆕
          estCloture: clotureRes.returns
        })
      }
      setProjets(projetsCharges)
    } catch (error) { console.error("Erreur de lecture :", error) }
    setChargement(false)
  }

  useEffect(() => { chargerProjets() }, [])

  // ==========================================
  // ✍️ ÉCRITURE : CRÉER UN PROJET
  // ==========================================
  const publierProjet = async () => {
      if (!signer || !account) return alert("⚠️ Connecte ton wallet Alephium !")
      if (account.group !== contractGroup) return alert(`❌ ERREUR D'UNIVERS : Passe sur le Groupe ${contractGroup}.`)
      if (!nouveauTitre || !nouvelObjectif) return alert("⚠️ Remplis au moins le titre et l'objectif !")

      const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
      web3.setCurrentNodeProvider(node)

      try {
        const objectifEnAttoAlph = BigInt(nouvelObjectif) * ONE_ALPH
        const dureeEnMs = BigInt(nouvelleDuree) * 60n * 1000n 

        await ForumSondage.at(CONTRACT_ADDRESS).transact.creerProjet({
          signer: signer,
          args: { 
            titre: stringToHex(nouveauTitre), 
            description: stringToHex(nouvelleDescription),
            liensProjet: stringToHex(nouveauxLiens), 
            tags: stringToHex(nouveauxTags.toLowerCase()), // 🆕 Tags en minuscule
            objectif: objectifEnAttoAlph,
            dureeEnMs: dureeEnMs
          },
          attoAlphAmount: ONE_ALPH / 10n 
        })
        
        alert(`🎉 PROJET CRÉÉ ! Validité : ${nouvelleDuree} minutes.`)
        // Vidage du formulaire
        setNouveauTitre(''); setNouvelleDescription(''); setNouveauxLiens(''); setNouvelObjectif(''); setNouvelleDuree('5'); setNouveauxTags('');
      } catch (error) { console.error(error); alert("❌ Échec de la création.") }
  }

  // ==========================================
  // 💸 TRANSACTIONS FINANCIÈRES
  // ==========================================
  const financerProjet = async (projetId: number) => {
    if (!signer || !account) return alert("⚠️ Connecte ton wallet !")
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
    } catch (e) { console.error(e); alert("Erreur de transaction. Le projet est peut-être expiré.") }
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
  // 🎛️ LOGIQUE DE FILTRAGE PAR HASHTAGS
  // ==========================================
  
  // 1. On extrait une liste unique de tous les hashtags présents dans les projets
  const tousLesTagsDisponibles = Array.from(
    new Set(
      projets.flatMap(p => p.hashtags ? p.hashtags.split(' ') : [])
    )
  ).filter(tag => tag.startsWith('#'))

  // 2. On filtre les projets à afficher en fonction du bouton cliqué
  const projetsFiltres = filtreActif 
    ? projets.filter(p => p.hashtags && p.hashtags.includes(filtreActif))
    : projets;

  // ==========================================
  // 🎨 L'AFFICHAGE DU SITE
  // ==========================================
  return (
    <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      
      <div style={{ padding: '15px', background: '#e0f7fa', color: '#006064', borderRadius: '8px', marginBottom: '20px', border: '1px solid #b2ebf2' }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🚀 Alephium Crowdfunding</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '16px' }}>
          <li>Univers du Contrat : <strong>Groupe {contractGroup}</strong></li>
          <li>Univers de ton Wallet : <strong>Groupe {account ? account.group : 'Non connecté'}</strong></li>
        </ul>
      </div>

      {/* --- FORMULAIRE CRÉATION --- */}
      <div style={{ marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6', marginBottom: '30px' }}>
        <h3>Lancer un nouveau projet</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="Nom du projet" value={nouveauTitre} onChange={(e) => setNouveauTitre(e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="number" placeholder="Objectif (ALPH)" value={nouvelObjectif} onChange={(e) => setNouvelObjectif(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
            <input type="number" placeholder="Durée (Minutes)" value={nouvelleDuree} onChange={(e) => setNouvelleDuree(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} title="Durée de la levée de fonds" />
          </div>

          <input type="text" placeholder="Description courte (Le pitch de ton projet)" value={nouvelleDescription} onChange={(e) => setNouvelleDescription(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          <input type="text" placeholder="Liens utiles (ex: github.com/projet | @twitter)" value={nouveauxLiens} onChange={(e) => setNouveauxLiens(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          {/* 🆕 CHAMP HASHTAGS */}
          <input type="text" placeholder="Hashtags (ex: #web3 #gaming #art)" value={nouveauxTags} onChange={(e) => setNouveauxTags(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
          
          <button onClick={publierProjet} style={{ padding: '12px 24px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>
            Créer le projet
          </button>
        </div>
      </div>

      {/* --- LISTE DES PROJETS --- */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Projets en cours de financement</h3>
          <button onClick={chargerProjets} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            🔄 Rafraîchir
          </button>
        </div>

        {/* 🎛️ BARRE DE FILTRAGE DYNAMIQUE */}
        {tousLesTagsDisponibles.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <span style={{ fontWeight: 'bold', marginRight: '15px' }}>Trier par thème :</span>
            <button 
              onClick={() => setFiltreActif('')} 
              style={{ padding: '6px 12px', margin: '0 5px', borderRadius: '20px', border: filtreActif === '' ? 'none' : '1px solid #ccc', background: filtreActif === '' ? '#0070f3' : 'white', color: filtreActif === '' ? 'white' : 'black', cursor: 'pointer', transition: '0.2s' }}
            >
              Tous
            </button>
            {tousLesTagsDisponibles.map(tag => (
              <button 
                key={tag} 
                onClick={() => setFiltreActif(tag)} 
                style={{ padding: '6px 12px', margin: '0 5px', borderRadius: '20px', border: filtreActif === tag ? 'none' : '1px solid #ccc', background: filtreActif === tag ? '#10b981' : 'white', color: filtreActif === tag ? 'white' : 'black', cursor: 'pointer', transition: '0.2s' }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {chargement ? <p style={{ color: '#0070f3', fontWeight: 'bold' }}>⏳ Chargement blockchain...</p> : (
          /* 🆕 ON UTILISE projetsFiltres AU LIEU DE projets */
          projetsFiltres.map((projet) => {
            const tempsRestant = Math.max(0, Math.floor((projet.deadline - tempsActuel) / 1000))
            const estFini = tempsRestant === 0
            const objectifAtteint = projet.recolte >= projet.objectif

            return (
              <div key={projet.id} style={{ background: 'white', padding: '20px', marginBottom: '15px', marginTop: '15px', borderRadius: '8px', borderLeft: projet.estCloture ? '6px solid #6c757d' : '6px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{projet.titre}</div>
                  {projet.estCloture ? (
                    <span style={{ color: '#6c757d', fontWeight: 'bold' }}>🔒 CAISSE FERMÉE</span>
                  ) : (
                    <span style={{ color: estFini ? 'red' : '#f59e0b', fontWeight: 'bold' }}>
                      {estFini ? '⏳ Temps écoulé' : `⏱️ Reste : ${tempsRestant} s`}
                    </span>
                  )}
                </div>

                {/* 🆕 AFFICHAGE DES HASHTAGS SUR LA CARTE */}
                {projet.hashtags && (
                  <div style={{ marginTop: '10px' }}>
                    {projet.hashtags.split(' ').map((tag: string) => tag.startsWith('#') && (
                      <span key={tag} style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '5px', fontWeight: 'bold' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '14px', color: '#4b5563', margin: '15px 0', padding: '10px', background: '#f3f4f6', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 5px 0' }}>📝 <strong>À propos :</strong> {projet.description || 'Aucune description'}</p>
                  <p style={{ margin: 0 }}>🔗 <strong>Liens :</strong> <span style={{ color: '#0070f3' }}>{projet.liens || 'Aucun lien fourni'}</span></p>
                </div>

                <div style={{ margin: '15px 0' }}>
                  <strong>{projet.recolte} ALPH</strong> / {projet.objectif} ALPH
                  <div style={{ width: '100%', background: '#e9ecef', height: '8px', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((projet.recolte / projet.objectif) * 100, 100)}%`, background: objectifAtteint ? '#10b981' : '#0070f3', height: '100%' }}></div>
                  </div>
                </div>

                {!projet.estCloture && (
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px' }}>
                    
                    {!estFini && (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input type="number" placeholder="Ex: 2.5" value={montantsDon[projet.id] || ''} onChange={(e) => setMontantsDon({...montantsDon, [projet.id]: e.target.value})} style={{ padding: '8px', width: '100px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <button onClick={() => financerProjet(projet.id)} style={{ background: '#0070f3', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Donner (ALPH)</button>
                      </div>
                    )}

                    {objectifAtteint && (
                       <button onClick={() => retirerFonds(projet.id)} style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🏆 Retirer les fonds</button>
                    )}

                    {estFini && !objectifAtteint && (
                      <button onClick={() => demanderRemboursement(projet.id)} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🛡️ Demander remboursement</button>
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
