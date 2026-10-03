// Single source of truth for addresses and company facts used across pages.
// Verified against Ethereum mainnet on 3 October 2026.

export const CONTRACTS = {
  clxt: "0xDa23800A2fc8d345Af55d9Bf88a7A910B2f90A6d",
  // V1 presale. Every purchase reverts: it declares USDT's transferFrom as
  // returning bool, and mainnet USDT returns nothing. Kept for reads only.
  presaleV1: "0xABCA8F71BA5f0e500A7e9c470048472c0B982B35",
  // V2 presale (CLXPresaleV2, buyWithUSDT(uint256,uint256)). Set
  // NEXT_PUBLIC_PRESALE_V2_ADDRESS in Vercel once it is deployed, funded and
  // has passed a live test purchase. Until then the checkout stays disabled.
  presaleV2: process.env.NEXT_PUBLIC_PRESALE_V2_ADDRESS || "",
  usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  escrow: "0x0171252C8c67Ca3049f8FdD3e8F6292B4C5322BB",
  owner: "0x0AA1BbF196a4Df3464d880f82FA4ACd4365C984b",
};
CONTRACTS.presale = CONTRACTS.presaleV2 || CONTRACTS.presaleV1;

export const SITE = {
  url: "https://www.crossledger.trade",
  entity: "GDN Enterprise Pty Ltd",
  acn: "666 495 263",
  address: "Southport Central Tower 3, Level 5, 9 Lawson Street, Southport QLD 4215, Australia",
  email: "gnardo@gdngroup.com.au",
};

// ISO-3166-1 alpha-2. The purchase interface is disabled for visitors whose IP
// resolves to one of these (see middleware.js). "AU" is precautionary pending
// Australian legal advice on CLXT's classification. Keep the FAQ, the security
// section and the whitepaper aligned with this list.
export const RESTRICTED_JURISDICTIONS = ["US", "CA", "CN", "AU", "KP", "IR", "SY", "CU"];

export const shortAddr = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
