import React from 'react';
import { Table, Tag, Space, Button } from 'antd';

// 1. Cấu hình các cột hiển thị
const columns = [
  {
    title: 'Mã Hợp Đồng',
    dataIndex: 'contractCode',
    key: 'contractCode',
    render: (text) => <b>{text}</b>, // In đậm mã cho đẹp
  },
  {
    title: 'Khách hàng',
    dataIndex: 'customerName',
    key: 'customerName',
  },
  {
    title: 'Số tiền vay',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Lãi suất',
    dataIndex: 'interestRate',
    key: 'interestRate',
  },
  {
    title: 'Ngày giải ngân',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: 'Trạng thái',
    key: 'status',
    dataIndex: 'status',
    render: (status) => {
      // Logic chọn màu: Quá hạn thì đỏ, Đang vay thì xanh lá, Xong thì xanh dương
      let color = 'green';
      if (status === 'Quá hạn') color = 'red';
      if (status === 'Đã tất toán') color = 'blue';
      
      return (
        <Tag color={color} key={status}>
          {status.toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: 'Thao tác',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <Button type="primary" size="small" ghost>Xem chi tiết</Button>
      </Space>
    ),
  },
];

// 2. Dữ liệu giả định
const data = [
  {
    key: '1',
    contractCode: 'HĐ-2024-001',
    customerName: 'Nguyễn Văn An',
    amount: '50.000.000 đ',
    interestRate: '12%/năm',
    startDate: '01/01/2024',
    status: 'Đang vay',
  },
  {
    key: '2',
    contractCode: 'HĐ-2024-002',
    customerName: 'Trần Thị Bích',
    amount: '20.000.000 đ',
    interestRate: '15%/năm',
    startDate: '15/02/2023',
    status: 'Quá hạn',
  },
  {
    key: '3',
    contractCode: 'HĐ-2023-999',
    customerName: 'Lê Văn Cường',
    amount: '100.000.000 đ',
    interestRate: '10%/năm',
    startDate: '10/03/2023',
    status: 'Đã tất toán',
  },
];

function ContractList() {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>📂 Quản lý Hợp đồng Tín dụng</h2>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}

export default ContractList;