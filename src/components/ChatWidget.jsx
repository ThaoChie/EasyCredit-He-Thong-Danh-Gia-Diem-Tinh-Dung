import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Input, Avatar, FloatButton, Spin } from 'antd';
import { MessageOutlined, SendOutlined, CloseOutlined, RobotOutlined, ThunderboltFilled } from '@ant-design/icons';
import axiosClient from '../api/axiosClient';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là AI EasyCredit. Bạn muốn tôi tư vấn gói vay phù hợp không? (Gõ 'Có' để bắt đầu)", sender: 'bot' }
  ]);
  
  // --- STATE MACHINE (QUẢN LÝ TRẠNG THÁI HỘI THOẠI) ---
  // mode: 'normal' (chat thường) | 'consulting' (đang tư vấn)
  const [chatMode, setChatMode] = useState('normal'); 
  const [step, setStep] = useState(0); // Bước: 0=Amount, 1=Income, 2=Term
  const [formData, setFormData] = useState({ amount: 0, income: 0, term: 0 });

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    
    // Thêm tin nhắn User
    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');

    // --- LOGIC AI HỘI THOẠI ---
    if (chatMode === 'normal') {
        if (userText.toLowerCase().includes('có') || userText.toLowerCase().includes('tư vấn')) {
            setChatMode('consulting');
            setStep(1); // Chuyển sang bước 1
            setTimeout(() => addBotMessage("Tuyệt vời! Đầu tiên, bạn muốn vay bao nhiêu tiền? (Ví dụ: 50000000)"), 500);
        } else {
            setTimeout(() => addBotMessage("Gõ 'Có' hoặc 'Tư vấn' để tôi dùng AI phân tích gói vay cho bạn nhé!"), 500);
        }
    } 
    else if (chatMode === 'consulting') {
        // Xử lý từng bước nhập liệu
        if (step === 1) { // Nhập số tiền
            const val = parseFloat(userText.replace(/,/g, ''));
            if (isNaN(val)) {
                addBotMessage("Vui lòng nhập số tiền hợp lệ (VNĐ).");
            } else {
                setFormData(prev => ({ ...prev, amount: val }));
                setStep(2);
                addBotMessage("Ok. Thu nhập hàng tháng của bạn khoảng bao nhiêu? (Ví dụ: 15000000)");
            }
        } 
        else if (step === 2) { // Nhập thu nhập
            const val = parseFloat(userText.replace(/,/g, ''));
            if (isNaN(val)) {
                addBotMessage("Vui lòng nhập số tiền hợp lệ.");
            } else {
                setFormData(prev => ({ ...prev, income: val }));
                setStep(3);
                addBotMessage("Cuối cùng, bạn muốn vay trong bao nhiêu tháng? (Ví dụ: 12, 24, 36)");
            }
        }
        else if (step === 3) { // Nhập thời hạn & GỌI API AI
            const val = parseFloat(userText);
            setFormData(prev => ({ ...prev, term: val }));
            
            // Gọi AI
            setChatMode('normal'); // Reset về bình thường
            setStep(0);
            addBotMessage("Đang phân tích dữ liệu...", 'loading');

            try {
                // Gửi dữ liệu vừa thu thập cho Backend ML
                const finalData = { ...formData, term: val };
                const res = await axiosClient.post('/Chatbot/recommend-ai', {
                    Amount: finalData.amount,
                    Income: finalData.income,
                    Term: finalData.term
                });
                
                // Hiển thị kết quả từ AI
                setMessages(prev => prev.filter(m => m.type !== 'loading')); // Xóa loading
                addBotMessage(res.data.message);
                
                // Hiển thị Card gói vay
                const pkg = res.data.data;
                setMessages(prev => [...prev, {
                    id: Date.now() + 2,
                    sender: 'bot',
                    type: 'package',
                    package: pkg
                }]);

            } catch (error) {
                addBotMessage("Xin lỗi, server AI đang bận. Bạn thử lại sau nhé.");
            }
        }
    }
  };

  const addBotMessage = (text, type = 'text') => {
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'bot', type }]);
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 2000 }}>
      {!isOpen && (
        <FloatButton icon={<MessageOutlined />} type="primary" style={{ width: 60, height: 60 }} onClick={() => setIsOpen(true)} />
      )}

      {isOpen && (
        <Card style={{ width: 380, height: 550, display: 'flex', flexDirection: 'column', borderRadius: 15, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '15px', background: 'linear-gradient(90deg, #722ed1, #1890ff)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Avatar icon={<RobotOutlined />} style={{ background: '#fff', color: '#722ed1' }} />
                <div><b>AI Consultant</b><div style={{ fontSize: 10 }}>● Machine Learning Core</div></div>
            </div>
            <Button type="text" icon={<CloseOutlined style={{color:'#fff'}}/>} onClick={() => setIsOpen(false)}/>
          </div>

          <div style={{ flex: 1, padding: 15, overflowY: 'auto', background: '#f5f5f5' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 15, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                {msg.type === 'loading' ? <Spin /> : (
                    msg.type !== 'package' && (
                        <div style={{ 
                            display: 'inline-block', padding: '10px 14px', borderRadius: 12, 
                            background: msg.sender === 'user' ? '#722ed1' : '#fff',
                            color: msg.sender === 'user' ? '#fff' : '#333',
                            maxWidth: '85%', textAlign: 'left',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                        {msg.text}
                        </div>
                    )
                )}

                {msg.type === 'package' && msg.package && (
                    <Card size="small" style={{ marginTop: 5, borderLeft: '4px solid #722ed1', maxWidth: '90%' }}>
                        <div style={{ fontWeight: 'bold', color: '#722ed1', fontSize: 16 }}>{msg.package.name}</div>
                        <div style={{ margin: '8px 0' }}><ThunderboltFilled style={{color:'#faad14'}}/> Lãi suất: <b>{msg.package.rate}</b></div>
                        <div>Hạn mức: {msg.package.limit}</div>
                        <div style={{ fontSize: 12, color: '#666', marginTop: 8, fontStyle: 'italic' }}>"{msg.package.desc}"</div>
                    </Card>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: 10, background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <Input 
                placeholder={chatMode === 'consulting' ? 'Nhập số liệu...' : 'Nhập tin nhắn...'} 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onPressEnter={handleSend} 
                disabled={messages.some(m => m.type === 'loading')}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} style={{ background: '#722ed1' }}/>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;