import React from 'react'
import { AlephiumWalletProvider } from '@alephium/web3-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* Le secret est ici : addressGroup={0} force la connexion au bon univers ! */}
        <AlephiumWalletProvider theme="system" network="testnet" addressGroup={0}>
          {children}
        </AlephiumWalletProvider>
      </body>
    </html>
  )
}