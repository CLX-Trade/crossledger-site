import '../styles/globals.css'
import { WagmiConfig, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = "5c3e263fbd158f50dd934e0912398db6"

const wagmiAdapter = new WagmiAdapter({
  projectId,
  chains: [mainnet]
})

const config = createConfig({
  autoConnect: true,
  connectors: wagmiAdapter.connectors,
  publicClient: wagmiAdapter.publicClient
})

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet],
  metadata: {
    name: "CrossLedger",
    description: "CrossLedger Presale",
    url: "https://crossledger.trade",
    icons: []
  }
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={config}>
      <Component {...pageProps} />
    </WagmiConfig>
  )
}
