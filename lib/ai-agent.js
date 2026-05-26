/**
 * lib/ai-agent.js - CrossLedger AI Improvement Brain
 *
 * Analyzes the site, generates improvement suggestions, AND applies them
 * directly to live files (_document.js, index.js) on each run.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

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
 * Main agent function - runs analysis, returns improvement suggestions,
 * and applies live file patches.
 * @param {Object} pulseData - Live data from /api/pulse endpoint
 * @returns {Array} Array of improvement objects
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

  // Apply live patches to files
  try {
        await applyLivePatches(improvements, pulseData);
  } catch (err) {
        console.error('[ai-agent] Live patch failed (non-fatal):', err.message);
  }

  return improvements;
}

/**
 * Apply the best suggestions directly to live site files.
 */
async function applyLivePatches(improvements, pulseData) {
    const docPath = path.resolve('pages/_document.js');
    const market = pulseData?.market ?? {};
    const ethPrice = market?.eth?.price ?? null;
    const btcPrice = market?.btc?.price ?? null;
    const sentiment = market?.sentiment ?? 'neutral';

  // --- Patch 1: Update SEO meta tags in _document.js ---
  const seoImp = improvements.find(i => i.area === 'seo_metadata');
    if (seoImp && seoImp.suggestion) {
          try {
                  let docContent = readFileSync(docPath, 'utf8');

            // Extract just the text content from the suggestion for description
            const rawSuggestion = String(seoImp.suggestion);
                  // Parse out meta description if it exists in the suggestion
            const descMatch = rawSuggestion.match(/content="([^"]{30,200})"/);
                  const newDesc = descMatch
                    ? descMatch[1]
                            : `CrossLedger delivers smart escrow and on-chain settlement for cross-border commodity trade. Stage 1 presale live at $0.10/CLXT. Built by GDN Group.`;

            // Update the primary meta description
            docContent = docContent.replace(
                      /<meta name="description" content="[^"]*"[^/]*\/>/,
                      `<meta name="description" content="${newDesc.replace(/"/g, '&quot;')}" />`
                    );

            writeFileSync(docPath, docContent, 'utf8');
                  console.log('[ai-agent] Patched: _document.js meta description updated');
          } catch (err) {
                  console.error('[ai-agent] Could not patch _document.js:', err.message);
          }
    }

  // --- Patch 2: Update market snapshot data in index.js ---
  if (ethPrice || btcPrice) {
        try {
                const indexPath = path.resolve('pages/index.js');
                let indexContent = readFileSync(indexPath, 'utf8');

          const ethStr = ethPrice ? `$${Math.round(ethPrice).toLocaleString()}` : null;
                const btcStr = btcPrice ? `$${Math.round(btcPrice).toLocaleString()}` : null;
                const sentimentCap = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

          // Update any existing market ticker line in the page
          // Matches patterns like: BTC $XX,XXX • ETH $X,XXX • Sentiment: Xxx
          const tickerRegex = /BTC \$[\d,]+ [•·] ETH \$[\d,]+ [•·] Sentiment: \w+/g;
                if (tickerRegex.test(indexContent)) {
                          indexContent = indexContent.replace(
                                      /BTC \$[\d,]+ [•·] ETH \$[\d,]+ [•·] Sentiment: \w+/g,
                                      `BTC ${btcStr} • ETH ${ethStr} • Sentiment: ${sentimentCap}`
                                    );
                          writeFileSync(indexPath, indexContent, 'utf8');
                          console.log('[ai-agent] Patched: index.js market ticker updated');
                } else {
                          console.log('[ai-agent] No market ticker pattern found in index.js — skipping');
                }
        } catch (err) {
                console.error('[ai-agent] Could not patch index.js:', err.message);
        }
  }

  // --- Patch 3: Update sitemap lastmod to today ---
  try {
        const sitemapPath = path.resolve('public/sitemap.xml');
        let sitemapContent = readFileSync(sitemapPath, 'utf8');
        const today = new Date().toISOString().split('T')[0];
        sitemapContent = sitemapContent.replace(/<lastmod>[^<]+<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
        writeFileSync(sitemapPath, sitemapContent, 'utf8');
        console.log('[ai-agent] Patched: sitemap.xml lastmod updated to', today);
  } catch (err) {
        console.error('[ai-agent] Could not patch sitemap.xml:', err.message);
  }
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

  let parsed;
    try {
          const jsonStr = responseText.replace(/^[^{]*({.*})[^}]*$/s, '$1');
          parsed = JSON.parse(jsonStr);
    } catch (e) {
          console.error('[ai-agent] Could not parse JSON for area:', area.id, responseText.slice(0, 100));
          return null;
    }

  return {
        area: area.id,
        areaName: area.name,
        suggestion: parsed.suggestion ?? '',
        rationale: parsed.rationale ?? '',
        urgencyLevel: parsed.urgency_level ?? 'medium',
        generatedAt: new Date().toISOString(),
        marketSnapshot: {
                ethPrice: pulseData?.market?.eth?.price ?? null,
                sentiment: pulseData?.market?.sentiment ?? 'unknown',
        },
  };
}

function buildMarketContext(pulseData) {
    if (!pulseData?.market) {
          return 'Market data unavailable. Use general presale urgency messaging.';
    }
    const m = pulseData.market;
    const eth = m.eth ? `ETH: $${m.eth.price} (${m.eth.change24h >= 0 ? '+' : ''}${m.eth.change24h?.toFixed(2)}% 24h)` : '';
    const btc = m.btc ? `BTC: $${m.btc.price} (${m.btc.change24h >= 0 ? '+' : ''}${m.btc.change24h?.toFixed(2)}% 24h)` : '';
    const sentiment = `Overall sentiment: ${m.sentiment ?? 'neutral'}`;
    const presale = pulseData.presale ? `Presale: ${pulseData.presale.urgency}` : '';
    return [eth, btc, sentiment, presale].filter(Boolean).join('\n');
}

export function formatPRDescription(improvements, pulseData) {
    const market = pulseData?.market;
    const ethStr = market?.eth?.price ? `US$${market.eth.price}` : 'N/A';
    const dateStr = new Date().toISOString().split('T')[0];

  let desc = `## AI Improvement Run — ${dateStr}\n\n`;
    desc += `**Market Conditions:** ${market?.sentiment ?? 'unknown'} sentiment | ETH at ${ethStr}\n\n---\n\n`;

  improvements.forEach((imp, i) => {
        desc += `### ${i + 1}. ${imp.areaName}\n`;
        desc += `**Urgency:** ${imp.urgencyLevel}\n\n`;
        desc += `**Suggested copy:**\n\`\`\`\n${imp.suggestion}\n\`\`\`\n\n`;
        desc += `**Rationale:** ${imp.rationale}\n\n---\n\n`;
  });

  desc += `*Generated by CrossLedger AI Agent. Live file patches applied automatically.*\n`;
    return desc;
}
