import { Menu } from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import './index.css'

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // 根据当前路径确定选中的菜单项
    const getCurrentKey = () => {
        const path = location.pathname;
        if (path === '/marketplace' || path === '/') return 'marketplace';
        if (path === '/sellnft') return 'sellnft';
        if (path === '/profile') return 'profile';

        // return 'marketplace';
    };

    const items = [
        {
            label: 'Marketplace',
            key: 'marketplace',
        },
        {
            label: 'List My NFT',
            key: 'sellnft',
        },
        {
            label: 'My profile',
            key: 'profile',
        },
    ];

    // 处理菜单点击事件
    const handleMenuClick = ({ key }: { key: string }) => {
        switch (key) {
            case 'marketplace':
                navigate('/marketplace');
                break;
            case 'sellnft':
                navigate('/sellnft');
                break;
            case 'profile':
                navigate('/profile');
                break;

            // default:
            //     navigate('/marketplace');
        }
    };

    return (
        <div className="navbar-container">
            <Menu
                theme="light"
                mode="horizontal"
                selectedKeys={[getCurrentKey()]}
                items={items}
                className="navbar-menu"
                onClick={handleMenuClick}
            />
        </div>
    )
}