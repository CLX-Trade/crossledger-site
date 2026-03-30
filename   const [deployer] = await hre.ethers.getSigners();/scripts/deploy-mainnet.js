const hre = require("hardhat");
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  const CLXToken = await hre.ethers.getContractFactory("CLXToken");
  const clxt = await CLXToken.deploy(deployer.address);
  await clxt.waitForDeployment();
  const clxtAddress = await clxt.getAddress();
  console.log("CLXToken:", clxtAddress);
  const Presale = await hre.ethers.getContractFactory("CLXPresale");
  const presale = await Presale.deploy(clxtAddress, USDT, deployer.address);
  await presale.waitForDeployment();
  const presaleAddress = await presale.getAddress();
  console.log("CLXPresale:", presaleAddress);
  require("fs").writeFileSync("./mainnet-deployments.json", JSON.stringify({CLXToken: clxtAddress, CLXPresale: presaleAddress}, null, 2));
  console.log("\n✅ DONE!", {CLXToken: clxtAddress, CLXPresale: presaleAddress});
}
main().catch((e) => { console.error(e); process.exitCode = 1; });