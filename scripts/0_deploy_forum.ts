import { Deployer, DeployFunction } from '@alephium/cli'
import { ForumSondage } from '../artifacts/ts'

const deployScript: DeployFunction = async (deployer: Deployer): Promise<void> => {
  console.log("🚀 Lancement final vers le Testnet...")

  const result = await deployer.deployContract(ForumSondage, {
    initialFields: {
      totalProjets: 0n 
    }
  })
  
  console.log('🎉 BINGO ! Contrat déployé avec succès !')
  console.log('📍 Adresse de ton contrat :', result.contractInstance.address)
}

export default deployScript
