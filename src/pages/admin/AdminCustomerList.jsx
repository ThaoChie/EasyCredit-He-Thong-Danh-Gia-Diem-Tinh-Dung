import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, Avatar } from 'antd';
import { UserOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const AdminCustomerList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/User');
      setUsers(res.data);
    } catch (error) {
      console.error("Lỗi tải user");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center' },
    { title: 'Avatar', align: 'center', render: () => <Avatar icon={<UserOutlined />} style={{backgroundColor: '#87d068'}} /> },
    { title: 'Tên đăng nhập', dataIndex: 'username', render: t => <b>{t}</b> },
    { title: 'Họ và tên', dataIndex: 'fullName', render: t => t || <i style={{color:'#ccc'}}>Chưa cập nhật</i> },
    { title: 'Vai trò', dataIndex: 'role', align: 'center', render: r => (
      <Tag color={r === 'Admin' ? 'gold' : 'blue'}>
        {r === 'Admin' ? 'QUẢN TRỊ VIÊN' : 'KHÁCH HÀNG'}
      </Tag>
    )},
  ];

  return (
    <Card bordered={false} title="Danh sách Khách hàng hệ thống" extra={<Button icon={<ReloadOutlined/>} onClick={fetchUsers}>Làm mới</Button>}>
      <Table 
        dataSource={users} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default AdminCustomerList;