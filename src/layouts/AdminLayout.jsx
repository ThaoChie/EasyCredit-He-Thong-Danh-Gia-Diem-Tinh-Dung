import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, theme } from 'antd';
import { 
  DashboardOutlined, UserOutlined, FileTextOutlined, 
  BankOutlined, LogoutOutlined, BellOutlined 
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // Menu items khớp với URL
  const items = [
    { key: '/admin/overview', icon: <DashboardOutlined />, label: 'Tổng quan' },
    { key: '/admin/loans', icon: <FileTextOutlined />, label: 'Quản lý Đơn vay' },
    { key: '/admin/customers', icon: <UserOutlined />, label: 'Khách hàng' },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={250} style={{ background: '#001529' }}>
        <div style={{ height: 64, margin: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            {!collapsed && <span style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>EasyCredit Pro</span>}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          selectedKeys={[location.pathname]} 
          items={items} 
          onClick={(e) => navigate(e.key)} // Chuyển trang khi click
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,0.08)' }}>
          <h3 style={{ margin: 0 }}>Hệ thống Quản trị Tín dụng</h3>
          <Space size="large">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <Dropdown menu={{ items: [{ key: '1', label: 'Đăng xuất', icon: <LogoutOutlined />, onClick: handleLogout }] }}>
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span style={{ fontWeight: 500 }}>Admin User</span>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, overflowY: 'auto' }}>
          {/* Nơi nội dung các trang con sẽ hiện ra */}
          <Outlet /> 
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;