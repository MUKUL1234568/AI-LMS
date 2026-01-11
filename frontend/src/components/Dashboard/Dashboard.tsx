import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeService } from '../../services/employee.service';
import { customerService } from '../../services/customer.service';
import { investorService } from '../../services/investor.service';
import { bankService } from '../../services/bank.service';
import { authService } from '../../services/auth.service';
import './Dashboard.css';

interface DashboardStats {
  employees: number;
  customers: number;
  investors: number;
  banks: number;
  totalBankBalance: number;
  customerPrincipal: number;
  customerInterest: number;
  investorPrincipal: number;
  investorInterest: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const [stats, setStats] = useState<DashboardStats>({
    employees: 0,
    customers: 0,
    investors: 0,
    banks: 0,
    totalBankBalance: 0,
    customerPrincipal: 0,
    customerInterest: 0,
    investorPrincipal: 0,
    investorInterest: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employees, customers, investors, banks] = await Promise.all([
          employeeService.getAll(),
          customerService.getAll(),
          investorService.getAll(),
          bankService.getAll(),
        ]);

        const totalBankBalance = banks.reduce((sum, bank) => sum + bank.balance, 0);
        const customerPrincipal = customers.reduce((sum, c) => sum + (c.principalAmount || 0), 0);
        const customerInterest = customers.reduce((sum, c) => sum + (c.accumulatedInterest || 0), 0);
        const investorPrincipal = investors.reduce((sum, i) => sum + (i.principalAmount || 0), 0);
        const investorInterest = investors.reduce((sum, i) => sum + (i.accumulatedInterest || 0), 0);

        setStats({
          employees: employees.length,
          customers: customers.length,
          investors: investors.length,
          banks: banks.length,
          totalBankBalance,
          customerPrincipal,
          customerInterest,
          investorPrincipal,
          investorInterest,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate net position
  const netPosition = stats.customerPrincipal + stats.customerInterest - stats.investorPrincipal - stats.investorInterest;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            <span className="wave-emoji">👋</span>
            Welcome back, <span className="user-name">{user?.name || 'User'}</span>
          </h1>
          <p className="welcome-subtitle">Here's what's happening with your lending business today.</p>
        </div>
        <div className="datetime-widget">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* Main Stats Hero Card - Bank Balance */}
      <div className="hero-card bank-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-icon">🏦</div>
          <div className="hero-info">
            <span className="hero-label">Total Bank Balance</span>
            <span className="hero-value">{formatCurrency(stats.totalBankBalance)}</span>
            <span className="hero-subtitle">{stats.banks} Bank Account{stats.banks !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <button className="hero-action" onClick={() => navigate('/banks')}>
          View Banks →
        </button>
      </div>

      {/* Customer & Investor Section */}
      <div className="financial-grid">
        {/* Customer Card */}
        <div className="financial-card customer-card" onClick={() => navigate('/customers')}>
          <div className="card-header">
            <div className="card-icon customer-icon">🧑‍💼</div>
            <div className="card-badge">{stats.customers} Customers</div>
          </div>
          <h3 className="card-title">Money to Receive</h3>
          <p className="card-description">Total amount owed by customers</p>

          <div className="financial-stats">
            <div className="stat-row">
              <span className="stat-label">Principal Amount</span>
              <span className="stat-value principal-customer">{formatCurrency(stats.customerPrincipal)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Accumulated Interest</span>
              <span className="stat-value interest-customer">{formatCurrency(stats.customerInterest)}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-row total-row">
              <span className="stat-label">Total Receivable</span>
              <span className="stat-value total-customer">{formatCurrency(stats.customerPrincipal + stats.customerInterest)}</span>
            </div>
          </div>

          <div className="card-footer">
            <span className="view-link">View Details →</span>
          </div>
        </div>

        {/* Investor Card */}
        <div className="financial-card investor-card" onClick={() => navigate('/investors')}>
          <div className="card-header">
            <div className="card-icon investor-icon">📈</div>
            <div className="card-badge">{stats.investors} Investors</div>
          </div>
          <h3 className="card-title">Money to Pay</h3>
          <p className="card-description">Total amount owed to investors</p>

          <div className="financial-stats">
            <div className="stat-row">
              <span className="stat-label">Principal Amount</span>
              <span className="stat-value principal-investor">{formatCurrency(stats.investorPrincipal)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Accumulated Interest</span>
              <span className="stat-value interest-investor">{formatCurrency(stats.investorInterest)}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-row total-row">
              <span className="stat-label">Total Payable</span>
              <span className="stat-value total-investor">{formatCurrency(stats.investorPrincipal + stats.investorInterest)}</span>
            </div>
          </div>

          <div className="card-footer">
            <span className="view-link">View Details →</span>
          </div>
        </div>
      </div>

      {/* Net Position Card */}
      <div className={`net-position-card ${netPosition >= 0 ? 'positive' : 'negative'}`}>
        <div className="net-position-content">
          <div className="net-icon">{netPosition >= 0 ? '📊' : '⚠️'}</div>
          <div className="net-info">
            <span className="net-label">Net Position (Receivable - Payable)</span>
            <span className="net-value">{formatCurrency(netPosition)}</span>
            <span className="net-status">
              {netPosition >= 0
                ? '✅ You have more to receive than to pay'
                : '⚠️ You owe more than you will receive'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="quick-stats-grid">
        <div className="quick-stat-card" onClick={() => navigate('/employees')}>
          <div className="quick-stat-icon employees">👥</div>
          <div className="quick-stat-info">
            <span className="quick-stat-value">{stats.employees}</span>
            <span className="quick-stat-label">Employees</span>
          </div>
        </div>

        <div className="quick-stat-card" onClick={() => navigate('/customers')}>
          <div className="quick-stat-icon customers">🧑‍💼</div>
          <div className="quick-stat-info">
            <span className="quick-stat-value">{stats.customers}</span>
            <span className="quick-stat-label">Customers</span>
          </div>
        </div>

        <div className="quick-stat-card" onClick={() => navigate('/investors')}>
          <div className="quick-stat-icon investors">📈</div>
          <div className="quick-stat-info">
            <span className="quick-stat-value">{stats.investors}</span>
            <span className="quick-stat-label">Investors</span>
          </div>
        </div>

        <div className="quick-stat-card" onClick={() => navigate('/banks')}>
          <div className="quick-stat-icon banks">🏦</div>
          <div className="quick-stat-info">
            <span className="quick-stat-value">{stats.banks}</span>
            <span className="quick-stat-label">Banks</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-btn action-customer" onClick={() => navigate('/customers')}>
            <span className="action-icon">➕</span>
            <span className="action-text">Add Customer</span>
          </button>
          <button className="action-btn action-investor" onClick={() => navigate('/investors')}>
            <span className="action-icon">➕</span>
            <span className="action-text">Add Investor</span>
          </button>
          <button className="action-btn action-bank" onClick={() => navigate('/banks')}>
            <span className="action-icon">💳</span>
            <span className="action-text">Manage Banks</span>
          </button>
          <button className="action-btn action-employee" onClick={() => navigate('/employees')}>
            <span className="action-icon">👥</span>
            <span className="action-text">View Employees</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
