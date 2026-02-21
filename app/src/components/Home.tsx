import React from 'react'
import { AlephiumConnectButton } from '@alephium/web3-react'
import { TokenDapp } from './TokenDapp'

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* L'en-tête avec le bouton magique du Wallet */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #ccc', paddingBottom: '20px' }}>
        <h1>Hackathon Web3 🚀</h1>
        <AlephiumConnectButton />
      </header>

      {/* Le corps de la page qui affiche tes boutons de vote */}
      <main>
        <TokenDapp />
      </main>

    </div>
  )
}