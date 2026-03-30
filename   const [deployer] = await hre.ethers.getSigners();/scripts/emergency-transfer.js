const hre = require("hardhat");
async function main() {
  const NEW_OWNER = "0xf1eeb671c53a31ea94c704c5ac697d66ff027893";
  const PRESALE_CONTRACT = "0x45cB28098cB7c0aAbD2Cae4f1E6A76c39482DC1c";
  const [signer] = await hre.ethers.getSigners();
  console.log("Acting as:", signer.address);
  const abi = [
    "function transferOwnership(address newOwner) external",
    "function owner() view returns (address)"
  ];
  const contract = new hre.ethers.Contract(PRESALE_CONTRACT, abi, signer);
  const currentOwner = await contract.owner();
  console.log("Current owner:", currentOwner);
  console.log("Transferring ownership to new wallet...");
  const tx = await contract.transferOwnership(NEW_OWNER);
  console.log("TX sent:", tx.hash);
  await tx.wait();
  const newOwner = await contract.owner();
  console.log("SUCCESS - New owner:", newOwner);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
