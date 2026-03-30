const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with: ${deployer.address}`);

  console.log("Deploying DocumentRegistry...");
  const DocRegistry = await hre.ethers.getContractFactory("DocumentRegistry");
  const docRegistry = await DocRegistry.deploy();
  await docRegistry.waitForDeployment();
  const docRegistryAddress = await docRegistry.getAddress();
  console.log(`DocumentRegistry: ${docRegistryAddress}`);

  console.log("Deploying CLXToken...");
  const CLXToken = await hre.ethers.getContractFactory("CLXToken");
  const clxToken = await CLXToken.deploy(deployer.address);
  await clxToken.waitForDeployment();
  const clxTokenAddress = await clxToken.getAddress();
  console.log(`CLXToken: ${clxTokenAddress}`);

  console.log("Deploying CrossLedgerEscrow...");
  const Escrow = await hre.ethers.getContractFactory("CrossLedgerEscrow");
  const escrow = await Escrow.deploy(clxTokenAddress, docRegistryAddress, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`CrossLedgerEscrow: ${escrowAddress}`);

  await (await clxToken.setEscrowContract(escrowAddress)).wait();
  await (await clxToken.enableTrading()).wait();
  console.log("Contracts linked.");

  const fs = require("fs");
  const addresses = {
    DocumentRegistry: docRegistryAddress,
    CLXToken: clxTokenAddress,
    CrossLedgerEscrow: escrowAddress,
  };
  fs.writeFileSync("./deployments.json", JSON.stringify(addresses, null, 2));
  console.log("\n✓ All contracts deployed!");
  console.log(addresses);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });