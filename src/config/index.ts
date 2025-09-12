import { mainnet, arbitrum, sepolia, defineChain } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

// Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_PROJECT_ID

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Create a metadata object - optional
export const metadata = {
    name: "Web3 NFT Marketplace",
    description: "React + AppKit 示例项目",
    url: "http://localhost:5174/", // 本地开发地址，需与浏览器地址一致
    icons: ["https://avatars.githubusercontent.com/u/109822300"], // 应用图标（可选）
}

// Define the local network
const localNetwork = defineChain({
    id: 31337, // 数字
    caipNetworkId: 'eip155:31337',
    chainNamespace: 'eip155',
    name: 'Hardhat Local',
    nativeCurrency: {
        decimals: 18,
        name: 'Ethereum',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:8545'], // Hardhat默认RPC地址
            webSocket: ['ws://127.0.0.1:8545'], // Hardhat默认WebSocket地址
        },
    },
    blockExplorers: {
        default: { name: 'Local Explorer', url: 'http://localhost:8545' },
    },
    contracts: {
        // Add the contracts here
    }
})


// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [localNetwork, mainnet, arbitrum, sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

// Set up Solana Adapter 初始化 Ethers 适配器
export const ethersAdapter = new EthersAdapter();