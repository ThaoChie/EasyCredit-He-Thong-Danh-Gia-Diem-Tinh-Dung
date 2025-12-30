import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import { DollarCircleOutlined, BellOutlined, UserOutlined, RiseOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axiosClient from '../../api/axiosClient';

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMoney: 0,
    pendingCount: 0,
    userCount: 0,
    approvedCount: 0,
    totalLoans: 0
  });
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [loansRes, usersRes] = await Promise.all([
          axiosClient.get('/Loan'),
          axiosClient.get('/User')
        ]);

        const loans = loansRes.data;
        const users = usersRes.data;

        // 1. Tính toán số liệu thống kê
        const totalMoney = loans.reduce((acc, curr) => curr.status === 'Approved' ? acc + curr.amount : acc, 0);
        const pendingCount = loans.filter(l => l.status === 'Pending').length;
        const approvedCount = loans.filter(l => l.status === 'Approved').length;
        const rejectedCount = loans.filter(l => l.status === 'Rejected').length;

        setStats({
          totalMoney,
          pendingCount,
          userCount: users.length,
          approvedCount,
          totalLoans: loans.length
        });

        // 2. Dữ liệu biểu đồ Tròn
        setPieData([
          { name: 'Đã duyệt', value: approvedCount, color: '#52c41a' },
          { name: 'Từ chối', value: rejectedCount, color: '#ff4d4f' },
          { name: 'Chờ xử lý', value: pendingCount, color: '#faad14' },
        ]);

        // 3. Dữ liệu biểu đồ Cột (Top 5 đơn mới nhất)
        const recentLoans = loans.slice(0, 5).map(l => ({
          name: l.user?.fullName?.split(' ').pop() || 'N/A',
          amount: l.amount,
          score: l.creditScore?.totalScore || 0
        }));
        setChartData(recentLoans);

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Component con: Thẻ thống kê Gradient
  const StatCard = ({ title, value, icon, color1, color2, suffix }) => (
    <Card bordered={false} style={{ 
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`, 
        borderRadius: 16, color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
    }}>
      <Statistic 
        title={<span style={{color: 'rgba(255,255,255,0.9)', fontSize: 14}}>{title}</span>} 
        value={value} 
        valueStyle={{color: '#fff', fontWeight: 'bold', fontSize: 26}}
        prefix={icon}
        suffix={suffix}
      />
    </Card>
  );

  if (loading) return <div style={{textAlign: 'center', marginTop: 50}}><Spin size="large"/></div>;

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Tổng quan hệ thống</h2>
      
      {/* 1. SECTION THỐNG KÊ */}
      <Row gutter={[24, 24]} style={{ marginBottom: 30 }}>
          <Col xs={24} sm={12} lg={6}>
              <StatCard title="Tổng doanh số" value={stats.totalMoney} icon={<DollarCircleOutlined />} color1="#11998e" color2="#38ef7d" suffix="₫" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
              <StatCard title="Hồ sơ chờ duyệt" value={stats.pendingCount} icon={<BellOutlined />} color1="#ff9966" color2="#ff5e62" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
              <StatCard title="Tổng người dùng" value={stats.userCount} icon={<UserOutlined />} color1="#4facfe" color2="#00f2fe" />
          </Col>
          <Col xs={24} sm={12} lg={6}>
              <StatCard title="Tỷ lệ duyệt" value={stats.totalLoans > 0 ? Math.round((stats.approvedCount / stats.totalLoans) * 100) : 0} icon={<RiseOutlined />} color1="#8E2DE2" color2="#4A00E0" suffix="%" />
          </Col>
      </Row>

      {/* 2. SECTION BIỂU ĐỒ */}
      <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
              <Card title="📈 Xu hướng vay gần đây" bordered={false} style={{ borderRadius: 12 }}>
                  <div style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <RechartsTooltip />
                              <Legend />
                              <Bar name="Số tiền vay" dataKey="amount" fill="#1890ff" radius={[4, 4, 0, 0]} />
                              <Bar name="Điểm tín dụng" dataKey="score" fill="#52c41a" radius={[4, 4, 0, 0]} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </Col>
          <Col xs={24} lg={8}>
              <Card title="📊 Tỷ lệ Phê duyệt" bordered={false} style={{ borderRadius: 12 }}>
                  <div style={{ height: 320 }}>
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                  {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                              </Pie>
                              <RechartsTooltip />
                              <Legend verticalAlign="bottom" />
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
              </Card>
          </Col>
      </Row>
    </div>
  );
};

export default AdminOverview;