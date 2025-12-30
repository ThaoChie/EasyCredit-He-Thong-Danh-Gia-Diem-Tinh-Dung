import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Descriptions, message, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';

function LoanApproval() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Dữ liệu giả: Các đơn vay đang chờ duyệt
  const [data, setData] = useState([
    { key: '1', customer: 'Nguyễn Văn A', amount: 50000000, income: 15000000, debt: 0, score: 85, status: 'Pending' },
    { key: '2', customer: 'Trần Thị B', amount: 200000000, income: 10000000, debt: 5000000, score: 60, status: 'Pending' },
    { key: '3', customer: 'Lê C', amount: 30000000, income: 20000000, debt: 0, score: 95, status: 'Pending' },
  ]);

  // Hàm xử lý khi bấm Duyệt hoặc Từ chối
  const handleApproval = (decision) => {
    // Xóa đơn đó khỏi danh sách (Giả lập là đã xử lý xong)
    const newData = data.filter(item => item.key !== selectedLoan.key);
    setData(newData);
    
    setIsModalOpen(false); // Đóng bảng chi tiết
    
    if (decision === 'approve') {
      message.success(`Đã DUYỆT khoản vay của ${selectedLoan.customer}!`);
    } else {
      message.warning(`Đã TỪ CHỐI khoản vay của ${selectedLoan.customer}!`);
    }
  };

  // Cấu hình cột bảng
  const columns = [
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer', render: text => <b>{text}</b> },
    { title: 'Số tiền vay', dataIndex: 'amount', key: 'amount', render: val => `${val.toLocaleString()} đ` },
    { 
      title: 'Điểm tín dụng', 
      dataIndex: 'score', 
      key: 'score',
      render: (score) => {
        let color = score > 80 ? 'green' : (score > 50 ? 'orange' : 'red');
        return <Tag color={color}>{score} / 120</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />} 
          onClick={() => {
            setSelectedLoan(record);
            setIsModalOpen(true);
          }}
        >
          Xem hồ sơ
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>📋 Danh sách chờ phê duyệt</h2>
      <Table columns={columns} dataSource={data} />

      {/* Modal chi tiết hồ sơ để Admin soi */}
      <Modal 
        title="Thẩm định hồ sơ vay" 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={() => handleApproval('reject')}>
            Từ chối
          </Button>,
          <Button key="approve" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApproval('approve')}>
            Phê duyệt ngay
          </Button>,
        ]}
      >
        {selectedLoan && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Họ tên">{selectedLoan.customer}</Descriptions.Item>
            <Descriptions.Item label="Số tiền muốn vay">{selectedLoan.amount.toLocaleString()} VND</Descriptions.Item>
            <Descriptions.Item label="Thu nhập hàng tháng">{selectedLoan.income.toLocaleString()} VND</Descriptions.Item>
            <Descriptions.Item label="Nợ hiện tại">{selectedLoan.debt.toLocaleString()} VND</Descriptions.Item>
            <Descriptions.Item label="Điểm tín dụng">
              <b style={{ color: selectedLoan.score > 80 ? 'green' : 'red' }}>{selectedLoan.score}/120</b>
            </Descriptions.Item>
            <Descriptions.Item label="Đánh giá hệ thống">
              {selectedLoan.score > 80 ? '✅ Khách uy tín, nên duyệt.' : '⚠️ Rủi ro cao, cân nhắc kỹ!'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default LoanApproval;