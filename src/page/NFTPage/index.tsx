import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { useContract } from "../../context/contractContext";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../../utils/pinata";
import { useAppKitAccount } from "@reown/appkit/react";
import type { nftType, NFTMetaType } from "../../types";
import { Button, message, Typography, Divider } from "antd";
import "./index.css";
const { Title, Text } = Typography;
export default function NFTPage() {
  const { contract, isLoading, error } = useContract();
  const { address, isConnected } = useAppKitAccount();
  const [data, updateData] = useState<NFTMetaType>({} as NFTMetaType);
  const [dataFetched, updateDataFetched] = useState(false);
  const getNFTData = async (tokenId: string) => {
    if (!contract || !isConnected) {
      console.error("Contract not connected");
      return;
    }
    try {
      console.log("getting this tokenId", tokenId);
      const listedToken = await contract.getListedTokenForId(tokenId);
      console.log("listedToken", listedToken);

      let tokenURI = await contract.tokenURI(tokenId);
      // console.log("getting this tokenUri", tokenURI);
      tokenURI = GetIpfsUrlFromPinata(tokenURI);
      let meta: nftType = (await axios.get(tokenURI)).data;

      let item: NFTMetaType = {
        price: meta.price,
        tokenId: Number(tokenId),
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };

      console.log(item);
      updateData(item);
      updateDataFetched(true);
    } catch (error) {
      console.error("Failed to get the NFT list:", error);
    }
  };
  const location = useLocation();
  const tokenId = location.pathname.split("/")[2];
  useEffect(() => {
    // 仅在合约可用且未获取过数据时执行
    if (contract && !dataFetched) {
      getNFTData(tokenId);
    }
  }, [contract, dataFetched]); // 依赖变化时才重新执行
  const buyNFT = async (tokenId: string) => {
    if (!contract || !isConnected) {
      console.error("Contract not connected");
      return;
    }
    try {
      const salePrice = ethers.parseEther(data.price.toString())
      message.warning("Buying the NFT... Please Wait (Upto 5 mins)")
      // run the excuteSale function
      let TX = await contract.executeSale(tokenId, { value: salePrice })
      await TX.wait()
      message.success("NFT purchased successfully")
      window.location.replace("/profile")

    } catch (error) {
      console.error("Failed to buy the NFT:", error);
    }
  };
  return (
    <div className="container">
      <div className="nftPage">
        <img src={data.image} alt="" className="left" />
        <div className="info">
          <Title level={2} style={{ margin: 0 }}>{data.name}</Title>
          <Divider style={{ borderColor: '#2d2d2d' }}>

          </Divider>
          <div className="infoList">
            <Title level={4} className="right">Price:</Title>
            {data.price + " ETH"}
          </div>
          <div className="infoList">
            <Title level={4} className="right">description:</Title>
            {data.description}
          </div>

          <div className="infoList">
            <Title level={4} className="right">Owner:</Title>
            {data.owner}
          </div>
          <div className="infoList">
            <Title level={4} className="right">Seller:</Title>
            {data.seller}
          </div>
          <div>
            {address !== data.owner && address !== data.seller ? (
              <Button size="large" className="mrg-top20" type="primary" onClick={() => buyNFT(tokenId)}>Buy this NFT</Button>
            ) : (
              <Title level={4} className="mrg-top20"> You are the owner of this NFT!</Title>

            )}

          </div>
        </div>
      </div>
    </div>
  );
}
