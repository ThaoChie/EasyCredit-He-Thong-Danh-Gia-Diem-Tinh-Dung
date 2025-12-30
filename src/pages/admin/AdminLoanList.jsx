import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Modal, message, Tabs, Tooltip, Space, Card } from 'antd';
import { PrinterOutlined, EditOutlined, CheckCircleOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';

const AdminLoanList = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/Loan');
      setLoans(res.data);
    } catch (error) {
      message.error("Không thể tải danh sách đơn vay");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // --- LOGIC XỬ LÝ ---
  const handleUpdateStatus = (id) => {
    Modal.confirm({
      title: 'Xử lý hồ sơ vay',
      content: 'Bạn muốn quyết định thế nào với hồ sơ này?',
      okText: 'Đóng',
      footer: (_, { CancelBtn }) => (
        <>
          <CancelBtn />
          <Button type="primary" style={{ background: '#52c41a', borderColor: '#52c41a' }} onClick={() => callApi(id, 'Approved')}>
            ✅ Duyệt
          </Button>
          <Button type="primary" danger onClick={() => callApi(id, 'Rejected')}>
            ❌ Từ chối
          </Button>
          <Button onClick={() => callApi(id, 'Review')}>
            ⚠️ Xem xét
          </Button>
        </>
      ),
    });
  };

  const callApi = async (id, status) => {
    try {
      await axiosClient.put(`/Loan/${id}/status`, { status });
      message.success('Đã cập nhật trạng thái!');
      Modal.destroyAll();
      fetchLoans();
    } catch (e) {
      message.error('Lỗi khi cập nhật!');
    }
  };

  const handlePrint = async (id) => {
    try {
      message.loading({ content: 'Đang tạo PDF...', key: 'pdf' });
      const res = await axiosClient.get(`/Loan/${id}/contract`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a'); link.href = url; link.setAttribute('download', `HD_${id}.pdf`);
      document.body.appendChild(link); link.click(); link.remove();
      message.success({ content: 'Tải xong!', key: 'pdf' });
    } catch (e) {
      message.error({ content: 'Lỗi tải file', key: 'pdf' });
    }
  };

  // --- CẤU HÌNH CỘT ---
  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60, align: 'center', sorter: (a, b) => a.id - b.id },
    { title: 'Khách hàng', render: (_, r) => <b>{r.user?.fullName}</b> },
    { title: 'Số tiền', dataIndex: 'amount', render: v => <span style={{color: '#1890ff', fontWeight: 500}}>{v.toLocaleString()} ₫</span>, sorter: (a, b) => a.amount - b.amount },
    { title: 'Mục đích', dataIndex: 'purpose', ellipsis: true },
    { title: 'Điểm', align: 'center', render: (_, r) => {
        const s = r.creditScore?.totalScore || 0;
        return <Tag color={s>=70?'success':s>=40?'processing':'error'}>{s}</Tag>
    }},
    { title: 'Trạng thái', dataIndex: 'status', align: 'center', filters: [
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
        { text: 'Pending', value: 'Pending' },
      ],
      onFilter: (value, record) => record.status === value,
      render: s => {
        let color = s === 'Approved' ? 'success' : s === 'Rejected' ? 'error' : 'warning';
        return <Tag color={color}>{s.toUpperCase()}</Tag>
    }},
    {
      title: 'Hành động',
      align: 'center',
      render: (_, r) => (
        <Space>
          {r.status === 'Approved' && (
            <Tooltip title="In Hợp đồng">
              <Button size="small" icon={<PrinterOutlined />} onClick={() => handlePrint(r.id)} />
            </Tooltip>
          )}
          <Tooltip title="Xét duyệt / Cập nhật">
            <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => handleUpdateStatus(r.id)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // --- GIAO DIỆN TAB ---
  const items = [
    {
      key: '1',
      label: <span><FileTextOutlined /> Tất cả đơn vay</span>,
      children: <Table dataSource={loans} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />
    },
    {
      key: '2',
      label: <span><CheckCircleOutlined /> Cần xử lý <Tag color="error" style={{marginLeft: 5}}>{loans.filter(l => l.status === 'Pending').length}</Tag></span>,
      children: <Table dataSource={loans.filter(l => l.status === 'Pending')} columns={columns} rowKey="id" loading={loading} />
    }
  ];

  return (
    <Card bordered={false} title="Quản lý Hồ sơ Khoản vay" extra={<Button icon={<ReloadOutlined/>} onClick={fetchLoans}>Làm mới</Button>}>
      <Tabs defaultActiveKey="1" items={items} />
    </Card>
  );
};

export default AdminLoanList;