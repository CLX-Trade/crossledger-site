import '../styles/globals.css'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = '5c3e263fbd158f50dd934e0912398db6'

const metadata = {
  name: 'CrossLedger',
  description: 'CrossLedger Presale',
  url: 'https://www.crossledger.trade',
  icons: []
}

const networks = [mainnet]
const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata
})

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
