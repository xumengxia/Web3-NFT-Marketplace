import { useState, useEffect, useMemo } from "react";
import {
  Typography, Empty, message
} from "antd";
import { ethers } from "ethers";
import { useAppKitAccount, useAppKitBalance } from "@reown/appkit/react";
import { useContract } from "../../context/contractContext";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../../utils/pinata";
import type { nftType, NFTMetaType } from "../../types";
import NftList from "../../component/nftList";
import "./index.css";
import { UserOutlined, WalletOutlined, DollarOutlined } from "@ant-design/icons";
const { Title, Text } = Typography;
export default function Profile() {
  const { contract } = useContract();
  const { address, isConnected } = useAppKitAccount();
  const { fetchBalance } = useAppKitBalance();
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [data, updateData] = useState<NFTMetaType[]>([]);
  const [dataFetched, updateFetched] = useState(false);
  const [totalPrice, updateTotalPrice] = useState("0");
  const [loading, setLoading] = useState(false);
  // 2. 使用 useMemo 优化地址格式化，避免每次渲染都重新计算
  const shortAddress = useMemo(() => {
    return address ? `${address.slice(0, 8)}...${address.slice(-4)}` : null;
  }, [address]);
  const fetchWalletBalance = async () => {
    if (!isConnected || !address) return;

    try {
      setLoading(true);
      const balanceData = await fetchBalance();

      if (balanceData?.data?.balance) {
        const formattedBalance = parseFloat(balanceData.data.balance).toFixed(5);
        setBalance(formattedBalance);
        setSymbol(balanceData.data.symbol || "ETH");
      }
    } catch (err) {
      console.error("Failed to get the balance:", err);
      message.error("Failed to get the balance");
    } finally {
      setLoading(false);
    }
  };

  const getNFTData = async () => {
    if (!contract) {
      console.error("Contract not connected");
      return;
    }
    try {
      setLoading(true);
      const nftList = await contract.getMyNFTs();
      console.log("nftList", nftList);
      let sumPrice = 0;
      // fetch all the details of every NFT from the contract and display
      const _nftList = await Promise.all(
        nftList.map(async (nft: any) => {
          let tokenURI = await contract.tokenURI(nft.tokenId);
          // console.log("getting this tokenUri", tokenURI);
          tokenURI = GetIpfsUrlFromPinata(tokenURI);
          let meta: nftType = (await axios.get(tokenURI)).data;
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
          sumPrice += Number(price);
          return _nft;
        })
      );
      updateFetched(true);
      updateData(_nftList);
      updateTotalPrice(sumPrice.toPrecision(3));

    } catch (error) {
      console.error("Failed to get the NFT list:", error);
      message.error('error');
    } finally {
      setLoading(false);
    }
  };

  // 监听连接状态变化，更新余额
  useEffect(() => {
    if (isConnected && address) {
      fetchWalletBalance();
    } else {
      // 断开连接时重置状态
      setBalance(null);
      setSymbol(null);
      updateData([]);
      updateTotalPrice("0");
      updateFetched(false);
    }
  }, [isConnected, address, fetchBalance]);

  useEffect(() => {
    // 仅在合约可用且未获取过数据时执行
    if (contract && !dataFetched) {
      getNFTData();
    }
  }, [contract, dataFetched]); // 依赖变化时才重新执行

  // 监听地址变化，当用户切换账号时自动刷新数据
  useEffect(() => {
    if (address && contract) {
      console.log('Address changed, refreshing data...');
      updateFetched(false);
      getNFTData();
    }
  }, [address]); // 监听地址变化
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div className="container">
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>MY PROFILE</h2>

          </div>
          <div className="top mrg-top20">
            <div className="item">
              <UserOutlined />
              <Text type="secondary" className="font-size16">Wallet Address</Text>
              <Title level={4} style={{ marginTop: '5px' }}>{shortAddress}</Title>
            </div>

            <div className="item">
              <WalletOutlined />
              <Text type="secondary" className="font-size16">Balance</Text>
              <Title level={4} style={{ marginTop: '5px' }}>{balance} {symbol}</Title>
            </div>

            <div className="item">
              <DollarOutlined />
              <Text type="secondary" className="font-size16">No. of NFTs</Text>
              <Title level={4} style={{ marginTop: '5px' }}>{totalPrice} {symbol}</Title>
            </div>

            <div className="item">
              <DollarOutlined />
              <Text type="secondary" className="font-size16">Total Value</Text>
              <Title level={4} style={{ marginTop: '5px' }}>{data.length}</Title>
            </div>

          </div>
        </header>
        <h2 className="mrg-top40">YOUR NFTS</h2>
        <div>Largest floor price change in the past day</div>
        {data.length > 0 ? (
          <NftList data={data}></NftList>
        ) : (
          <div className="mrg-top20 box" ><Empty /></div>

        )}
      </div>
    </div>
  );
}
