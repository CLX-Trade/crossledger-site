import '../styles/globals.css'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mainnet } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

const projectId = '5c3e263fbd158f50dd934e0912398db6'

const metadata = {
  name: 'CrossLedger',
  description: 'CrossLedger Presale',
  url: 'https://www.crossledger.trade',
  icons: ['https://www.crossledger.trade/apple-touch-icon.png']
}

const networks = [mainnet]
const queryClient = new QueryClient()

// Contract reads (USDT balance, allowance, presale price) must not depend on the
// visitor's own wallet RPC. MetaMask's default endpoint returns HTTP 403 on eth_call
// for some users, which left the presale widget showing "-" for balance and allowance
// and kept Approve/Buy disabled. An explicit transport makes reads work for everyone.
// Set NEXT_PUBLIC_RPC_URL in Vercel to use a dedicated provider; the public endpoint
// below is only a fallback.
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://ethereum-rpc.publicnode.com'

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports: {
    [mainnet.id]: http(RPC_URL)
  }
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
