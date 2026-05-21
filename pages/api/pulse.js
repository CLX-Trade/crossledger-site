/**
 * pages/api/pulse.js - CrossLedger Living Organism - Live Data Pulse
 * Feeds the frontend with real-time market data, presale context, and dynamic SEO.
 * Called every 60s by the homepage.
 */

const CACHE_TTL = 55;
let cache = null;
let cacheTime = 0;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=55, stale-while-revalidate');

  if (cache && Date.now() - cacheTime < CACHE_TTL * 1000) {
    return res.status(200).json(cache);
  }

  try {
    const [marketData, gasData] = await Promise.allSettled([
      fetchMarketData(),
      fetchGasPrice(),
    ]);

    const market = marketData.status === 'fulfilled' ? marketData.value : null;
    const gas = gasData.status === 'fulfilled' ? gasData.value : null;

    const pulse = {
      timestamp: new Date().toISOString(),
      presale: {
        stage: 1,
        totalStages: 4,
        price: 0.10,
        currency: 'USDT',
        symbol: 'CLXT',
        stageCap: 5000000,
        urgency: getUrgencyMessage(),
      },
      market: market ? {
        eth: {
          price: market.ethereum?.usd ?? null,
          change24h: market.ethereum?.usd_24h_change ?? null,
        },
        btc: {
          price: market.bitcoin?.usd ?? null,
          change24h: market.bitcoin?.usd_24h_change ?? null,
        },
        sentiment: deriveSentiment(market),
      } : null,
      gas,
      seo: {
        metaDescription: buildMetaDescription(market),
        ogTitle: buildOgTitle(market),
      },
      health: 'alive',
    };

    cache = pulse;
    cacheTime = Date.now();
    return res.status(200).json(pulse);
  } catch (err) {
    console.error('[pulse] error:', err);
    return res.status(200).json({
      timestamp: new Date().toISOString(),
      presale: { stage: 1, totalStages: 4, price: 0.10, symbol: 'CLXT', urgency: getUrgencyMessage() },
      market: null,
      gas: null,
      health: 'degraded',
    });
  }
}

async function fetchMarketData() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd&include_24hr_change=true',
    { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) throw new Error('CoinGecko ' + res.status);
  return res.json();
}

async function fetchGasPrice() {
  try {
    const res = await fetch(
      'https://api.etherscan.io/api?module=gastracker&action=gasoracle',
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json();
    if (data.status === '1') {
      return { safe: data.result.SafeGasPrice, standard: data.result.ProposeGasPrice, fast: data.result.FastGasPrice };
    }
  } catch {}
  return null;
}

function deriveSentiment(market) {
  const change = market?.ethereum?.usd_24h_change ?? 0;
  if (change > 3) return 'bullish';
  if (change < -3) return 'bearish';
  return 'neutral';
}

function getUrgencyMessage() {
  const msgs = [
    'Stage 1 allocation filling. Price doubles at Stage 2.',
    'Early-stage entry closes when 5M CLXT is reached.',
    'Stage 1 live at US$0.10 - the lowest presale price available.',
    '5,000,000 CLXT in Stage 1. Once filled, Stage 2 opens at $0.20.',
    'No claim portal - tokens land in your wallet on confirmation.',
  ];
  return msgs[new Date().getUTCHours() % msgs.length];
}

function buildMetaDescription(market) {
  const ethPrice = market?.ethereum?.usd;
  const ethChange = market?.ethereum?.usd_24h_change;
  const ethStr = ethPrice ? ' ETH at US$' + ethPrice.toLocaleString() + '.' : '';
  const changeStr = ethChange != null
    ? ' ETH is ' + (ethChange > 0 ? 'up' : 'down') + ' ' + Math.abs(ethChange).toFixed(1) + '% today.'
    : '';
  return 'CrossLedger (CLXT) presale Stage 1 live at US$0.10 on Ethereum mainnet. Blockchain settlement for cross-border commodity trade by GDN Group.' + ethStr + changeStr;
}

function buildOgTitle(market) {
  const s = deriveSentiment(market);
  if (s === 'bullish') return 'CrossLedger (CLXT) - Presale Live - Bullish Market Conditions';
  if (s === 'bearish') return 'CrossLedger (CLXT) - Presale Live - Stage 1 at US$0.10';
  return 'CrossLedger (CLXT) - Trade Infrastructure | Presale Live';
}