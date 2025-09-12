// upload image to ipfs
export const uploadToIPFS = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        // 动态生成元数据
        const metadata = createPinataMetadata(file);
        formData.append('pinataMetadata', metadata);

        // 动态生成选项
        const pinataOptions = createPinataOptions();
        formData.append('pinataOptions', pinataOptions);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
            },
            body: formData
        });
        console.log('response', response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        return {
            success: true,
            cid: result.IpfsHash,
            pinataURL: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
            data: result
        };
    } catch (error) {
        console.error('Pinata upload error:', error);
        return {
            success: false,
            error: error
        };
    }
};

// 上传 JSON 元数据到 IPFS
// src/utils/pinata.ts
export const uploadJSONToIPFS = async (metadata: any) => {
    try {
        const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // 添加这个头
                'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
            },
            body: JSON.stringify(metadata) // 确保转换为 JSON 字符串
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            cid: result.IpfsHash,
            pinataURL: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
            data: result
        };
    } catch (error) {
        console.error('Pinata metadata upload error:', error);
        return {
            success: false,
            error: error
        };
    }
};

// 动态生成 Pinata 元数据
const createPinataMetadata = (file: File,) => {
    return JSON.stringify({
        name: file.name,
        keyvalues: {
            uploadTime: new Date().toISOString(),
            fileType: file.type,
            fileSize: file.size,
            originalName: file.name
        }
    });
};

// 动态生成 Pinata 选项
const createPinataOptions = () => {
    return JSON.stringify({
        cidVersion: 0,
        customPinPolicy: {
            regions: [
                {
                    id: 'FRA1',
                    desiredReplicationCount: 1
                },
                {
                    id: 'NYC1',
                    desiredReplicationCount: 2
                }
            ]
        }
    });
};

export const GetIpfsUrlFromPinata = (pinataUrl: string) => {
    const IPFSUrl = pinataUrl.split("/");
    const lastIndex = IPFSUrl.length;
    const _IPFSUrl = "https://ipfs.io/ipfs/" + IPFSUrl[lastIndex - 1];
    return _IPFSUrl;
};