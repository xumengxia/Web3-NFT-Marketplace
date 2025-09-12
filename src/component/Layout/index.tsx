import React, { useMemo } from "react";
import { useLocation } from 'react-router-dom'
import { Button, Typography, Space, Layout, Avatar, Select, message } from "antd";
import { useAppKit, useAppKitAccount, useDisconnect, useAppKitNetwork } from "@reown/appkit/react";
import Navbar from "../Navbar/index";
import Marketplace from '../../page/Marketplace/index'
import SellNFT from '../../page/SellNFT/index'
import NFTPage from '../../page/NFTPage/index'
import Profile from '../../page/Profile/index'
import { networks } from '../../config/index'

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const headerStyle: React.CSSProperties = {
    background: "#fff",
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "fixed",
    top: 0,
    width: "100%",
    zIndex: 1000
};

const App: React.FC = () => {
    // 1. AppKit Hooks：使用官方推荐的 hooks
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { disconnect } = useDisconnect();


    const handleConnect = async () => {
        console.log("connect");
        await open();
    }
    const handleDisconnect = async () => {
        console.log("disconnect");
        await disconnect();
    }


    const location = useLocation()

    const renderPage = () => {
        const path = location.pathname;
        const tokenId = path.split('/')[2];

        // 处理动态路由 - NFT 页面
        if (path.startsWith('/nftPage/') && tokenId) {
            console.log('Rendering NFTPage for tokenId:', tokenId);
            return <NFTPage />
        }

        // 处理静态路由
        switch (path) {
            case '/':
            case '/marketplace':
                return <Marketplace />
            case '/sellnft':
                return <SellNFT />
            case '/profile':
                return <Profile />
            case '/app':
                return <App />

        }
    }
    const { chainId, switchNetwork } = useAppKitNetwork()

    // 获取当前网络信息
    const currentNetwork = useMemo(() => {
        if (!chainId) return null;
        const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 16) : Number(chainId);
        return networks.find(network => network.id === numericChainId) || null;
    }, [chainId]);

    // 获取当前网络ID（确保是数字类型）
    const currentNetworkId = useMemo(() => {
        return currentNetwork?.id as number | null;
    }, [currentNetwork]);

    // 处理网络切换
    const handleSwitchNetwork = async (targetChainId: number) => {
        try {
            console.log("Switching to network:", targetChainId);
            const targetNetwork = networks.find(n => n.id === targetChainId);
            if (targetNetwork) {
                await switchNetwork(targetNetwork);
                message.success(`已切换到网络: ${targetNetwork.name}`);
            }
        } catch (error) {
            console.error('Network switch failed:', error);
            message.error('网络切换失败，请手动切换');
        }
    };
    return (
        <Layout style={{ height: "100vh" }}>
            <Header style={headerStyle}>
                <Title level={4} style={{ margin: 0 }}>Web3 NFT Marketplace</Title>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Navbar />
                    <Select
                        value={currentNetworkId}
                        onChange={handleSwitchNetwork}
                        style={{ width: 180, marginRight: '10px' }}
                        placeholder="选择网络"
                        options={networks.map(network => ({
                            value: network.id,
                            label: (
                                <Space>
                                    <span>{network.name}</span>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        ({network.id})
                                    </Text>
                                </Space>
                            )
                        }))}
                    />
                    {isConnected ?
                        <Button type="primary" onClick={handleDisconnect}>Disconnect</Button>
                        :
                        <Button type="primary" onClick={handleConnect}>Connect Wallet</Button>}
                </div>



            </Header>
            <Content style={{ height: "calc(100vh - 64px)", display: 'flex', justifyContent: 'center' }}>
                {renderPage()}
            </Content>

        </Layout>

    )

}

export default App;