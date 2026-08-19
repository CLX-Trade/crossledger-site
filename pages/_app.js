import '../styles/globals.css'
import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider, http, fallback } from 'wagmi'
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
// and kept Approve/Buy disabled.
//
// A single public endpoint is not enough either: free RPCs rate-limit, and when one
// starts refusing calls every read on the page fails silently. viem's fallback()
// tries each endpoint in order and moves on when one errors, so a throttled provider
// degrades instead of breaking the buy flow.
//
// Set NEXT_PUBLIC_RPC_URL in Vercel to put a dedicated provider first in the chain.
const rpcEndpoints = [
  process.env.NEXT_PUBLIC_RPC_URL,
  'https://eth.drpc.org',
  'https://ethereum-rpc.publicnode.com',
  'https://rpc.mevblocker.io',
  'https://eth.merkle.io'
].filter(Boolean)

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  transports: {
    [mainnet.id]: fallback(rpcEndpoints.map((url) => http(url, { timeout: 10_000 })))
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
