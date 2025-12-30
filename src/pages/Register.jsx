import React from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, SmileOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const Register = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      await axiosClient.post('/User/register', {
        username: values.username,
        password: values.password,
        fullName: values.fullName,
        role: 'Customer' // Mặc định là khách hàng
      });
      message.success('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error) {
      message.error(error.response?.data || 'Đăng ký thất bại!');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card title="Đăng ký tài khoản" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input prefix={<SmileOutlined />} placeholder="Ví dụ: Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Đăng ký ngay</Button>
          <div style={{ marginTop: 10, textAlign: 'center' }}>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;