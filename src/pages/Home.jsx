import React, { useEffect, useState } from 'react';
import { Button, Card, Row, Col, Typography, Space } from 'antd';
import { RocketOutlined, SafetyCertificateOutlined, ThunderboltOutlined, LoginOutlined, UserAddOutlined, DashboardOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Kiểm tra trạng thái đăng nhập khi vào trang
  useEffect(() => {
      // Thay vì kiểm tra token để "nhớ" đăng nhập
      // Ta sẽ XÓA SẠCH token để đưa về trạng thái chưa đăng nhập
      localStorage.clear(); 
      
      // Cập nhật trạng thái giao diện về "Khách"
      setIsLoggedIn(false);
      setUserRole(null);
    }, []);

  // Xử lý khi bấm nút "Vào Dashboard"
  const handleDashboardClick = () => {
    if (userRole === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // Xử lý đăng xuất ngay tại Home
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login'); // Hoặc reload trang
  };

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Header / Menu */}
      <div style={{ background: '#001529', padding: '15px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
           <h2 style={{ color: '#fff', margin: 0 }}>🏦 EasyCredit</h2>
        </div>
        
        <div>
          {isLoggedIn ? (
            <Space>
              <Button type="primary" icon={<DashboardOutlined />} onClick={handleDashboardClick} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                Vào Dashboard {userRole === 'Admin' ? 'Admin' : ''}
              </Button>
              <Button ghost icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
            </Space>
          ) : (
            <Space>
              <Button type="text" icon={<LoginOutlined />} style={{ color: '#fff' }} onClick={() => navigate('/login')}>
                Đăng nhập
              </Button>
              <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/register')}>
                Đăng ký tài khoản
              </Button>
            </Space>
          )}
        </div>
      </div>

      {/* 2. Hero Section (Banner chính) */}
      <div style={{ flex: 1, textAlign: 'center', padding: '120px 20px', background: 'linear-gradient(135deg, #0050b3 0%, #1890ff 100%)', color: 'white' }}>
        <Title style={{ color: 'white', fontSize: '64px', marginBottom: 20, textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
          Tài chính Vững chắc - Tương lai Rạng ngời
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '20px', maxWidth: 800, margin: '0 auto 50px', lineHeight: 1.6 }}>
          Hệ thống duyệt vay tự động bằng AI tiên tiến nhất Việt Nam.<br/>
          Không thế chấp. Không phí ẩn. Giải ngân trong 5 phút.
        </Paragraph>
        
        <Space size="large">
          <Button 
            type="primary" 
            size="large" 
            shape="round" 
            icon={<ThunderboltOutlined />} 
            style={{ 
              height: '64px', fontSize: '24px', padding: '0 60px', 
              background: '#faad14', borderColor: '#faad14', color: '#000',
              boxShadow: '0 10px 20px rgba(250, 173, 20, 0.4)'
            }}
            onClick={() => navigate(isLoggedIn ? '/apply' : '/login')}
          >
            ĐĂNG KÝ VAY NGAY
          </Button>
        </Space>
      </div>

      {/* 3. Features Section (Tại sao chọn chúng tôi) */}
      <div style={{ padding: '80px 50px', background: '#fff' }}>
        <Row gutter={[48, 48]} justify="center">
          <Col xs={24} md={8}>
            <Card hoverable style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: 20 }}>
              <div style={{ background: '#e6f7ff', width: 100, height: 100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <RocketOutlined style={{ fontSize: '50px', color: '#1890ff' }} />
              </div>
              <Title level={3}>Duyệt siêu tốc</Title>
              <Paragraph style={{ fontSize: 16, color: '#666' }}>
                Hệ thống AI phân tích hồ sơ và trả kết quả chỉ trong tích tắc. Tiền về tài khoản ngay lập tức.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: 20 }}>
              <div style={{ background: '#f6ffed', width: 100, height: 100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '50px', color: '#52c41a' }} />
              </div>
              <Title level={3}>Bảo mật tuyệt đối</Title>
              <Paragraph style={{ fontSize: 16, color: '#666' }}>
                Dữ liệu khách hàng được mã hóa 256-bit chuẩn ngân hàng và cam kết không chia sẻ với bên thứ ba.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card hoverable style={{ textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', borderRadius: 20 }}>
              <div style={{ background: '#fff7e6', width: 100, height: 100, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <ThunderboltOutlined style={{ fontSize: '50px', color: '#faad14' }} />
              </div>
              <Title level={3}>Lãi suất minh bạch</Title>
              <Paragraph style={{ fontSize: 16, color: '#666' }}>
                Chỉ từ 1.5%/tháng cố định. Mọi khoản phí đều được công khai rõ ràng trước khi bạn ký hợp đồng.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 4. Footer */}
      <div style={{ textAlign: 'center', padding: '40px', background: '#001529', color: 'rgba(255,255,255,0.45)' }}>
        EasyCredit System ©2025 - Sản phẩm demo học tập
      </div>
    </div>
  );
};

export default Home;