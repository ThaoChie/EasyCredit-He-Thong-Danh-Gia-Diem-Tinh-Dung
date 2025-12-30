import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API Login
      const res = await axiosClient.post('/User/login', values);
      
      // Backend trả về: { token: "...", role: "Admin/Customer" }
      const { token, role } = res.data;

      // Lưu vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      message.success('Đăng nhập thành công!');
      
      // Phân luồng chuyển hướng
      if (role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard'); // Khách hàng vào trang dashboard
      }
    } catch (error) {
      message.error('Sai tài khoản hoặc mật khẩu!');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#e6f7ff' }}>
      <Card title="🔐 Đăng nhập EasyCredit" style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="username" rules={[{ required: true, message: 'Nhập username!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Tài khoản" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Nhập password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
          <div style={{ marginTop: 15, textAlign: 'center', fontSize: 14 }}>
            Chưa có tài khoản? <Link to="/register">Đăng ký mới</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;