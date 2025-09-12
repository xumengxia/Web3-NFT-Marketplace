// src/App.tsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Button, Card, Typography, Space, Layout } from "antd";
import { BrowserProvider, formatEther } from "ethers";
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";

// 解构 Ant Design 组件（简化代码）
const { Header, Content } = Layout;
const { Title, Text } = Typography;

const App: React.FC = () => {
  // 1. AppKit Hooks：使用官方推荐的 hooks
  const { open } = useAppKit(); // 控制模态框的显示
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount(); // 获取账户信息
  const { disconnect } = useDisconnect(); // 断开连接

  // 2. 状态管理：ETH 余额
  const [balance, setBalance] = useState<string | null>(null);

  // 3. 使用 useMemo 优化地址格式化，避免每次渲染都重新计算
  const shortAddress = useMemo(() => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;
  }, [address]);

  // 4. 使用 useCallback 优化函数，避免不必要的重新创建
  const handleConnect = useCallback(() => {
    open();
  }, [open]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  // 5. 钱包连接状态变化时，查询账户信息
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (isConnected && address) {
        try {
          // 使用 window.ethereum 获取余额（简化版本）
          if (window.ethereum) {
            const provider = new BrowserProvider(window.ethereum as any);
            const ethBalance = await provider.getBalance(address);
            setBalance(formatEther(ethBalance)); // 转换为 ETH 格式（默认是 wei）
          }
        } catch (error) {
          console.error("获取余额失败:", error);
          setBalance("0");
        }
      } else {
        // 断开连接时重置状态
        setBalance(null);
      }
    };

    fetchAccountInfo();
  }, [isConnected, address]); // 依赖：连接状态、地址变化时触发

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* 顶部导航栏 */}
      <Header style={{ background: "#fff", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Title level={4} style={{ margin: 0 }}>Web3 NFT Marketplace</Title>
        {/* 钱包连接按钮 */}
        {!isConnected ? (
          <Button type="primary" onClick={handleConnect}>
            连接钱包
          </Button>
        ) : (
          <Space>
            <Text>已连接：{shortAddress}</Text>
            <Button onClick={handleDisconnect}>断开连接</Button>
          </Space>
        )}
      </Header>

      {/* 主内容区 */}
      <Content style={{ padding: "50px", display: "flex", justifyContent: "center" }}>
        <Card title="账户信息" style={{ width: 400 }}>
          {isConnected ? (
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Text>账户地址：{shortAddress}</Text>
              <Text>完整地址：{address}</Text>
              <Text>CAIP 地址：{caipAddress}</Text>
              <Text>连接状态：{status}</Text>
              <Text>ETH 余额：{balance ? `${parseFloat(balance).toFixed(4)} ETH` : "加载中..."}</Text>
              {embeddedWalletInfo && (
                <Text>嵌入钱包信息：{embeddedWalletInfo.user?.email || embeddedWalletInfo.user?.username || "未知"}</Text>
              )}
              <Button type="default" disabled>
                查看 NFT 资产（待实现）
              </Button>
            </Space>
          ) : (
            <Text type="warning">请先连接钱包查看账户信息</Text>
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default App;