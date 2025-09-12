interface nftType {
  description: string;
  image: string;
  name: string;
  price: string | number;
}
interface NFTMetaType extends nftType {
  tokenId: number | number; // NFT的唯一标识（数字类型）
  owner: string; // 所有者钱包地址（字符串，如"0x..."）
  seller: string; // 卖家钱包地址
  isSold?: boolean; // 是否已售出
}
export type { nftType, NFTMetaType };
