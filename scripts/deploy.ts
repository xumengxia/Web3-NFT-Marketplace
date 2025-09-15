import { network } from "hardhat";
import * as fs from "fs";

const { ethers } = await network.connect({
  network: "hardhatOp",
  chainType: "op",
});
async function main() {
  // 使用 require 方式导入，避免 ES 模块问题
  const _contract = await ethers.getContractFactory("NFTMarketplace");
  const _nftmarket = await _contract.deploy();
  await _nftmarket.waitForDeployment(); // 3.x 中等待部署完成的正确方法

  const contractAddress = _nftmarket.target; // 3.x 中获取合约地址的方式
  console.log("NFTMarketplace deployed to:", contractAddress);

  // 4. 获取 ABI
  const contractAbi = _nftmarket.interface;
  console.log("合约ABI:", contractAbi);

  // 5. 组装成JSON格式（类似Marketplace.json）
  const contractData = {
    address: contractAddress,
    abi: contractAbi.fragments
  };

  // 6. 将数据写入JSON文件
  const jsonString = JSON.stringify(contractData, null, 2);
  fs.writeFileSync("./src/Marketplace.json", jsonString);
  console.log("合约数据已保存到 NFTMarketplace.json");


}

main().catch((error) => {
  console.error("部署失败:", error);
  process.exitCode = 1;
});


console.log("Transaction sent successfully");
