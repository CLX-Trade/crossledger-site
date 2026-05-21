#!/usr/bin/env node
/**
 * scripts/run-ai-agent.mjs
 * CrossLedger AI Organism - Agent Runner Script
 * 
 * Called by GitHub Actions. Fetches live data, runs AI analysis,
 * and writes results to ai-improvements.json for PR creation.
 */

import { writeFileSync } from 'fs';
import { runImprovementAgent, formatPRDescription } from '../lib/ai-agent.js';

const SITE_URL = 'https://www.crossledger.trade';

async function main() {
  console.log('[runner] CrossLedger AI Organism starting...');
  console.log('[runner] Time:', new Date().toISOString());
  
  // Step 1: Fetch live pulse data from the deployed site
  let pulseData = null;
  try {
    console.log('[runner] Fetching pulse data from:', SITE_URL + '/api/pulse');
    const res = await fetch(SITE_URL + '/api/pulse', {
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'CrossLedger-AI-Agent/1.0' }
    });
    if (res.ok) {
      pulseData = await res.json();
      console.log('[runner] Pulse data received. Health:', pulseData.health);
      console.log('[runner] Market sentiment:', pulseData?.market?.sentiment ?? 'unavailable');
    } else {
      console.warn('[runner] Pulse endpoint returned:', res.status);
    }
  } catch (err) {
    console.warn('[runner] Could not fetch pulse data:', err.message);
    // Fallback pulse data if site is not reachable
    pulseData = {
      timestamp: new Date().toISOString(),
      presale: { stage: 1, totalStages: 4, price: 0.10, symbol: 'CLXT', urgency: 'Stage 1 live at US$0.10' },
      market: null,
      health: 'degraded-fallback'
    };
  }
  
  // Step 2: Run AI improvement agent
  console.log('[runner] Starting AI analysis...');
  let improvements = [];
  try {
    improvements = await runImprovementAgent(pulseData);
    console.log('[runner] Generated', improvements.length, 'improvement suggestions');
  } catch (err) {
    console.error('[runner] AI agent failed:', err.message);
    process.exit(1);
  }
  
  if (improvements.length === 0) {
    console.log('[runner] No improvements generated — skipping PR creation');
    process.exit(0);
  }
  
  // Step 3: Write results to file for GitHub Actions to pick up
  const output = {
    runDate: new Date().toISOString(),
    siteUrl: SITE_URL,
    market: pulseData?.market ?? null,
    presale: pulseData?.presale ?? null,
    improvements,
    prDescription: formatPRDescription(improvements, pulseData),
  };
  
  writeFileSync('ai-improvements.json', JSON.stringify(output, null, 2));
  console.log('[runner] Results written to ai-improvements.json');
  
  // Step 4: Print summary
  console.log('\n=== AI ORGANISM SUMMARY ===');
  improvements.forEach((imp, i) => {
    console.log(`\n${i + 1}. ${imp.areaName} [${imp.urgencyLevel}]`);
    console.log('   ', imp.suggestion.slice(0, 80) + (imp.suggestion.length > 80 ? '...' : ''));
  });
  console.log('\n[runner] Done. Pull Request will be created by GitHub Actions.');
}

main().catch(err => {
  console.error('[runner] Fatal error:', err);
  process.exit(1);
});