import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './utils/PrivateRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Employees from './components/Employees/Employees';
import Customers from './components/Customers/Customers';
import CustomerDetail from './components/Customers/CustomerDetail';
import Investors from './components/Investors/Investors';
import InvestorDetail from './components/Investors/InvestorDetail';
import Banks from './components/Banks/Banks';
import BankDetail from './components/Banks/BankDetail';
import Admin from './components/Admin/Admin';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="investors" element={<Investors />} />
          <Route path="investors/:id" element={<InvestorDetail />} />
          <Route path="banks" element={<Banks />} />
          <Route path="banks/:id" element={<BankDetail />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
