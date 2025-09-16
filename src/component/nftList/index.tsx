import { Link } from "react-router-dom";
import { Card } from "antd";
import type { NFTMetaType } from "../../types";
export default function NftList({ data }: { data: NFTMetaType[] }) {
  return (
    <div className="flexBox mrg-top20">
      {data.map((item, index) => {
        return (
          <div
            key={index}
            style={{ width: "20%", display: "flex", alignItems: "center" }}
          >
            <Link to={"/nftPage/" + item.tokenId}>
              <Card style={{ width: "96%", marginBottom: "20px" }}>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: "100%", height: "100%" }}
                />
                <div
                  className="mrg-top20"
                  style={{ fontSize: "22px", fontWeight: "bold" }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600 }}>
                  Floor price: <span>{item.price}</span> ETH
                </div>
                <div>{item.description}</div>
              </Card>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
