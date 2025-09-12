import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import {
    Card, Button,
    Form,
    Input, Upload, InputNumber, message
} from 'antd';
import { uploadToIPFS, uploadJSONToIPFS } from '../../utils/pinata';
import { ethers } from "ethers";
import { useContract } from '../../context/contractContext';
const { TextArea } = Input;


const SellNft: React.FC = () => {
    const [form] = Form.useForm();
    const [fileURL, setFileURL] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);
    const { contract } = useContract();

    // before upload
    const beforeUploadFun = (file: any) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Only JPG/PNG formats are supported');
            return Upload.LIST_IGNORE;
        }
        const isLt500KB = file.size / 1024 / 1024 < 0.5;
        if (!isLt500KB) {
            message.error('Images must be less than 500KB');
            return Upload.LIST_IGNORE;
        }
        return true;

    };

    // upload image to ipfs
    const customRequest = async ({ file, onSuccess, onError, onProgress }: any) => {
        try {
            onProgress({ percent: 0 });
            message.warning("Uploading image.. please dont click anything!")
            // 上传到 IPFS
            const imageResult: any = await uploadToIPFS(file);
            console.log('imageResult', imageResult);
            if (imageResult?.success) {
                onProgress({ percent: 100 });
                onSuccess(imageResult);
                setFileURL(imageResult.pinataURL);
            } else {
                onError(new Error('Upload failed'));
                message.error('Upload failed');
            }
        } catch (error) {
            onError(error);
            message.error('Upload failed');
        }
    };

    // 处理文件列表变化
    const handleFileChange = ({ fileList }: any) => {
        setFileList(fileList);
    };

    // upload metadata to ipfs
    const uploadJSONToIPFSFun = async () => {
        console.log('fileURL', fileURL);

        if (!fileURL) {
            message.error('Please upload image first');
            return;
        }

        const { name, description, price } = form.getFieldsValue();
        const nftJSON = {
            name, description, price, image: fileURL
        }
        try {
            const response = await uploadJSONToIPFS(nftJSON);
            console.log('response', response);
            if (response?.success) {
                return response.pinataURL;
            } else {
                message.error('upload JSON To IPFS failed');
            }
        } catch (error) {
            message.error('upload JSON To IPFS failed');
        }

    };

    // list nft
    const listNFT = async () => {
        if (!contract) {
            console.error('The contract is not connected');
            return;
        }
        try {
            setLoading(true);
            // validate fields
            const formData = await form.validateFields();
            const metadataURL = await uploadJSONToIPFSFun();
            console.log('formData', formData);


            message.warning("Uploading NFT(takes 5 mins).. please dont click anything!")


            console.log('contract', contract);
            const price = ethers.parseEther(form.getFieldValue('price').toString());
            console.log('price', price);

            let listingPrice = await contract.getListPrice()
            listingPrice = listingPrice.toString()
            console.log('listingPrice', listingPrice);

            // create the NFT
            let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
            await transaction.wait()
            resetFormFun()
            message.success("Successfully listed your NFT!");
            window.location.replace("/")
        } catch (errorInfo) {
            console.log('Verification failed:', errorInfo);
            message.error('error');
        } finally {
            setLoading(false);
        }
    };
    const resetFormFun = () => {
        form.resetFields();
        setFileList([]);
        setFileURL(null);
    };
    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Card title="Upload your NFT to the marketplace" style={{ width: 600 }}>
                <Form
                    layout={'vertical'}
                    form={form}
                >
                    <Form.Item label="NFT Name" name="name" rules={[{ required: true }]}>
                        <Input placeholder="Axie#4563" />
                    </Form.Item>
                    <Form.Item label="NFT Description" name="description" rules={[{ required: true }]}>
                        <TextArea rows={4} placeholder="Axie Infinity Collection" />
                    </Form.Item>
                    <Form.Item label="Price (in ETH)" name="price" rules={[{ required: true }]}>
                        <InputNumber
                            placeholder="Axie Infinity Collection"
                            style={{ width: '100%' }}
                            precision={3}
                            min={0.001}
                            max={1000}
                            step={0.001}
                        />

                    </Form.Item>
                    <Form.Item label="Upload Image (<500 KB)" rules={[{ required: true }]}>
                        <Upload
                            listType="picture-card"
                            maxCount={1}
                            fileList={fileList}
                            onChange={handleFileChange}
                            beforeUpload={beforeUploadFun}
                            customRequest={customRequest}
                            showUploadList={{
                                showPreviewIcon: true,
                                showRemoveIcon: true,
                            }}>
                            <button
                                style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                                type="button"
                            >
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Button size="large" className="width100 mrg-top20 " type="primary" loading={loading} onClick={listNFT}>LIST NFT</Button>
                        <Button size="large" className="mrg-top20 width100" type="primary" onClick={resetFormFun}>RESET</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SellNft;