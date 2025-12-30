import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Steps, Button, Tag, Table, Slider, Alert, message, 
  Space, Popconfirm, Modal, Checkbox, Avatar, Typography, Badge, Statistic, Spin, Empty 
} from 'antd';
import { 
  CheckCircleOutlined, FileTextOutlined, SafetyCertificateOutlined, 
  CalculatorOutlined, ReloadOutlined, PlusOutlined, LogoutOutlined, 
  HomeOutlined, AuditOutlined, BellOutlined, WalletOutlined, RiseOutlined, 
  UserOutlined, BankOutlined 
} from '@ant-design/icons';
// Thử import an toàn, nếu lỗi thì trang vẫn chạy được
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import axiosClient from '../api/axiosClient';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Khách hàng");
  
  // State ký hợp đồng
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLoanId, setCurrentLoanId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // State máy tính lãi suất
  const [calcAmount, setCalcAmount] = useState(20000000);
  const [calcMonth, setCalcMonth] = useState(12);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/login');   
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Nếu không có token -> Về login ngay
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Giải mã Token an toàn
      try {
        const decoded = jwtDecode(token);
        // Lấy tên từ nhiều trường khác nhau tùy cấu hình Token
        const name = decoded.unique_name || decoded.name || decoded.sub || "Khách hàng";
        setUserName(name);
      } catch (e) {
        console.warn("Token lỗi:", e);
      }

      const loanRes = await axiosClient.get('/Loan'); 
      
      // Kiểm tra kỹ dữ liệu trả về có phải mảng không
      if (loanRes.data && Array.isArray(loanRes.data)) {
        const myLoans = loanRes.data.sort((a, b) => (b.id || 0) - (a.id || 0)); 
        setLoans(myLoans);
      } else {
        setLoans([]); 
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      // Không crash, chỉ hiện mảng rỗng
      setLoans([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- XỬ LÝ HỢP ĐỒNG ---
  const handleOpenContract = async (id) => {
    try {
        message.loading({ content: 'Đang tải...', key: 'pdf' });
        const res = await axiosClient.get(`/Loan/${id}/contract`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setPdfUrl(url);
        setCurrentLoanId(id);
        setAgreed(false);
        setIsModalOpen(true);
        message.success({ content: 'Xong!', key: 'pdf' });
    } catch (error) {
        message.error({ content: 'Lỗi tải file!', key: 'pdf' });
    }
  };

  const handleSignContract = async () => {
      try {
          await axiosClient.post(`/Loan/${currentLoanId}/accept`);
          message.success("Thành công!");
          setIsModalOpen(false);
          fetchData();
      } catch (error) {
          message.error("Lỗi hệ thống.");
      }
  };

  // --- TÍNH TOÁN AN TOÀN ---
  const monthlyPayment = Math.round((calcAmount / calcMonth) + (calcAmount * 0.015));
  
  // Lấy đơn mới nhất (Kiểm tra null kỹ càng)
  const latestLoan = (Array.isArray(loans) && loans.length > 0) ? loans[0] : null;
  
  // Điểm tín dụng (Mặc định 0 nếu không có)
  const creditScore = latestLoan?.creditScore?.totalScore || 0;
  
  const scoreColor = creditScore >= 70 ? '#52c41a' : creditScore >= 40 ? '#faad14' : '#ff4d4f';
  const creditData = [
    { name: 'Score', value: creditScore, color: scoreColor },
    { name: 'Rest', value: 100 - creditScore, color: '#f0f0f0' }
  ];

  // Hàm render Badge (Tránh crash nếu status null)
  const renderStatusTag = (status) => {
    if (!status) return <Tag>Chưa rõ</Tag>;
    let color = status==='Disbursed'?'#52c41a': status==='Approved'?'#1890ff': status==='Pending'?'#faad14':'#ff4d4f';
    let text = status==='Disbursed'?'ĐÃ GIẢI NGÂN': status==='Approved'?'CHỜ KÝ HĐ': status==='Pending'?'CHỜ DUYỆT':'TỪ CHỐI';
    return <Tag color={color} style={{ fontWeight: 'bold' }}>{text}</Tag>;
  };

  // Logic đếm số lượng Badge thông báo
  const approvedCount = Array.isArray(loans) ? loans.filter(l => l.status === 'Approved').length : 0;

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: 40 }}>
      
      {/* 1. TOP BAR */}
      <div style={{ background: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#1890ff', borderRadius: 8, padding: 6 }}>
                <BankOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <Title level={4} style={{ margin: 0, color: '#001529' }}>EasyCredit</Title>
        </div>
        <Space size="large">
            <Button type="text" icon={<HomeOutlined />} onClick={() => navigate('/')}>Trang chủ</Button>
            <Badge count={approvedCount} offset={[5, 0]}>
                 <Button shape="circle" icon={<BellOutlined />} />
            </Badge>
            <Popconfirm title="Đăng xuất?" onConfirm={handleLogout}>
                <Avatar style={{ backgroundColor: '#f56a00', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Popconfirm>
        </Space>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        
        {/* 2. BANNER */}
        <div style={{ 
            background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)', 
            borderRadius: 16, padding: '30px', color: '#fff', marginBottom: 30,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 20px rgba(0, 21, 41, 0.15)'
        }}>
            <div>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Xin chào,</Text>
                <Title level={2} style={{ color: '#fff', margin: '5px 0' }}>{userName}</Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Quản lý khoản vay thông minh & tiện lợi.</Text>
            </div>
            <Space>
                <Button size="large" icon={<ReloadOutlined />} onClick={fetchData} loading={loading} ghost>Cập nhật</Button>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => navigate('/apply')} style={{ background: '#faad14', borderColor: '#faad14', color: '#000', fontWeight: 'bold' }}>
                    Vay ngay
                </Button>
            </Space>
        </div>

        <Row gutter={[24, 24]}>
            {/* CỘT TRÁI */}
            <Col xs={24} lg={16}>
                {/* 3. TIẾN ĐỘ */}
                <Card title={<span><SafetyCertificateOutlined style={{color: '#1890ff'}}/> Hồ sơ gần nhất</span>} bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
                    {latestLoan ? (
                        <>
                            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <Text type="secondary">Mã: </Text> <Text strong>#{latestLoan.id}</Text>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                        {latestLoan.amount ? latestLoan.amount.toLocaleString() : '0'} VNĐ
                                    </div>
                                </div>
                                {renderStatusTag(latestLoan.status)}
                            </div>
                            <Steps
                                current={
                                    latestLoan.status === 'Pending' ? 1 : 
                                    latestLoan.status === 'Approved' ? 2 : 
                                    latestLoan.status === 'Disbursed' ? 3 : 2
                                }
                                status={latestLoan.status === 'Rejected' ? 'error' : 'process'}
                                size="small"
                                items={[
                                    { title: 'Gửi đơn', icon: <FileTextOutlined /> },
                                    { title: 'Thẩm định', icon: <AuditOutlined /> },
                                    { title: 'Ký HĐ', icon: <CheckCircleOutlined /> },
                                    { title: 'Giải ngân', icon: <WalletOutlined /> },
                                ]}
                            />
                            {latestLoan.status === 'Approved' && (
                                <Alert
                                    message="Hồ sơ được duyệt!"
                                    description={
                                        <Button type="primary" block style={{ marginTop: 10, background: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleOpenContract(latestLoan.id)}>
                                            📝 KÝ HỢP ĐỒNG NGAY
                                        </Button>
                                    }
                                    type="success" showIcon style={{ marginTop: 20 }}
                                />
                            )}
                        </>
                    ) : (
                        <Empty description="Chưa có khoản vay nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Card>

                {/* 4. LỊCH SỬ */}
                <Card title="📜 Lịch sử" bordered={false} style={{ borderRadius: 12 }}>
                    <Table 
                        dataSource={loans} 
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 5 }}
                        columns={[
                            { title: 'Ngày', dataIndex: 'createdAt', render: t => <Text type="secondary">{t ? new Date(t).toLocaleDateString('vi-VN') : '-'}</Text> },
                            { title: 'Số tiền', dataIndex: 'amount', render: v => <b>{v ? v.toLocaleString() : 0} đ</b> },
                            { title: 'Trạng thái', dataIndex: 'status', render: s => renderStatusTag(s) },
                            { title: '', align: 'right', render: (_, r) => r.status === 'Approved' && <Button size="small" type="link" onClick={() => handleOpenContract(r.id)}>Ký HĐ</Button> }
                        ]}
                    />
                </Card>
            </Col>

            {/* CỘT PHẢI */}
            <Col xs={24} lg={8}>
                {/* 5. BIỂU ĐỒ ĐIỂM */}
                <Card bordered={false} style={{ borderRadius: 12, marginBottom: 24, textAlign: 'center' }}>
                    <Statistic title="Điểm tín dụng" value={creditScore} valueStyle={{ color: scoreColor, fontSize: 36, fontWeight: 'bold' }} prefix={<RiseOutlined />} />
                    <div style={{ height: 180, position: 'relative', marginTop: -20 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={creditData} cx="50%" cy="70%" startAngle={180} endAngle={0} innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value">
                                    {creditData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', bottom: '35%', left: 0, right: 0, color: '#8c8c8c' }}>
                            {creditScore >= 70 ? 'Rất tốt' : creditScore >= 40 ? 'Trung bình' : 'Yếu'}
                        </div>
                    </div>
                </Card>

                {/* 6. MÁY TÍNH */}
                <Card title={<span><CalculatorOutlined /> Tính lãi suất</span>} bordered={false} style={{ borderRadius: 12, background: '#f9f9f9' }}>
                    <div style={{ marginBottom: 15 }}>
                        <Text>Vay: <b>{calcAmount.toLocaleString()} đ</b></Text>
                        <Slider min={5000000} max={100000000} step={1000000} value={calcAmount} onChange={setCalcAmount} />
                    </div>
                    <div style={{ marginBottom: 15 }}>
                        <Text>Hạn: <b>{calcMonth} tháng</b></Text>
                        <Slider min={3} max={36} value={calcMonth} onChange={setCalcMonth} />
                    </div>
                    <Row justify="space-between" align="middle" style={{ marginTop: 20 }}>
                        <Text type="secondary">Trả/tháng:</Text>
                        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>{monthlyPayment.toLocaleString()}</Title>
                    </Row>
                </Card>
            </Col>
        </Row>
      </div>

      {/* --- MODAL --- */}
      <Modal 
        title="📝 KÝ HỢP ĐỒNG"
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        width={800}
        centered
        footer={[
            <Button key="back" onClick={() => setIsModalOpen(false)}>Đóng</Button>,
            <Button key="submit" type="primary" disabled={!agreed} onClick={handleSignContract} style={{background: agreed ? '#52c41a' : '#d9d9d9'}} size="large">
                XÁC NHẬN KÝ
            </Button>
        ]}
      >
          <div style={{height: '500px', background: '#f0f2f5', border: '1px solid #d9d9d9', borderRadius: 4, marginBottom: 20, overflow: 'hidden'}}>
            {pdfUrl ? (
                <iframe src={pdfUrl} width="100%" height="100%" style={{border: 'none'}} title="PDF"></iframe>
            ) : <Spin style={{marginTop: 50, width: '100%'}} tip="Đang tải..." />}
          </div>
          <Alert message={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)}>Tôi đồng ý với các điều khoản.</Checkbox>} type="info" />
      </Modal>

    </div>
  );
};

export default CustomerDashboard;