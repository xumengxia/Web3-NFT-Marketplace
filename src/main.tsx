// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom'
import "./index.css";
import "antd/dist/reset.css"; // 引入 Ant Design 样式
import { AppKitProvider } from "@reown/appkit/react";
import { networks, projectId, metadata, ethersAdapter } from "./config";
import { MainProviders } from "./context/index";
import Layout from "./component/Layout/index";
// 创建根组件，注入 AppKit Provider
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(

  <AppKitProvider
    projectId={projectId}
    networks={networks}
    metadata={metadata}
    adapters={[ethersAdapter]} // 关联 Ethers 适配器，支持链上交互
  >
    {/* 自定义 Context Providers：提供合约等全局状态 */}
    <MainProviders>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </MainProviders>
  </AppKitProvider>

);