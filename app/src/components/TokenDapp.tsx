'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { stringToHex, hexToString, web3, NodeProvider, groupOfAddress, ONE_ALPH } from '@alephium/web3'
import { ForumSondage } from '../../../artifacts/ts' 

export const TokenDapp = () => {
  // 🚨 GARDE BIEN TON ADRESSE ICI :
  const CONTRACT_ADDRESS = "zqpBh2xGVxsg7jYGki1DgScP5nC6DjuBQ9VpyBfqzhvw" 
  const contractGroup = groupOfAddress(CONTRACT_ADDRESS)

  const { signer, account } = useWallet() 
  
  // États Formulaire
  const [nouveauTitre, setNouveauTitre] = useState('')
  const [nouvelleDescription, setNouvelleDescription] = useState('')
  const [nouveauxLiens, setNouveauxLiens] = useState('')             
  const [nouvelObjectif, setNouvelObjectif] = useState('')
  const [nouvelleDuree, setNouvelleDuree] = useState('5')            
  const [nouveauxTags, setNouveauxTags] = useState('')
  
  // États Actions
  const [montantsDon, setMontantsDon] = useState<{ [key: number]: string }>({})
  const [notesVote, setNotesVote] = useState<{ [key: number]: string }>({}) 
  
  // États d'affichage
  const [projets, setProjets] = useState<any[]>([])
  const [chargement, setChargement] = useState(false)
  const [tempsActuel, setTempsActuel] = useState(Date.now())
  const [filtreActif, setFiltreActif] = useState('')   
  const [ongletActif, setOngletActif] = useState('en_cours') 
  
  // 🌓 MODE SOMBRE
  const [isDarkMode, setIsDarkMode] = useState(false)

  // 🎨 PALETTE DE COULEURS DYNAMIQUE
  const theme = {
    bg: isDarkMode ? '#111827' : '#f8f9fa',
    cardBg: isDarkMode ? '#1f2937' : 'white',
    text: isDarkMode ? '#f3f4f6' : '#1f2937',
    textMuted: isDarkMode ? '#9ca3af' : '#4b5563',
    border: isDarkMode ? '#374151' : '#dee2e6',
    inputBg: isDarkMode ? '#374151' : '#ffffff',
    inputText: isDarkMode ? '#ffffff' : '#000000',
    headerBg: isDarkMode ? '#0f766e' : '#e0f7fa',
    headerText: isDarkMode ? '#ccfbf1' : '#006064',
    headerBorder: isDarkMode ? '#115e59' : '#b2ebf2',
    infoBoxBg: isDarkMode ? '#374151' : '#f3f4f6',
  }

  // 🛠️ CORRECTION : Appliquer le fond sombre à tout le <body> de la page web
  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.margin = '0'; // Enlève les marges blanches autour
  }, [isDarkMode, theme.bg, theme.text]);

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
        const tagsRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getHashtags({ args: { id: BigInt(i) } })
        const descRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDescription({ args: { id: BigInt(i) } })
        const liensRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getLiens({ args: { id: BigInt(i) } })
        const annuleRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getEstAnnule({ args: { id: BigInt(i) } })
        const phaseRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getPhaseRetrait({ args: { id: BigInt(i) } })
        
        projetsCharges.push({
          id: i,
          titre: hexToString(titreRes.returns),
          description: hexToString(descRes.returns),
          liens: hexToString(liensRes.returns),      
          objectif: Number(objRes.returns) / 1e18,
          recolte: Number(fondRes.returns) / 1e18,
          deadline: Number(deadRes.returns),         
          hashtags: hexToString(tagsRes.returns), 
          estAnnule: annuleRes.returns,          
          phaseRetrait: Number(phaseRes.returns) 
        })
      }
      setProjets(projetsCharges)
    } catch (error) { console.error("Erreur de lecture :", error) }
    setChargement(false)
  }

  useEffect(() => { chargerProjets() }, [])

  // === FONCTIONS D'ÉCRITURE === 
  const publierProjet = async () => {
      if (!signer || !account) return alert("⚠️ Connecte ton wallet !")
      if (!nouveauTitre || !nouvelObjectif) return alert("⚠️ Remplis au moins le titre et l'objectif !")
      const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
      web3.setCurrentNodeProvider(node)
      try {
        const objectifEnAttoAlph = BigInt(nouvelObjectif) * ONE_ALPH
        const dureeEnMs = BigInt(nouvelleDuree) * 60n * 1000n 
        await ForumSondage.at(CONTRACT_ADDRESS).transact.creerProjet({
          signer: signer,
          args: { titre: stringToHex(nouveauTitre), description: stringToHex(nouvelleDescription), liensProjet: stringToHex(nouveauxLiens), tags: stringToHex(nouveauxTags.toLowerCase()), objectif: objectifEnAttoAlph, dureeEnMs: dureeEnMs },
          attoAlphAmount: ONE_ALPH / 10n 
        })
        alert(`🎉 PROJET CRÉÉ ! Validité : ${nouvelleDuree} minutes.`)
        setNouveauTitre(''); setNouvelleDescription(''); setNouveauxLiens(''); setNouvelObjectif(''); setNouvelleDuree('5'); setNouveauxTags('');
      } catch (error) { alert("❌ Échec de la création.") }
  }

  const financerProjet = async (projetId: number) => {
    if (!signer) return alert("⚠️ Connecte ton wallet !")
    const montantSaisi = montantsDon[projetId]
    if (!montantSaisi || Number(montantSaisi) <= 0) return alert("Saisis un montant valide en ALPH !")
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      const montantEnAttoAlph = BigInt(Math.floor(Number(montantSaisi) * 1e18))
      await ForumSondage.at(CONTRACT_ADDRESS).transact.financerProjet({ signer: signer, args: { id: BigInt(projetId), montant: montantEnAttoAlph }, attoAlphAmount: montantEnAttoAlph + (ONE_ALPH / 10n) })
      alert(`💸 Don de ${montantSaisi} ALPH envoyé !`)
    } catch (e) { alert("Erreur : Projet expiré ou annulé.") }
  }

  const retirerFonds = async (projetId: number) => {
    if (!signer) return
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.retirerFonds({ signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n })
      alert(`🏆 SUCCÈS ! Les fonds de cette phase ont été virés sur ton wallet !`)
    } catch (e) { alert("Erreur : Tu n'es pas le créateur ou les conditions ne sont pas remplies.") }
  }

  const annulerMonProjet = async (projetId: number) => {
    if (!signer) return
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.annulerProjet({ signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n })
      alert(`🚩 Projet annulé ! Les investisseurs peuvent se rembourser.`)
    } catch (e) { alert("Erreur : Seul le créateur peut annuler son projet.") }
  }

  const voterProjet = async (projetId: number) => {
    if (!signer) return
    const note = notesVote[projetId]
    if (!note || Number(note) < 1 || Number(note) > 5) return alert("Choisis une note entre 1 et 5 !")
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.voterPourPhaseDeux({ signer: signer, args: { id: BigInt(projetId), note: BigInt(note) }, attoAlphAmount: ONE_ALPH / 10n })
      alert(`⭐ Ton vote a été enregistré !`)
    } catch (e) { alert("Erreur : Tu as déjà voté ou tu n'as pas investi.") }
  }

  const demanderRemboursement = async (projetId: number) => {
    if (!signer) return
    const node = new NodeProvider('https://wallet-v20.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.rembourser({ signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n })
      alert(`🛡️ REMBOURSÉ !`)
    } catch (e) { alert("Erreur : Conditions de remboursement non remplies.") }
  }

  // === FILTRAGE ET ONGLETS ===
  const tousLesTagsDisponibles = Array.from(new Set(projets.flatMap(p => p.hashtags ? p.hashtags.split(' ') : []))).filter(tag => tag.startsWith('#'))
  const projetsFiltresParTags = filtreActif ? projets.filter(p => p.hashtags && p.hashtags.includes(filtreActif)) : projets;

  const projetsAffiches = projetsFiltresParTags.filter(projet => {
    const estFini = Math.max(0, Math.floor((projet.deadline - tempsActuel) / 1000)) === 0;
    const objectifAtteint = projet.recolte >= projet.objectif;

    if (ongletActif === 'en_cours') {
      return !projet.estAnnule && !estFini && !objectifAtteint && projet.phaseRetrait === 0;
    } else if (ongletActif === 'termines') {
      return !projet.estAnnule && (objectifAtteint || projet.phaseRetrait > 0);
    } else if (ongletActif === 'annules') {
      return projet.estAnnule || (estFini && !objectifAtteint);
    }
    return false;
  });

  // ==========================================
  // 🎨 AFFICHAGE
  // ==========================================
  return (
    <div style={{ padding: '20px', minHeight: '100vh', transition: 'all 0.3s ease', fontFamily: 'sans-serif' }}>
      
      {/* HEADER & BOUTON THEME */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          style={{ padding: '8px 16px', background: isDarkMode ? '#f59e0b' : '#374151', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
        </button>
      </div>

      <div style={{ padding: '15px', background: theme.headerBg, color: theme.headerText, borderRadius: '8px', marginBottom: '20px', border: `1px solid ${theme.headerBorder}` }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🚀 Trustless Launchpad</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '16px' }}>
          <li>Univers du Contrat : <strong>Groupe {contractGroup}</strong></li>
          <li>Univers de ton Wallet : <strong>Groupe {account ? account.group : 'Non connecté'}</strong></li>
        </ul>
      </div>

      {/* FORMULAIRE CRÉATION */}
      <div style={{ marginTop: '20px', padding: '20px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Lancer un nouveau projet</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nom du projet" value={nouveauTitre} onChange={(e) => setNouveauTitre(e.target.value)} style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
            <input type="number" placeholder="Objectif (ALPH)" value={nouvelObjectif} onChange={(e) => setNouvelObjectif(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
            <input type="number" placeholder="Durée (Minutes)" value={nouvelleDuree} onChange={(e) => setNouvelleDuree(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          </div>
          <input type="text" placeholder="Description courte du projet" value={nouvelleDescription} onChange={(e) => setNouvelleDescription(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          <input type="text" placeholder="Liens utiles (ex: github.com/projet)" value={nouveauxLiens} onChange={(e) => setNouveauxLiens(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          <input type="text" placeholder="Hashtags (ex: #web3 #gaming)" value={nouveauxTags} onChange={(e) => setNouveauxTags(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          <button onClick={publierProjet} style={{ padding: '12px 24px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-start' }}>Créer le projet</button>
        </div>
      </div>

      {/* LISTE DES PROJETS */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Projets de la communauté</h3>
          <button onClick={chargerProjets} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🔄 Rafraîchir</button>
        </div>

        {/* 🗂️ ONGLETS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setOngletActif('en_cours')} style={{ padding: '10px 20px', background: ongletActif === 'en_cours' ? '#0070f3' : 'transparent', color: ongletActif === 'en_cours' ? 'white' : theme.textMuted, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🟢 En cours</button>
          <button onClick={() => setOngletActif('termines')} style={{ padding: '10px 20px', background: ongletActif === 'termines' ? '#10b981' : 'transparent', color: ongletActif === 'termines' ? 'white' : theme.textMuted, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🏆 Objectif atteint & Votes</button>
          <button onClick={() => setOngletActif('annules')} style={{ padding: '10px 20px', background: ongletActif === 'annules' ? '#ef4444' : 'transparent', color: ongletActif === 'annules' ? 'white' : theme.textMuted, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🚩 Annulés / Échoués</button>
        </div>

        {/* BARRE FILTRES TAGS */}
        {tousLesTagsDisponibles.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontWeight: 'bold', marginRight: '15px' }}>Trier par thème :</span>
            <button onClick={() => setFiltreActif('')} style={{ padding: '6px 12px', margin: '0 5px', borderRadius: '20px', border: filtreActif === '' ? 'none' : `1px solid ${theme.border}`, background: filtreActif === '' ? '#0070f3' : theme.inputBg, color: filtreActif === '' ? 'white' : theme.text, cursor: 'pointer' }}>Tous</button>
            {tousLesTagsDisponibles.map(tag => (
              <button key={tag} onClick={() => setFiltreActif(tag)} style={{ padding: '6px 12px', margin: '0 5px', borderRadius: '20px', border: filtreActif === tag ? 'none' : `1px solid ${theme.border}`, background: filtreActif === tag ? '#10b981' : theme.inputBg, color: filtreActif === tag ? 'white' : theme.text, cursor: 'pointer' }}>{tag}</button>
            ))}
          </div>
        )}

        {/* AFFICHAGE DES CARTES */}
        {chargement ? <p style={{ color: '#0070f3', fontWeight: 'bold' }}>⏳ Chargement blockchain...</p> : (
          projetsAffiches.map((projet) => {
            const tempsRestant = Math.max(0, Math.floor((projet.deadline - tempsActuel) / 1000))
            const estFini = tempsRestant === 0
            const objectifAtteint = projet.recolte >= projet.objectif
            
            let borderColor = '#10b981' 
            if (projet.estAnnule) borderColor = '#ef4444' 
            else if (projet.phaseRetrait === 2) borderColor = '#3b82f6' 

            return (
              <div key={projet.id} style={{ background: theme.cardBg, padding: '20px', marginBottom: '15px', marginTop: '15px', borderRadius: '8px', borderLeft: `6px solid ${borderColor}`, borderTop: `1px solid ${theme.border}`, borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {projet.titre}
                    {projet.phaseRetrait === 1 && <span style={{ marginLeft: '10px', fontSize: '12px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '12px' }}>🏆 Phase 1 débloquée (50%)</span>}
                    {projet.phaseRetrait === 2 && <span style={{ marginLeft: '10px', fontSize: '12px', background: '#dbeafe', color: '#2563eb', padding: '4px 8px', borderRadius: '12px' }}>✅ Financement 100% Terminé</span>}
                  </div>
                  
                  {projet.estAnnule ? (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🚩 PROJET ANNULÉ</span>
                  ) : projet.phaseRetrait === 2 ? (
                     <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔒 CAISSE FERMÉE</span>
                  ) : objectifAtteint ? (
                     <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ FINANCÉ AVEC SUCCÈS</span>
                  ) : (
                    <span style={{ color: estFini ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                      {estFini ? '⏳ Temps écoulé' : `⏱️ Reste : ${tempsRestant} s`}
                    </span>
                  )}
                </div>

                {projet.hashtags && (
                  <div style={{ marginTop: '10px' }}>
                    {projet.hashtags.split(' ').map((tag: string) => tag.startsWith('#') && (
                      <span key={tag} style={{ background: isDarkMode ? '#3730a3' : '#e0e7ff', color: isDarkMode ? '#e0e7ff' : '#4f46e5', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '5px', fontWeight: 'bold', display: 'inline-block', marginBottom: '5px' }}>{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ fontSize: '14px', color: theme.textMuted, margin: '15px 0', padding: '10px', background: theme.infoBoxBg, borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 5px 0' }}>📝 <strong>À propos :</strong> {projet.description || 'Aucune description'}</p>
                  <p style={{ margin: 0 }}>🔗 <strong>Liens :</strong> <span style={{ color: '#3b82f6', wordBreak: 'break-all' }}>{projet.liens || 'Aucun lien fourni'}</span></p>
                </div>

                <div style={{ margin: '15px 0' }}>
                  <strong>{projet.recolte} ALPH</strong> / {projet.objectif} ALPH
                  <div style={{ width: '100%', background: isDarkMode ? '#374151' : '#e9ecef', height: '8px', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min((projet.recolte / projet.objectif) * 100, 100)}%`, background: objectifAtteint ? '#10b981' : '#3b82f6', height: '100%' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                  
                  {!projet.estAnnule && !estFini && projet.phaseRetrait === 0 && !objectifAtteint && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input type="number" placeholder="Ex: 2.5" value={montantsDon[projet.id] || ''} onChange={(e) => setMontantsDon({...montantsDon, [projet.id]: e.target.value})} style={{ padding: '8px', width: '100px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
                      <button onClick={() => financerProjet(projet.id)} style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Donner (ALPH)</button>
                    </div>
                  )}

                  {!projet.estAnnule && projet.phaseRetrait === 1 && (
                     <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: isDarkMode ? '#78350f' : '#fef3c7', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#92400e' : '#fde68a'}` }}>
                        <strong style={{ color: isDarkMode ? '#fde68a' : '#d97706', fontSize: '14px' }}>🗳️ Évaluer le produit (1-5) :</strong>
                        <input type="number" min="1" max="5" placeholder="/ 5" value={notesVote[projet.id] || ''} onChange={(e) => setNotesVote({...notesVote, [projet.id]: e.target.value})} style={{ padding: '6px', width: '60px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
                        <button onClick={() => voterProjet(projet.id)} style={{ background: '#d97706', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Voter</button>
                     </div>
                  )}

                  {!projet.estAnnule && objectifAtteint && projet.phaseRetrait < 2 && (
                      <button onClick={() => retirerFonds(projet.id)} style={{ background: '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {projet.phaseRetrait === 0 ? '🏆 Créateur : Retirer 50% (Phase 1)' : '🏆 Créateur : Retirer Reste (Phase 2)'}
                      </button>
                  )}

                  {!projet.estAnnule && projet.phaseRetrait < 2 && (
                    <button onClick={() => annulerMonProjet(projet.id)} style={{ background: 'transparent', color: '#ef4444', padding: '8px 16px', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🚩 Créateur: Annuler le projet</button>
                  )}

                  {(projet.estAnnule || (estFini && !objectifAtteint)) && (
                    <button onClick={() => demanderRemboursement(projet.id)} style={{ background: '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🛡️ Investisseur: Demander Remboursement</button>
                  )}

                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
