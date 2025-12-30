import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminLoanList from './pages/admin/AdminLoanList';
import AdminCustomerList from './pages/admin/AdminCustomerList';

// Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import LoanRegistration from './pages/LoanRegistration';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Chatbot
import ChatWidget from './components/ChatWidget';

function App() {
  // Hàm bảo vệ Route (Nếu cần)
  const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (!token) return <Navigate to="/login" />;
    if (role && userRole !== role) return <Navigate to="/" />; // Sai quyền thì về trang chủ
    return children;
  };

  return (
    <Router>
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* CUSTOMER Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="Customer"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/apply" element={<ProtectedRoute role="Customer"><LoanRegistration /></ProtectedRoute>} />

          {/* ADMIN Routes (Dùng Layout lồng nhau) */}
          <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminLayout /></ProtectedRoute>}>
            {/* Khi vào /admin sẽ tự nhảy vào overview */}
            <Route index element={<Navigate to="overview" />} /> 
            <Route path="overview" element={<AdminOverview />} />
            <Route path="loans" element={<AdminLoanList />} />
            <Route path="customers" element={<AdminCustomerList />} />
          </Route>

        </Routes>
        
        {/* Chatbot luôn hiển thị */}
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;