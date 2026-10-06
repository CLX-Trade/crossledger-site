// Single source of truth for addresses and company facts used across pages.
// Verified against Ethereum mainnet on 6 October 2026.

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
  // An earlier presale contract that pointed at a non-USDT address, so every
  // purchase reverted. Switched off and emptied on 6 October 2026, as was V1.
  presaleLegacy: "0x3c5AbD6107b8f62D836db6176C9c3f698e6AF501",
  // Strategic allocation wallet (a senior manager). Not locked.
  strategic: "0xa533F8A9b405A6f1E1398bc289E2917521f1D2b1",
  // Sablier Lockup contract holding the vesting streams below.
  sablierLockup: "0x93b37Bd5B6b278373217333Ac30D7E74c85fBDCB",
  // Token ownership was transferred here on 6 October 2026 (renounced).
  dead: "0x000000000000000000000000000000000000dEaD",
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
// resolves to one of these (see middleware.js). Australia was removed on
// 6 October 2026 after GDN received Australian legal advice. Keep the FAQ, the security
// section and the whitepaper aligned with this list.
export const RESTRICTED_JURISDICTIONS = ["US", "CA", "CN", "KP", "IR", "SY", "CU"];

// Public, non-cancelable Sablier vesting streams created on 6 October 2026.
// Every stream pays back to the owner address on the schedule shown.
export const LOCKS = [
  { id: 1783, name: "Ecosystem and trade incentives", amount: 350_000_000, schedule: "Nothing released until 6 April 2027, then released continuously until 6 October 2029" },
  { id: 1784, name: "Founders and team", amount: 150_000_000, schedule: "Nothing released until 6 October 2027, then released continuously until 6 October 2029" },
  { id: 1785, name: "Exchange and liquidity", amount: 100_000_000, schedule: "Timelock: released in full on 6 October 2027" },
];
export const lockUrl = (id) => `https://app.sablier.com/vesting/stream/LK3-1-${id}`;
export const lockNftUrl = (id) => `https://etherscan.io/nft/${CONTRACTS.sablierLockup}/${id}`;

// Holdings read from mainnet on 6 October 2026.
export const HOLDINGS_DATE = "6 October 2026";
export const HOLDINGS = [
  { label: "Locked in vesting (3 Sablier streams)", amount: 600_000_000, href: `https://etherscan.io/token/${CONTRACTS.clxt}?a=${CONTRACTS.sablierLockup}` },
  { label: "Owner and treasury (unlocked)", amount: 243_945_290, address: CONTRACTS.owner },
  { label: "Strategic allocation (unlocked)", amount: 125_001_000, address: CONTRACTS.strategic },
  { label: "Presale V2 (for sale)", amount: 20_000_000, address: CONTRACTS.presaleV2 || "0x8F190E1764bfE57ddd2Daff5F55a79C64760c14F" },
  { label: "Other holders", amount: 11_053_710 },
];

export const shortAddr = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
