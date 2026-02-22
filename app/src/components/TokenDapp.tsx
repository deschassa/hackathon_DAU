'use client'

import React, { useState, useEffect } from 'react'
import { useWallet, AlephiumConnectButton } from '@alephium/web3-react'
import { stringToHex, hexToString, web3, NodeProvider, groupOfAddress, ONE_ALPH } from '@alephium/web3'
import { ForumSondage } from '../../../artifacts/ts' 
import { toast, Toaster } from 'react-hot-toast' 

export const TokenDapp = () => {
  const CONTRACT_ADDRESS = "wGoaqeHvCUfN3tADuyHEQmfSVEejemGABRgggGAcqD4K" 
  const contractGroup = groupOfAddress(CONTRACT_ADDRESS)
  const { signer, account } = useWallet() 
  
  // États Formulaire de Création
  const [nouveauTitre, setNouveauTitre] = useState('')
  const [nouvelleDescription, setNouvelleDescription] = useState('')
  const [nouveauxLiens, setNouveauxLiens] = useState('')             
  const [nouveauLienPrive, setNouveauLienPrive] = useState('') 
  const [nouvelObjectif, setNouvelObjectif] = useState('')
  const [nouvelleDuree, setNouvelleDuree] = useState('5')            
  const [nouveauxTags, setNouveauxTags] = useState('')

  // États Formulaire Profil Créateur
  const [monNomDev, setMonNomDev] = useState('')
  const [monComDev, setMonComDev] = useState('')
  const [monEmailDev, setMonEmailDev] = useState('')
  
  // États Actions
  const [montantsDon, setMontantsDon] = useState<{ [key: number]: string }>({})
  const [notesVote, setNotesVote] = useState<{ [key: number]: string }>({}) 
  const [txEnCours, setTxEnCours] = useState(false) 
  
  // États d'affichage & Tris
  const [projets, setProjets] = useState<any[]>([])
  const [chargement, setChargement] = useState(false)
  const [tempsActuel, setTempsActuel] = useState(Date.now())
  const [filtreActif, setFiltreActif] = useState('')   
  const [ongletActif, setOngletActif] = useState('en_cours') 
  const [triActif, setTriActif] = useState('recent') 
  
  // Profil investisseur (Gamification)
  const [monProfil, setMonProfil] = useState({ nbVotes: 0, moyenne: 0, icone: '👤', titre: 'Nouvel Investisseur' })

  // MODE SOMBRE & THEME
  const [isDarkMode, setIsDarkMode] = useState(false)

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
    profilBg: isDarkMode ? '#4c1d95' : '#ede9fe', 
    profilText: isDarkMode ? '#ddd6fe' : '#5b21b6',
    devBg: isDarkMode ? '#1e293b' : '#f1f5f9',
  }

  useEffect(() => {
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;
    document.body.style.margin = '0'; 
  }, [isDarkMode, theme.bg, theme.text]);

  useEffect(() => {
    const timer = setInterval(() => setTempsActuel(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const chargerProfil = async () => {
    if (!account) return;
    try {
      // 🚨 CORRECTION ICI : Une seule déclaration de node bien propre
      const node = new NodeProvider('https://node.testnet.alephium.org')
      web3.setCurrentNodeProvider(node)
      
      const nbRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getProfilNbVotes({ args: { investisseur: account.address } })
      const sommeRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getProfilSommeNotes({ args: { investisseur: account.address } })
      
      const nbVotes = Number(nbRes.returns)
      const sommeNotes = Number(sommeRes.returns)
      
      if (nbVotes > 0) {
        const moyenne = sommeNotes / nbVotes
        let icone = '⚖️'
        let titre = 'Investisseur Neutre'
        if (moyenne >= 4.5) { icone = '👼'; titre = 'Ange Gardien' }
        else if (moyenne < 3) { icone = '😈'; titre = 'Critique Sévère' }
        setMonProfil({ nbVotes, moyenne: Number(moyenne.toFixed(1)), icone, titre })
      }
    } catch (e) { 
        console.log("Profil investisseur non trouvé ou erreur de lecture:", e) 
    }
  }

  const chargerProjets = async () => {
    setChargement(true)
    // On utilise le nœud principal plus stable pour la démo
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    
    try {
      const totalResult = await ForumSondage.at(CONTRACT_ADDRESS).view.getTotalProjets()
      const total = Number(totalResult.returns)
      let projetsCharges = []
      
      for(let i = 0; i < total; i++) {
        try {
          const id = BigInt(i)
          
          // 1. Appel des données de base du projet
          const titreRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getTitre({ args: { id } })
          const objRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getObjectif({ args: { id } })
          const fondRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getFondsRecoltes({ args: { id } })
          const deadRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDeadline({ args: { id } })
          const tagsRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getHashtags({ args: { id } })
          const descRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDescription({ args: { id } })
          const liensRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getLiens({ args: { id } })
          const annuleRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getEstAnnule({ args: { id } })
          const phaseRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getPhaseRetrait({ args: { id } })
          const lienPriveRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getLienPrive({ args: { id } })
          const createurRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getCreateur({ args: { id } })

          // 🛡️ CORRECTION MAJEURE : Nettoyage de l'adresse Alephium
          // On transforme "adresse:0" en "adresse" pure pour que le SDK l'accepte
          const devAddressClean = String(createurRes.returns).split(':')[0]

          // 2. Appel des données du profil avec l'adresse nettoyée
          const devNomRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDevNom({ args: { dev: devAddressClean } })
          const devComRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDevCommentaire({ args: { dev: devAddressClean } })
          const devEmailRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDevEmail({ args: { dev: devAddressClean } })
          const devRepRes = await ForumSondage.at(CONTRACT_ADDRESS).view.getDevReputation({ args: { dev: devAddressClean } })
          
          const devNotesTotales = Number(devRepRes.returns[0])
          const devQuorumTotal = Number(devRepRes.returns[1])
          const devMoyenne = devQuorumTotal > 0 ? (devNotesTotales / devQuorumTotal).toFixed(1) : "N/A"

          projetsCharges.push({
            id: i,
            titre: hexToString(titreRes.returns),
            description: hexToString(descRes.returns),
            liens: hexToString(liensRes.returns),
            lienPrive: hexToString(lienPriveRes.returns),
            objectif: Number(objRes.returns) / 1e18,
            recolte: Number(fondRes.returns) / 1e18,
            deadline: Number(deadRes.returns),         
            hashtags: hexToString(tagsRes.returns), 
            estAnnule: annuleRes.returns,          
            phaseRetrait: Number(phaseRes.returns),
            devNom: hexToString(devNomRes.returns),
            devCommentaire: hexToString(devComRes.returns),
            devEmail: hexToString(devEmailRes.returns),
            devMoyenne: devMoyenne
          })
        } catch (errProjet) {
          // Si un projet a un souci, on l'affiche en console mais on ne bloque pas le reste de la liste
          console.error(`⚠️ Erreur de lecture sur le projet ${i}:`, errProjet)
        }
      }
      setProjets(projetsCharges)
    } catch (error) { 
      console.error("🚨 Erreur critique de connexion blockchain :", error)
      toast.error("Impossible de joindre la blockchain Alephium.") 
    }
    setChargement(false)
  }

  useEffect(() => { chargerProjets(); chargerProfil(); }, [account])

  // === FONCTIONS D'ÉCRITURE ===
  const enregistrerProfilDev = async () => {
    if (!signer) return toast.error("⚠️ Connecte ton wallet !")
    if (!monNomDev) return toast.error("Le nom est obligatoire.")
    setTxEnCours(true)
    const toastId = toast.loading('Mise à jour du profil...')
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.mettreAJourProfilDev({
        signer,
        args: { nom: stringToHex(monNomDev), commentaire: stringToHex(monComDev), email: stringToHex(monEmailDev) },
        attoAlphAmount: ONE_ALPH / 10n
      })
      toast.success(`Profil public mis à jour !`, { id: toastId })
      setTimeout(chargerProjets, 4000)
    } catch (e) { toast.error("Échec de la mise à jour.", { id: toastId }) }
    finally { setTxEnCours(false) }
  }

  const publierProjet = async () => {
      if (!signer || !account) return toast.error("⚠️ Connecte ton wallet !")
      if (!nouveauTitre || !nouvelObjectif) return toast.error("⚠️ Remplis au moins le titre et l'objectif !")
      
      setTxEnCours(true)
      const toastId = toast.loading('Création du projet en cours...')
      const node = new NodeProvider('https://node.testnet.alephium.org')
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
            lienPrive: stringToHex(nouveauLienPrive),
            tags: stringToHex(nouveauxTags.toLowerCase()), 
            objectif: objectifEnAttoAlph, 
            dureeEnMs: dureeEnMs 
          },
          attoAlphAmount: ONE_ALPH / 10n 
        })
        toast.success(`🎉 PROJET CRÉÉ !`, { id: toastId })
        setNouveauTitre(''); setNouvelleDescription(''); setNouveauxLiens(''); setNouveauLienPrive(''); setNouvelObjectif(''); setNouvelleDuree('5'); setNouveauxTags('');
        setTimeout(chargerProjets, 4000)
      } catch (error) { toast.error("❌ Échec de la création.", { id: toastId }) } 
      finally { setTxEnCours(false) }
  }

  const financerProjet = async (projetId: number) => {
    if (!signer) return toast.error("⚠️ Connecte ton wallet !")
    const montantSaisi = montantsDon[projetId]
    if (!montantSaisi || Number(montantSaisi) <= 0) return toast.error("Saisis un montant valide en ALPH !")
    
    setTxEnCours(true)
    const toastId = toast.loading('Envoi des fonds en cours...')
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    
    try {
      const montantEnAttoAlph = BigInt(Math.floor(Number(montantSaisi) * 1e18))
      await ForumSondage.at(CONTRACT_ADDRESS).transact.financerProjet({ signer: signer, args: { id: BigInt(projetId), montant: montantEnAttoAlph }, attoAlphAmount: montantEnAttoAlph + (ONE_ALPH / 10n) })
      toast.success(`💸 Don envoyé ! Accès privé débloqué.`, { id: toastId })
      setTimeout(chargerProjets, 4000)
    } catch (e) { toast.error("Erreur : Projet expiré ou annulé.", { id: toastId }) } 
    finally { setTxEnCours(false) }
  }

  const retirerFonds = async (projetId: number) => {
    if (!signer) return
    setTxEnCours(true)
    const toastId = toast.loading('Retrait en cours...')
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.retirerFonds({ signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n })
      toast.success(`🏆 SUCCÈS ! Fonds virés !`, { id: toastId })
      setTimeout(chargerProjets, 4000)
    } catch (e) { toast.error("Erreur de retrait.", { id: toastId }) } 
    finally { setTxEnCours(false) }
  }

  const annulerMonProjet = async (projetId: number) => {
    if (!signer) return
    setTxEnCours(true)
    const toastId = toast.loading('Annulation...')
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.annulerProjet({ signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n })
      toast.success(`🚩 Projet annulé !`, { id: toastId })
      setTimeout(chargerProjets, 4000)
    } catch (e) { toast.error("Erreur d'annulation.", { id: toastId }) } 
    finally { setTxEnCours(false) }
  }

  const voterProjet = async (projetId: number) => {
    if (!signer) return
    const note = notesVote[projetId]
    if (!note || Number(note) < 1 || Number(note) > 5) return toast.error("Choisis une note entre 1 et 5 !")
    setTxEnCours(true)
    const toastId = toast.loading('Enregistrement du vote...')
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.voterPourPhaseDeux({ signer: signer, args: { id: BigInt(projetId), note: BigInt(note) }, attoAlphAmount: ONE_ALPH / 10n })
      toast.success(`⭐ Vote enregistré !`, { id: toastId })
      setTimeout(() => { chargerProjets(); chargerProfil(); }, 4000) 
    } catch (e) { toast.error("Erreur lors du vote.", { id: toastId }) } 
    finally { setTxEnCours(false) }
  }

  const demanderRemboursement = async (projetId: number) => {
    if (!signer) return
    setTxEnCours(true)
    const toastId = toast.loading('Demande de remboursement...')
    const node = new NodeProvider('https://node.testnet.alephium.org')
    web3.setCurrentNodeProvider(node)
    try {
      await ForumSondage.at(CONTRACT_ADDRESS).transact.rembourser({ signer: signer, args: { id: BigInt(projetId) }, attoAlphAmount: ONE_ALPH / 10n })
      toast.success(`🛡️ REMBOURSÉ !`, { id: toastId })
      setTimeout(chargerProjets, 4000)
    } catch (e) { toast.error("Erreur de remboursement.", { id: toastId }) } 
    finally { setTxEnCours(false) }
  }

  // === FILTRAGE ===
  const tousLesTagsDisponibles = Array.from(new Set(projets.flatMap(p => p.hashtags ? p.hashtags.split(' ') : []))).filter(tag => tag.startsWith('#'))
  const projetsFiltresParTags = filtreActif ? projets.filter(p => p.hashtags && p.hashtags.includes(filtreActif)) : projets;

  let projetsAffiches = projetsFiltresParTags.filter(projet => {
    const estFini = Math.max(0, Math.floor((projet.deadline - tempsActuel) / 1000)) === 0;
    const objectifAtteint = projet.recolte >= projet.objectif;

    if (ongletActif === 'en_cours') return !projet.estAnnule && !estFini && !objectifAtteint && projet.phaseRetrait === 0;
    else if (ongletActif === 'termines') return !projet.estAnnule && (objectifAtteint || projet.phaseRetrait > 0);
    else if (ongletActif === 'annules') return projet.estAnnule || (estFini && !objectifAtteint);
    return false;
  });

  projetsAffiches = projetsAffiches.sort((a, b) => {
    if (triActif === 'fin_proche') return a.deadline - b.deadline; 
    else if (triActif === 'plus_finances') return (b.recolte / (b.objectif || 1)) - (a.recolte / (a.objectif || 1));
    return b.id - a.id;
  });

  return (
    <div style={{ padding: '20px', minHeight: '100vh', transition: 'all 0.3s ease', fontFamily: 'sans-serif' }}>
      <Toaster position="bottom-right" reverseOrder={false} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          style={{ padding: '8px 16px', background: isDarkMode ? '#f59e0b' : '#374151', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isDarkMode ? '☀️ Mode Clair' : '🌙 Mode Sombre'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        
        <div style={{ flex: 1, minWidth: '300px', padding: '15px', background: theme.headerBg, color: theme.headerText, borderRadius: '8px', border: `1px solid ${theme.headerBorder}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
             <h3 style={{ margin: 0 }}>🚀 Trustless Launchpad</h3>
             <AlephiumConnectButton />
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Univers du Contrat : <strong>Groupe {contractGroup}</strong></li>
            <li>Ton Wallet : <strong>{account ? `Groupe ${account.group}` : 'Non connecté'}</strong></li>
          </ul>
        </div>

        {account && (
          <div style={{ flex: 1, minWidth: '300px', padding: '15px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
             <h4 style={{ margin: '0 0 10px 0' }}>⚙️ Mon Profil Créateur</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <input type="text" placeholder="Nom public (ex: Alice)" value={monNomDev} onChange={(e) => setMonNomDev(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
               <input type="text" placeholder="Bio / Commentaire" value={monComDev} onChange={(e) => setMonComDev(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
               <input type="text" placeholder="Contact (Optionnel)" value={monEmailDev} onChange={(e) => setMonEmailDev(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
               <button disabled={txEnCours} onClick={enregistrerProfilDev} style={{ background: '#6366f1', color: 'white', padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Mettre à jour mon profil</button>
             </div>
          </div>
        )}

        {account && (
          <div style={{ flex: 1, minWidth: '200px', padding: '15px', background: theme.profilBg, color: theme.profilText, borderRadius: '8px', border: `1px solid ${theme.profilText}`, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '30px', marginBottom: '5px' }}>{monProfil.icone}</div>
            <strong style={{ fontSize: '18px' }}>{monProfil.titre}</strong>
            <div style={{ marginTop: '8px', fontSize: '14px', opacity: 0.9 }}>
              {monProfil.nbVotes > 0 ? (
                <>Moyenne : <strong>{monProfil.moyenne} / 5</strong> ({monProfil.nbVotes} votes)</>
              ) : (
                <>Tu n'as pas encore voté.</>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}`, marginBottom: '30px', opacity: txEnCours ? 0.6 : 1, pointerEvents: txEnCours ? 'none' : 'auto' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Lancer un nouveau projet</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Nom du projet" value={nouveauTitre} onChange={(e) => setNouveauTitre(e.target.value)} style={{ flex: 2, minWidth: '200px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
            <input type="number" placeholder="Objectif (ALPH)" value={nouvelObjectif} onChange={(e) => setNouvelObjectif(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
            <input type="number" placeholder="Durée (Minutes)" value={nouvelleDuree} onChange={(e) => setNouvelleDuree(e.target.value)} style={{ flex: 1, minWidth: '120px', padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          </div>
          <input type="text" placeholder="Description courte du projet" value={nouvelleDescription} onChange={(e) => setNouvelleDescription(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Liens utiles (ex: github.com/projet)" value={nouveauxLiens} onChange={(e) => setNouveauxLiens(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
            <input type="text" placeholder="🔒 Lien privé (ex: Discord pour investisseurs)" value={nouveauLienPrive} onChange={(e) => setNouveauLienPrive(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '4px', border: `1px dashed #6366f1`, background: theme.inputBg, color: theme.inputText }} />
          </div>

          <input type="text" placeholder="Hashtags (ex: #web3 #gaming)" value={nouveauxTags} onChange={(e) => setNouveauxTags(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
          <button disabled={txEnCours} onClick={publierProjet} style={{ padding: '12px 24px', background: txEnCours ? '#9ca3af' : '#0070f3', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: txEnCours ? 'not-allowed' : 'pointer', alignSelf: 'flex-start' }}>
            {txEnCours ? '⏳ Transaction...' : 'Créer le projet'}
          </button>
        </div>
      </div>

      <div style={{ opacity: txEnCours ? 0.7 : 1, pointerEvents: txEnCours ? 'none' : 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Projets de la communauté</h3>
          <button onClick={chargerProjets} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🔄 Rafraîchir</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: `2px solid ${theme.border}`, paddingBottom: '10px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setOngletActif('en_cours')} style={{ padding: '10px 20px', background: ongletActif === 'en_cours' ? '#0070f3' : 'transparent', color: ongletActif === 'en_cours' ? 'white' : theme.textMuted, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🟢 En cours</button>
            <button onClick={() => setOngletActif('termines')} style={{ padding: '10px 20px', background: ongletActif === 'termines' ? '#10b981' : 'transparent', color: ongletActif === 'termines' ? 'white' : theme.textMuted, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🏆 Objectif atteint & Votes</button>
            <button onClick={() => setOngletActif('annules')} style={{ padding: '10px 20px', background: ongletActif === 'annules' ? '#ef4444' : 'transparent', color: ongletActif === 'annules' ? 'white' : theme.textMuted, border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>🚩 Annulés / Échoués</button>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text }}>Trier :</span>
            <select value={triActif} onChange={(e) => setTriActif(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText, cursor: 'pointer' }}>
              <option value="recent">✨ Plus récents</option>
              <option value="plus_finances">🔥 Plus financés (%)</option>
              <option value="fin_proche">⏳ Se termine bientôt</option>
            </select>
          </div>
        </div>

        {tousLesTagsDisponibles.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', background: theme.cardBg, borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontWeight: 'bold', marginRight: '15px' }}>Filtrer par thème :</span>
            <button onClick={() => setFiltreActif('')} style={{ padding: '6px 12px', margin: '0 5px', borderRadius: '20px', border: filtreActif === '' ? 'none' : `1px solid ${theme.border}`, background: filtreActif === '' ? '#0070f3' : theme.inputBg, color: filtreActif === '' ? 'white' : theme.text, cursor: 'pointer' }}>Tous</button>
            {tousLesTagsDisponibles.map(tag => (
              <button key={tag} onClick={() => setFiltreActif(tag)} style={{ padding: '6px 12px', margin: '0 5px', borderRadius: '20px', border: filtreActif === tag ? 'none' : `1px solid ${theme.border}`, background: filtreActif === tag ? '#10b981' : theme.inputBg, color: filtreActif === tag ? 'white' : theme.text, cursor: 'pointer' }}>{tag}</button>
            ))}
          </div>
        )}

        {!chargement && projetsAffiches.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: theme.cardBg, borderRadius: '8px', border: `1px dashed ${theme.border}`, color: theme.textMuted }}>
             <p style={{ fontSize: '40px', margin: '0 0 10px 0' }}>{ongletActif === 'en_cours' ? '🌱' : ongletActif === 'termines' ? '🏆' : '🍃'}</p>
             <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Aucun projet ici pour le moment.</p>
          </div>
        )}

        {chargement ? <p style={{ color: '#0070f3', fontWeight: 'bold', textAlign: 'center', padding: '20px' }}>⏳ Chargement de la blockchain...</p> : (
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
                    {projet.phaseRetrait === 1 && <span style={{ marginLeft: '10px', fontSize: '12px', background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '12px' }}>🏆 Phase 1 (50%)</span>}
                    {projet.phaseRetrait === 2 && <span style={{ marginLeft: '10px', fontSize: '12px', background: '#dbeafe', color: '#2563eb', padding: '4px 8px', borderRadius: '12px' }}>✅ Terminé</span>}
                  </div>
                  
                  {projet.estAnnule ? (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🚩 PROJET ANNULÉ</span>
                  ) : projet.phaseRetrait === 2 ? (
                     <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>🔒 CAISSE FERMÉE</span>
                  ) : objectifAtteint ? (
                     <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ FINANCÉ</span>
                  ) : (
                    <span style={{ color: estFini ? '#ef4444' : '#f59e0b', fontWeight: 'bold' }}>
                      {estFini ? '⏳ Temps écoulé' : `⏱️ Reste : ${tempsRestant} s`}
                    </span>
                  )}
                </div>

                <div style={{ marginTop: '15px', padding: '10px', background: theme.devBg, borderRadius: '6px', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <strong style={{ fontSize: '14px', color: '#6366f1' }}>👨‍💻 Créateur : {projet.devNom}</strong>
                     <span style={{ fontSize: '12px', fontWeight: 'bold', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '10px' }}>
                       ⭐ Note Globale : {projet.devMoyenne}/5
                     </span>
                  </div>
                  <p style={{ fontSize: '12px', margin: '5px 0', fontStyle: 'italic' }}>"{projet.devCommentaire}"</p>
                  {projet.devEmail && <p style={{ fontSize: '11px', color: theme.textMuted }}>📧 {projet.devEmail}</p>}
                </div>

                <div style={{ fontSize: '14px', color: theme.textMuted, margin: '15px 0', padding: '10px', background: theme.infoBoxBg, borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 5px 0' }}>📝 <strong>À propos :</strong> {projet.description || 'Aucune description'}</p>
                  <p style={{ margin: 0 }}>🔗 <strong>Liens :</strong> <span style={{ color: '#3b82f6', wordBreak: 'break-all' }}>{projet.liens || 'Aucun lien fourni'}</span></p>
                </div>

                {projet.lienPrive && projet.recolte > 0 && (
                  <div style={{ marginTop: '15px', padding: '12px', background: '#5865F2', color: 'white', borderRadius: '6px', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>🎉 Accès Privé Investisseurs</p>
                    <a href={projet.lienPrive.startsWith('http') ? projet.lienPrive : `https://${projet.lienPrive}`} target="_blank" rel="noreferrer" style={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>
                      Rejoindre la communauté de ce projet
                    </a>
                  </div>
                )}

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
                      <button disabled={txEnCours} onClick={() => financerProjet(projet.id)} style={{ background: txEnCours ? '#9ca3af' : '#3b82f6', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: txEnCours ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Donner (ALPH)</button>
                    </div>
                  )}

                  {!projet.estAnnule && projet.phaseRetrait === 1 && (
                     <div style={{ display: 'flex', gap: '5px', alignItems: 'center', background: isDarkMode ? '#78350f' : '#fef3c7', padding: '10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#92400e' : '#fde68a'}` }}>
                        <strong style={{ color: isDarkMode ? '#fde68a' : '#d97706', fontSize: '14px' }}>🗳️ Évaluer (1-5) :</strong>
                        <input type="number" min="1" max="5" placeholder="/ 5" value={notesVote[projet.id] || ''} onChange={(e) => setNotesVote({...notesVote, [projet.id]: e.target.value})} style={{ padding: '6px', width: '60px', borderRadius: '4px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.inputText }} />
                        <button disabled={txEnCours} onClick={() => voterProjet(projet.id)} style={{ background: txEnCours ? '#9ca3af' : '#d97706', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: txEnCours ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Voter</button>
                     </div>
                  )}

                  {!projet.estAnnule && objectifAtteint && projet.phaseRetrait < 2 && (
                      <button disabled={txEnCours} onClick={() => retirerFonds(projet.id)} style={{ background: txEnCours ? '#9ca3af' : '#10b981', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: txEnCours ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {projet.phaseRetrait === 0 ? '🏆 Retirer 50% (Phase 1)' : '🏆 Retirer Reste (Phase 2)'}
                      </button>
                  )}

                  {!projet.estAnnule && projet.phaseRetrait < 2 && (
                    <button disabled={txEnCours} onClick={() => annulerMonProjet(projet.id)} style={{ background: 'transparent', color: txEnCours ? '#9ca3af' : '#ef4444', padding: '8px 16px', border: `1px solid ${txEnCours ? '#9ca3af' : '#ef4444'}`, borderRadius: '4px', cursor: txEnCours ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🚩 Annuler le projet</button>
                  )}

                  {(projet.estAnnule || (estFini && !objectifAtteint) || (projet.phaseRetrait === 1)) && (
                    <button disabled={txEnCours} onClick={() => demanderRemboursement(projet.id)} style={{ background: txEnCours ? '#9ca3af' : '#ef4444', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: txEnCours ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>🛡️ Remboursement</button>
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

