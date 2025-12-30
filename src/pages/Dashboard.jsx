import React, { useState } from 'react';
import { Layout, Menu, Button, theme } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  LogoutOutlined,
  HomeOutlined,
  CheckCircleOutlined // <-- Nhớ phải có icon này cho menu Duyệt vay
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

// Nhập các trang con vào (Đảm bảo file tồn tại trong thư mục pages)
import CustomerList from './CustomerList';
import ContractList from './ContractList';
import LoanApproval from './LoanApproval'; 

const { Header, Sider, Content } = Layout;

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1'); 
  const navigate = useNavigate();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Hàm quyết định hiển thị nội dung gì
  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return (
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>🏡 Tổng quan hệ thống</h1>
            <p>Xin chào Admin! Chúc một ngày làm việc hiệu quả.</p>
          </div>
        );
      case '2':
        return <CustomerList />; // Bảng khách hàng
      case '3':
        return <ContractList />; // Bảng hợp đồng
      case '4':
        return <LoanApproval />; // <-- Trang Duyệt vay mới thêm
      default:
        return <div>Nội dung không tồn tại</div>;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          onClick={(e) => {
            if (e.key === 'logout') {
              navigate('/');
            } else {
              setSelectedKey(e.key);
            }
          }}
          items={[
            { key: '1', icon: <HomeOutlined />, label: 'Tổng quan' },
            { key: '4', icon: <CheckCircleOutlined />, label: 'Duyệt vay (Mới)' }, // Menu này lên đầu cho dễ thấy
            { key: '2', icon: <UserOutlined />, label: 'Quản lý Khách hàng' },
            { key: '3', icon: <VideoCameraOutlined />, label: 'Quản lý Hợp đồng' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <h3>Hệ thống Quản trị EasyCredit</h3>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'initial' // Giúp bảng dài không bị khuất
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;