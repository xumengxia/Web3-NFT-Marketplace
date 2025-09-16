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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isConnected } = useAppKitAccount();
  // getAll
  const getAllNFTs = async () => {
    // 添加合约存在检查
    if (!contract) {
      console.error("Contract not connected");
      setError("The contract is not connected. Please connect your wallet first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nftList = await contract.getAllNFTs();
      console.log("nftList", nftList);

      // 如果没有 NFT，直接返回空数组
      if (!nftList || nftList.length === 0) {
        console.log("No NFTs found");
        updateFetched(true);
        updateData([]);
        return;
      }

      // fetch all the details of every NFT from the contract and display
      const _nftList = await Promise.all(
        nftList.map(async (nft: any) => {
          try {
            let tokenURI = await contract.tokenURI(nft.tokenId);
            console.log("getting this tokenUri", tokenURI);
            tokenURI = GetIpfsUrlFromPinata(tokenURI);

            // 添加重试机制
            let meta: nftType = {
              image: "https://via.placeholder.com/300x300?text=NFT+Image+Unavailable",
              name: `NFT #${nft.tokenId}`,
              description: "Metadata temporarily unavailable",
              price: "0"
            };
            let retries = 3;
            while (retries > 0) {
              try {
                const response = await axios.get(tokenURI, { timeout: 10000 });
                meta = response.data;
                break;
              } catch (ipfsError) {
                retries--;
                console.warn(`IPFS fetch failed, retries left: ${retries}`, ipfsError);
                if (retries === 0) {
                  // 如果所有重试都失败，使用默认数据
                  meta = {
                    image: "https://via.placeholder.com/300x300?text=NFT+Image+Unavailable",
                    name: `NFT #${nft.tokenId}`,
                    description: "Metadata temporarily unavailable",
                    price: "0"
                  };
                } else {
                  // 等待 1 秒后重试
                  await new Promise(resolve => setTimeout(resolve, 1000));
                }
              }
            }

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
          } catch (error) {
            console.error(`Error processing NFT ${nft.tokenId}:`, error);
            // 返回默认数据而不是抛出错误
            return {
              price: ethers.formatEther(nft.price.toString()),
              tokenId: nft.tokenId,
              seller: nft.seller,
              owner: nft.owner,
              image: "https://via.placeholder.com/300x300?text=NFT+Image+Unavailable",
              name: `NFT #${nft.tokenId}`,
              description: "Metadata temporarily unavailable"
            };
          }
        })
      );
      updateFetched(true);
      updateData(_nftList);
    } catch (error) {
      console.error("Failed to get the NFT list:", error);
      setError("Failed to retrieve the NFT list. Please try again later.");
      updateFetched(true);
      updateData([]);
    } finally {
      setIsLoading(false);
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
        {isLoading && (
          <div className="container" style={{ textAlign: "center", padding: "50px" }}>
            <h3>Loading NFT list...</h3>
            <div>Please wait a moment, this may take a few seconds.</div>
          </div>
        )}

        {error && (
          <div className="container" style={{ textAlign: "center", padding: "50px" }}>
            <h3 style={{ color: "red" }}>Loading failed</h3>
            <div>{error}</div>
            <button
              onClick={() => {
                setError(null);
                updateFetched(false);
                getAllNFTs();
              }}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#1890ff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && data.length > 0 && (
          <div className="container" >
            <h2>Top Movers Today</h2>
            <div>Largest floor price change in the past day</div>
            <NftList data={data}></NftList>
          </div>
        )}

        {!isLoading && !error && data.length === 0 && dataFetched && (
          <div className="container" style={{ textAlign: "center", padding: "50px" }}>
            <h3>No NFT available yet</h3>
            <div>There are no NFTs on the market yet. Be the first person to create an NFT!</div>
          </div>
        )}
      </div>
    </div >
  );
}
