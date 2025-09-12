import { ethers } from "ethers";
import { useContract } from "../../context/contractContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../../utils/pinata";
import "./index.css";
import type { nftType, NFTMetaType } from "../../types";
import { Carousel } from "antd";
import NftList from "../../component/nftList";
import { useAppKitAccount } from "@reown/appkit/react";
export default function Marketplace() {
  const { contract } = useContract();
  const [data, updateData] = useState<NFTMetaType[]>([]);
  const [dataFetched, updateFetched] = useState(false);
  const { isConnected } = useAppKitAccount();
  // getAll
  const getAllNFTs = async () => {
    // 添加合约存在检查
    if (!contract) {
      console.error("Contract not connected");
      return;
    }

    try {
      const nftList = await contract.getAllNFTs();
      console.log("nftList", nftList);
      // fetch all the details of every NFT from the contract and display
      const _nftList = await Promise.all(
        nftList.map(async (nft: any) => {
          let tokenURI = await contract.tokenURI(nft.tokenId);
          // console.log("getting this tokenUri", tokenURI);
          tokenURI = GetIpfsUrlFromPinata(tokenURI);
          let meta: nftType = await axios.get(tokenURI);
          meta = meta.data;
          const price = ethers.formatEther(nft.price.toString());
          const _nft = {
            price,
            tokenId: nft.tokenId,
            seller: nft.seller,
            owner: nft.owner,
            image: meta.image,
            name: meta.name,
            description: meta.description,
          };
          return _nft;
        })
      );
      updateFetched(true);
      updateData(_nftList);
    } catch (error) {
      console.error("Failed to get the NFT list:", error);
    }
  };
  // 添加加载和错误状态处理
  // 关键修复：用useEffect控制数据获取，依赖contract和dataFetched
  useEffect(() => {
    // 仅在合约可用且未获取过数据时执行
    if (contract && !dataFetched) {
      getAllNFTs();
    }

  }, [contract, dataFetched]); // 依赖变化时才重新执行
  useEffect(() => {
    if (!isConnected) {
      updateData([]);
    }
  }, [isConnected]);
  const contentStyle: React.CSSProperties = {
    height: "460px",
    color: "#fff",
    lineHeight: "160px",
    textAlign: "center",
    background: "#add7ee",
  };
  return (
    <div style={{ width: "100%" }}>
      <Carousel autoplay>
        <div>
          <h3 style={contentStyle}></h3>
        </div>
        <div>
          <h3 style={contentStyle}></h3>
        </div>
      </Carousel>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {data.length > 0 && (
          <div className="container" >
            <h2>Top Movers Today</h2>
            <div>Largest floor price change in the past day</div>
            <NftList data={data}></NftList>
          </div>

        )}


      </div>
    </div >
  );
}
