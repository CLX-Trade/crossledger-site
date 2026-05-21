/**
 * lib/ai-agent.js - CrossLedger AI Improvement Brain
 * 
 * Analyzes the site and generates specific improvement suggestions.
 * Called by the GitHub Actions workflow (.github/workflows/ai-pulse.yml).
 * Creates a Pull Request with proposed changes for human review.
 */

import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SITE_CONTEXT = `
CrossLedger (CLXT) is a blockchain-anchored settlement platform for cross-border commodity trade.
Built by GDN Group (Brisbane, Dubai, Orlando, Sao Paulo).
Stage 1 presale is live on Ethereum mainnet at US$0.10 per CLXT.
Target audience: mid-market commodity exporters, institutional investors, crypto-native buyers.
Key value props: smart escrow, on-chain document verification, fast settlement, CLXT token utility.
Design system: navy/cream/gold color palette, professional financial tone.
Tech stack: Next.js 14, Tailwind CSS, wagmi/viem for Web3, Vercel deployment.
`;

const IMPROVEMENT_AREAS = [
  {
    id: 'urgency_messaging',
    name: 'Presale Urgency & CTA Copy',
    description: 'Hero headline, presale widget messaging, and call-to-action text',
    maxTokens: 800,
  },
  {
    id: 'seo_metadata',
    name: 'SEO Meta Description & OG Tags',
    description: 'Page title, meta description, and Open Graph tags for better search visibility',
    maxTokens: 400,
  },
  {
    id: 'faq_content',
    name: 'FAQ Section',
    description: 'New FAQ question and answer relevant to current market conditions',
    maxTokens: 600,
  },
  {
    id: 'market_narrative',
    name: 'Market Context Section',
    description: 'Stat block or narrative copy reflecting current macro environment',
    maxTokens: 500,
  },
];

/**
 * Main agent function - runs analysis and returns improvement suggestions
 * @param {Object} pulseData - Live data from /api/pulse endpoint
 * @returns {Array} Array of improvement objects {area, suggestion, rationale, diff}
 */
export async function runImprovementAgent(pulseData) {
  console.log('[ai-agent] Starting improvement run...');
  console.log('[ai-agent] Market sentiment:', pulseData?.market?.sentiment ?? 'unknown');
  
  const improvements = [];
  
  for (const area of IMPROVEMENT_AREAS) {
    try {
      console.log('[ai-agent] Analyzing:', area.name);
      const improvement = await analyzeArea(area, pulseData);
      if (improvement) {
        improvements.push(improvement);
      }
    } catch (err) {
      console.error('[ai-agent] Failed on area:', area.id, err.message);
    }
  }
  
  console.log('[ai-agent] Generated', improvements.length, 'improvements');
  return improvements;
}

async function analyzeArea(area, pulseData) {
  const marketContext = buildMarketContext(pulseData);
  
  const prompt = `You are an AI growth agent for CrossLedger, a blockchain trade-finance platform.

SITE CONTEXT:
${SITE_CONTEXT}

CURRENT MARKET CONDITIONS:
${marketContext}

YOUR TASK:
Generate an improvement for the following area: ${area.name}
Description: ${area.description}

REQUIREMENTS:
- Keep the professional, authoritative financial tone (similar to Bloomberg/Coinbase)
- Reference current market conditions where relevant and authentic
- Never make up statistics or price predictions
- Keep copy concise and conversion-focused
- Output ONLY a JSON object with these fields:
  {
    "suggestion": "The actual text/copy to use",
    "rationale": "1-2 sentences explaining why this improves the site",
    "urgency_level": "low|medium|high"
  }

Output only valid JSON, no markdown, no explanation outside the JSON.
`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: area.maxTokens,
    messages: [{ role: 'user', content: prompt }],
  });
  
  const responseText = message.content[0].text.trim();
  
  // Parse the JSON response
  let parsed;
  try {
    // Handle potential markdown code blocks
    const jsonStr = responseText.replace(/^[^{]*({.*})[^}]*$/s, '$1');
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error('[ai-agent] Failed to parse response for', area.id, ':', responseText.slice(0, 100));
    return null;
  }
  
  return {
    area: area.id,
    areaName: area.name,
    suggestion: parsed.suggestion,
    rationale: parsed.rationale,
    urgencyLevel: parsed.urgency_level || 'medium',
    generatedAt: new Date().toISOString(),
    marketSnapshot: {
      ethPrice: pulseData?.market?.eth?.price,
      sentiment: pulseData?.market?.sentiment,
    },
  };
}

function buildMarketContext(pulseData) {
  if (!pulseData?.market) {
    return 'Market data unavailable. Use general crypto/trade context.';
  }
  
  const eth = pulseData.market.eth;
  const btc = pulseData.market.btc;
  const sentiment = pulseData.market.sentiment;
  
  let ctx = `Market sentiment: ${sentiment}
`;
  
  if (eth?.price) {
    const dir = eth.change24h > 0 ? 'up' : 'down';
    ctx += `ETH: US$${eth.price.toLocaleString()} (${dir} ${Math.abs(eth.change24h || 0).toFixed(1)}% 24h)
`;
  }
  
  if (btc?.price) {
    const dir = btc.change24h > 0 ? 'up' : 'down';
    ctx += `BTC: US$${btc.price.toLocaleString()} (${dir} ${Math.abs(btc.change24h || 0).toFixed(1)}% 24h)
`;
  }
  
  ctx += `Presale: Stage 1 of 4 active at US$0.10 per CLXT
`;
  ctx += `Urgency: ${pulseData.presale?.urgency ?? 'Stage 1 live'}
`;
  
  return ctx;
}

/**
 * Format improvements as a readable PR description
 */
export function formatPRDescription(improvements, pulseData) {
  const date = new Date().toISOString().split('T')[0];
  const sentiment = pulseData?.market?.sentiment ?? 'neutral';
  const ethPrice = pulseData?.market?.eth?.price;
  
  let body = `## AI Improvement Run — ${date}

`;
  body += `**Market Conditions:** ${sentiment} sentiment`;
  if (ethPrice) body += ` | ETH at US$${ethPrice.toLocaleString()}`;
  body += `

---

`;
  
  improvements.forEach((imp, i) => {
    body += `### ${i + 1}. ${imp.areaName}
`;
    body += `**Urgency:** ${imp.urgencyLevel}

`;
    body += `**Suggested copy:**
\`\`\`
${imp.suggestion}
\`\`\`

`;
    body += `**Rationale:** ${imp.rationale}

`;
    body += `---

`;
  });
  
  body += `*Generated by CrossLedger AI Agent. Review each suggestion before merging.*
`;
  
  return body;
}