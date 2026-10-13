# crossledger.trade: switch to the migrated CLXT token

Built and checked locally against live main (f877803, unchanged since). Nothing here is live until you upload it.

## Already done

- **Vercel:** `NEXT_PUBLIC_PRESALE_V2_ADDRESS` now points at the new presale, `0x04cC47B073d21AeD5394d98CD252066E4F0f6Fc3` (production and preview). It takes effect with the deploy your upload triggers.
- **Etherscan:** the new token and the new presale are both verified, Exact Match.

## Upload (about 2 minutes)

1. Open github.com/CLX-Trade/crossledger-site, then **Add file**, then **Upload files**, at the repository root.
2. From this folder, drag the three **folders** `lib`, `pages` and `public` onto the upload area. Drag the folders, not the files inside them, so each file lands in the right place. Do not drag `UPLOAD.md` or `changes.diff`.
3. GitHub should list exactly these five files:
   - `lib/site.js`
   - `pages/index.js`
   - `pages/token.js`
   - `pages/whitepaper.js`
   - `public/CrossLedger-CLXT-Whitepaper.pdf`
4. Commit message: `Switch the site to the migrated CLXT token`. Commit directly to `main`.

Vercel deploys in a minute or two. Tell Claude when it's done, and Claude will check the live pages and the checkout.

## What changes on the site

- **Token address everywhere** (footer, homepage, token facts, whitepaper) becomes the new CLXT, `0x64B34A9e5D57F2e9874EC2D675EF73cC19BFc5CC`.
- **Token facts page:** the "wallet warnings" box becomes a short account of the migration (why, what the new contract is, what carried over, what to do with the old token). The holdings table shows 600,000,000 locked, 380,000,000 owner (unlocked) and 20,000,000 presale. Locks link to Sablier #1797, #1798 and #1799. The contract cards now say "No owner", "Cannot be paused" and "Fixed supply". The old token and old presale are listed under retired contracts.
- **Whitepaper v2.2:** the "Supply accounting and staking" section becomes "Token migration and supply". The on-chain facts, allocation, status table, roadmap and risk factors are updated to match, and the PDF is regenerated.
- **Homepage:** the supply-defect notice, the disclosure card, the roadmap item and three FAQ answers now describe the defect as fixed by the migration. The concentration figure is now 38% unlocked in the owner address.

## Please read before you upload

The pages now say publicly that no wallet other than the owner address was carried over. They also say that the 125,001,000 CLXT strategic allocation, held in a separate wallet on the original token, now sits in the owner address. That is accurate on-chain. If you would rather word it differently, tell Claude before uploading.
