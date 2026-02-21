import { Configuration } from '@alephium/cli'
import { config } from 'dotenv'

config()

const configuration: Configuration = {
  networks: {
    // Le réseau local (celui que le compilateur cherche par défaut)
    devnet: {
      nodeUrl: 'http://127.0.0.1:22973',
      privateKeys: process.env.DEVNET_PRIVATE_KEY ? [process.env.DEVNET_PRIVATE_KEY] : [],
      settings: {},
    },
    // Le réseau de test public (celui qu'on utilisera pour de vrai)
    testnet: {
      nodeUrl: 'https://wallet-v20.testnet.alephium.org',
      privateKeys: process.env.ALPH_PRIVATE_KEY ? [process.env.ALPH_PRIVATE_KEY] : [],
      settings: {},
    },
    mainnet: {
      nodeUrl: 'http://127.0.0.1:22973',
      privateKeys: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY] : [],
      settings: {},
    },
  }
}

export default configuration
