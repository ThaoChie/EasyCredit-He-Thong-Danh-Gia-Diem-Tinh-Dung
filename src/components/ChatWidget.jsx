import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Input, Avatar, FloatButton, Spin, Tag, Tooltip } from 'antd';
import { 
  MessageOutlined, SendOutlined, CloseOutlined, RobotOutlined, 
  ThunderboltFilled, FileSearchOutlined, CalculatorOutlined, SmileOutlined, CheckCircleFilled
} from '@ant-design/icons';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // State hội thoại AI
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({});

  const [messages, setMessages] = useState([
    { id: 1, text: "Xin chào! Tôi là Trợ lý AI EasyCredit. Bạn cần hỗ trợ gì?", sender: 'bot', type: 'text' }
  ]);
  
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // --- DANH SÁCH GỢI Ý NHANH (CHIPS) ---
  const quickReplies = [
    { label: "💰 Gợi ý gói vay", action: "consult" },
    { label: "🔍 Tra cứu hồ sơ", action: "check_status" },
    { label: "📝 Thủ tục vay", action: "policy" },
  ];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isOpen, isTyping]);

  // --- HÀM XỬ LÝ GỬI TIN ---
  const handleSend = async (textOverride = null) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    // 1. Hiện tin nhắn User
    const userMsg = { id: Date.now(), text: textToSend, sender: 'user', type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 2. Xử lý Logic Bot
    try {
        // A. Nếu đang trong luồng nhập liệu AI (Step 1, 2, 3)
        if (step > 0) {
            await handleAIInputFlow(textToSend);
        }
        // B. Nếu là lệnh Tra cứu hồ sơ
        else if (textToSend === "🔍 Tra cứu hồ sơ") {
            await handleCheckStatus();
        }
        // C. Nếu là lệnh Thủ tục
        else if (textToSend === "📝 Thủ tục vay") {
            addBotMessage("Thủ tục rất đơn giản: Chỉ cần CMND/CCCD gắn chip và chứng minh thu nhập. Toàn bộ quy trình diễn ra Online 100%.");
        }
        // D. Nếu kích hoạt Tư vấn AI
        else if (textToSend === "💰 Gợi ý gói vay" || textToSend.toLowerCase().includes('tư vấn')) {
            setStep(1);
            addBotMessage("Tuyệt vời! AI sẽ giúp bạn tìm gói vay. Đầu tiên, bạn muốn vay bao nhiêu tiền? (VD: 50000000)");
        }
        // E. Chat xã giao
        else {
            await new Promise(r => setTimeout(r, 800));
            addBotMessage("Xin lỗi, tôi chưa hiểu rõ. Bạn hãy chọn các tính năng bên dưới nhé!");
        }
    } catch (e) {
        addBotMessage("Lỗi kết nối server.");
    }
    setIsTyping(false);
  };

  // --- LOGIC 1: TRA CỨU HỒ SƠ ---
  const handleCheckStatus = async () => {
      try {
          const res = await axiosClient.get('/Chatbot/check-status');
          if (res.data.found) {
              addBotMessage("Tôi tìm thấy hồ sơ gần nhất của bạn:", 'status_card', res.data);
          } else {
              addBotMessage(res.data.message);
          }
      } catch (e) {
          if(e.response?.status === 401) addBotMessage("Bạn cần Đăng nhập để tra cứu hồ sơ nhé!");
          else addBotMessage("Lỗi hệ thống tra cứu.");
      }
  };

  // --- LOGIC 2: AI MACHINE LEARNING FLOW ---
  const handleAIInputFlow = async (text) => {
      const val = parseFloat(text.replace(/,/g, ''));
      
      if (step === 1) { // Nhập tiền
          if (isNaN(val)) { addBotMessage("Vui lòng nhập số tiền hợp lệ."); return; }
          setFormData(prev => ({ ...prev, amount: val }));
          setStep(2);
          addBotMessage("Ok. Thu nhập hàng tháng của bạn là bao nhiêu?");
      } 
      else if (step === 2) { // Nhập thu nhập
          if (isNaN(val)) { addBotMessage("Vui lòng nhập số hợp lệ."); return; }
          setFormData(prev => ({ ...prev, income: val }));
          setStep(3);
          addBotMessage("Bạn muốn vay trong bao nhiêu tháng? (VD: 12)");
      }
      else if (step === 3) { // Gọi AI
          setStep(0); // Kết thúc luồng
          
          // Gọi API Backend
          const res = await axiosClient.post('/Chatbot/recommend-ai', {
              Amount: formData.amount,
              Income: formData.income,
              Term: parseFloat(text)
          });
          
          addBotMessage(res.data.message);
          // Hiện thẻ gói vay
          setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', type: 'package', package: res.data.data }]);
          }, 500);
      }
  };

  const addBotMessage = (text, type = 'text', data = null) => {
      setTimeout(() => {
          setMessages(prev => [...prev, { id: Date.now(), text, sender: 'bot', type, data }]);
      }, 500);
  };

  // --- HELPER RENDER CARD TRẠNG THÁI ---
  const renderStatusCard = (data) => {
      let color = data.status==='Disbursed'?'#52c41a': data.status==='Approved'?'#1890ff': data.status==='Pending'?'#faad14':'#ff4d4f';
      let text = data.status==='Disbursed'?'ĐÃ GIẢI NGÂN': data.status==='Approved'?'CHỜ KÝ HĐ': data.status==='Pending'?'CHỜ DUYỆT':'TỪ CHỐI';
      return (
          <Card size="small" style={{ width: '90%', borderTop: `3px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                  <b>Mã HĐ: #{data.id}</b>
                  <Tag color={color}>{text}</Tag>
              </div>
              <div style={{marginTop: 8, fontSize: 16, color: '#1890ff', fontWeight: 'bold'}}>
                  {data.amount.toLocaleString()} đ
              </div>
              <div style={{fontSize: 12, color: '#888'}}>Ngày tạo: {data.date}</div>
              <Button size="small" type="primary" style={{marginTop: 8, width: '100%'}} onClick={() => navigate('/dashboard')}>Xem chi tiết</Button>
          </Card>
      )
  };

  return (
    <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 2000 }}>
      {!isOpen && (
        <FloatButton icon={<MessageOutlined />} type="primary" style={{ width: 60, height: 60 }} onClick={() => setIsOpen(true)} tooltip="Trợ lý ảo AI"/>
      )}

      {isOpen && (
        <Card style={{ width: 380, height: 600, display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.25)', border: 'none' }} bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* 1. HEADER GRADIENT VIP */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1890ff 0%, #003a8c 100%)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{position: 'relative'}}>
                    <Avatar size="large" icon={<RobotOutlined />} style={{ background: '#fff', color: '#1890ff' }} />
                    <span style={{position:'absolute', bottom:0, right:0, width:10, height:10, background:'#52c41a', borderRadius:'50%', border:'2px solid #fff'}}></span>
                </div>
                <div>
                    <div style={{fontWeight:'bold', fontSize: 16}}>EasyCredit AI</div>
                    <div style={{fontSize: 11, opacity: 0.8}}>Phản hồi ngay lập tức</div>
                </div>
            </div>
            <Button type="text" icon={<CloseOutlined style={{color:'#fff', fontSize: 18}}/>} onClick={() => setIsOpen(false)}/>
          </div>

          {/* 2. BODY CHAT */}
          <div style={{ flex: 1, padding: '15px 15px 0 15px', overflowY: 'auto', background: '#f0f2f5' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 15, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                {msg.type !== 'package' && msg.type !== 'status_card' && (
                    <div style={{ 
                        display: 'inline-block', padding: '12px 16px', borderRadius: 18, 
                        background: msg.sender === 'user' ? '#1890ff' : '#fff',
                        color: msg.sender === 'user' ? '#fff' : '#333',
                        maxWidth: '80%', textAlign: 'left',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                        borderBottomRightRadius: msg.sender === 'user' ? 2 : 18,
                        borderTopLeftRadius: msg.sender === 'bot' ? 2 : 18,
                    }}>
                        {msg.text}
                    </div>
                )}
                
                {/* Render Card Gói Vay */}
                {msg.type === 'package' && msg.package && (
                    <Card size="small" style={{ marginTop: 5, borderLeft: '4px solid #722ed1', maxWidth: '90%', borderRadius: 10 }}>
                        <div style={{ fontWeight: 'bold', color: '#722ed1', fontSize: 15 }}>{msg.package.name}</div>
                        <div style={{ margin: '8px 0' }}><ThunderboltFilled style={{color:'#faad14'}}/> {msg.package.rate}</div>
                        <div style={{fontSize: 12}}>{msg.package.limit}</div>
                        <Button type="primary" size="small" style={{ marginTop: 8, width: '100%', background:'#722ed1' }} onClick={() => navigate('/apply')}>Đăng ký ngay</Button>
                    </Card>
                )}

                {/* Render Card Trạng Thái */}
                {msg.type === 'status_card' && renderStatusCard(msg.data)}
              </div>
            ))}
            
            {isTyping && (
                <div style={{display:'flex', gap:5, marginLeft: 10, marginBottom: 10}}>
                    <span className="dot" style={{width:8, height:8, background:'#ccc', borderRadius:'50%'}}></span>
                    <span className="dot" style={{width:8, height:8, background:'#ccc', borderRadius:'50%'}}></span>
                    <span className="dot" style={{width:8, height:8, background:'#ccc', borderRadius:'50%'}}></span>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. QUICK ACTIONS (CHIPS) */}
          <div style={{ padding: '10px 15px', background: '#f0f2f5', display: 'flex', gap: 8, overflowX: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            {quickReplies.map((chip, idx) => (
                <Button key={idx} size="small" shape="round" style={{fontSize: 12, borderColor: '#1890ff', color: '#1890ff', background:'#e6f7ff'}} onClick={() => handleSend(chip.label)}>
                    {chip.label}
                </Button>
            ))}
          </div>

          {/* 4. INPUT AREA */}
          <div style={{ padding: 12, background: '#fff', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Input 
                placeholder="Nhập tin nhắn..." 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onPressEnter={() => handleSend()} 
                style={{borderRadius: 20}}
                disabled={step > 0} // Khóa nhập text khi đang chọn step AI (để user tập trung nhập số)
            />
            <Button type="primary" shape="circle" icon={<SendOutlined />} size="large" onClick={() => handleSend()} />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChatWidget;