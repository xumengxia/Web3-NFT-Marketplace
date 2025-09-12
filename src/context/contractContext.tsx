import { useAppKitProvider, useAppKitAccount } from "@reown/appkit/react";
import { useState, useEffect } from "react";
import { ethers, BrowserProvider } from "ethers";
import NFTMarketplace from '../../artifacts/NFTMarketplace_metadata.json';
import { createContext, useContext } from "react";

export const contractContext = createContext<{
    contract: ethers.Contract | null;
    isLoading: boolean;
    error: string | null;
}>({
    contract: null,
    isLoading: false,
    error: null
});
export function ContractProvider({ children }: { children: React.ReactNode }) {
    const { walletProvider } = useAppKitProvider("eip155");
    const { address, isConnected } = useAppKitAccount();

    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeContract = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // 检查环境变量
                const contractAddress = import.meta.env.VITE_CONTRACT_USDTADDR;
                if (!contractAddress) {
                    const errorMsg = '合约地址未配置';
                    setError(errorMsg);
                    return;
                }

                // 检查钱包连接状态
                if (!isConnected || !walletProvider) {
                    console.log('等待钱包连接...');
                    return;
                }
                const ethersProvider = new BrowserProvider(walletProvider as any);
                const signer = await ethersProvider.getSigner();
                // 使用 Reown 提供的 walletProvider

                const contractInstance = new ethers.Contract(
                    contractAddress,
                    NFTMarketplace.output.abi,
                    signer
                );

                setContract(contractInstance);
                console.log('合约连接成功');

            } catch (error) {
                const errorMsg = `合约初始化失败: ${error instanceof Error ? error.message : '未知错误'}`;
                console.error("Error initializing contract:", error);
                setError(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        initializeContract();
    }, [address, walletProvider, isConnected]); // 依赖 Reown 的状态

    return (
        <contractContext.Provider value={{ contract, isLoading, error }}>
            {children}
        </contractContext.Provider>
    );
}
export function useContract() {
    return useContext(contractContext);
}