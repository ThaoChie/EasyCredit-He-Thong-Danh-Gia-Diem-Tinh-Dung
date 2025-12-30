import React, { useState, useEffect } from 'react';
import { Form, InputNumber, Button, Card, Select, message, Steps, Result, Input } from 'antd';
import { SolutionOutlined, BankOutlined, SmileOutlined } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const LoanRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [loanResult, setLoanResult] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // 1. Lấy User ID từ Token khi vừa vào trang
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      console.log("Token đã giải mã:", decoded); // In ra để kiểm tra

      // Tìm key chứa ID (Vì .NET tạo key rất dài, ta phải tìm key nào chứa chữ 'nameidentifier')
      const idKey = Object.keys(decoded).find(key => key.includes('nameidentifier'));
      
      // Nếu không tìm thấy key dài, thử tìm key ngắn 'sub' hoặc 'id'
      const id = decoded[idKey] || decoded.nameid || decoded.sub || decoded.Id;

      if (id) {
        setUserId(parseInt(id));
      } else {
        message.error("Lỗi Token: Không tìm thấy ID người dùng!");
      }
    } catch (e) {
      console.error("Lỗi giải mã token:", e);
      navigate('/login');
    }
  }, [navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // --- BƯỚC 1: LƯU/CẬP NHẬT HỒ SƠ TÀI CHÍNH ---
      const profileData = {
        userId: userId,
        monthlyIncome: values.monthlyIncome,
        existingDebt: values.existingDebt,
        employmentStatus: values.employmentStatus,
        hasCollateral: values.hasCollateral === 'true'
      };

      try {
        // Thử tạo mới
        await axiosClient.post('/FinancialProfile', profileData);
      } catch (err) {
        // Nếu lỗi 409 (Conflict - Đã có hồ sơ), chuyển sang Cập nhật (PUT)
        if (err.response && err.response.status === 409) {
          await axiosClient.put(`/FinancialProfile/${userId}`, profileData);
        } else {
          throw err; // Lỗi khác thì ném ra ngoài
        }
      }

      // --- BƯỚC 2: GỬI ĐƠN VAY ---
      const loanRes = await axiosClient.post('/Loan', {
        userId: userId,
        amount: values.amount,
        purpose: values.purpose
      });

      setLoanResult('Pending'); 
      message.success('Hồ sơ đã được gửi đi thẩm định!');

    } catch (error) {
      console.error(error);
      message.error('Lỗi hệ thống! Vui lòng thử lại.');
    }
    setLoading(false);
  };

  // Màn hình kết quả
  if (loanResult) {
    return (
      <Card style={{ maxWidth: 600, margin: '50px auto' }}>
        <Result
          status="info" // Luôn hiện màu xanh dương (Info) vì đang chờ
          title="HỒ SƠ ĐANG CHỜ THẨM ĐỊNH"
          subTitle="Hệ thống đã ghi nhận đơn vay. Admin sẽ xem xét và phản hồi trong thời gian sớm nhất."
          extra={[
            <Button type="primary" key="dashboard" onClick={() => navigate('/dashboard')}>
              Về Dashboard theo dõi
            </Button>
          ]}
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: '40px 0', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card title="💸 Đăng ký vay vốn" style={{ maxWidth: 700, margin: '0 auto' }}>
        <Steps items={[{ title: 'Đăng nhập', status: 'finish', icon: <SmileOutlined /> }, { title: 'Điền hồ sơ', status: 'process', icon: <SolutionOutlined /> }, { title: 'Nhận kết quả', status: 'wait', icon: <BankOutlined /> }]} style={{ marginBottom: 30 }} />
        
        <Form layout="vertical" onFinish={onFinish}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Form.Item label="Số tiền vay (VNĐ)" name="amount" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
             <Form.Item label="Mục đích vay" name="purpose" rules={[{ required: true }]}>
               <Input placeholder="Mua xe, kinh doanh..." />
            </Form.Item>
          </div>

          <h4>📋 Thông tin tài chính (Để chấm điểm)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Form.Item label="Thu nhập hàng tháng" name="monthlyIncome" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Tổng nợ hiện tại" name="existingDebt" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label="Nghề nghiệp" name="employmentStatus" initialValue="Employed">
              <Select><Option value="Employed">Đi làm công ty</Option><Option value="SelfEmployed">Tự do</Option><Option value="Unemployed">Thất nghiệp</Option></Select>
            </Form.Item>
            <Form.Item label="Tài sản đảm bảo" name="hasCollateral" initialValue="false">
              <Select><Option value="true">Có nhà/xe</Option><Option value="false">Không có</Option></Select>
            </Form.Item>
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={loading}>GỬI HỒ SƠ THẨM ĐỊNH</Button>
        </Form>
      </Card>
    </div>
  );
};

export default LoanRegistration;