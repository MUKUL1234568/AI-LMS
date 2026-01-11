import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankService } from '../../services/bank.service';
import { BankAccount } from '../../types';
import BankModal from './BankModal';
import './Banks.css';

const Banks = () => {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBankAccounts = async () => {
    try {
      const data = await bankService.getAll();
      setBankAccounts(data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getTotalBalance = () => {
    return bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title">
          <span className="page-title-icon">🏦</span>
          <h1>Bank Accounts</h1>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          Add Bank Account
        </button>
      </div>

      {/* Total Balance Summary */}
      {bankAccounts.length > 0 && (
        <div className="card total-balance-card">
          <div className="total-balance">
            <span className="label">Total Balance Across All Banks</span>
            <span className="value total-amount-large">{formatCurrency(getTotalBalance())}</span>
          </div>
        </div>
      )}

      {bankAccounts.length === 0 ? (
        <div className="card">
          <p>No bank accounts found. Click "Add Bank Account" to get started.</p>
        </div>
      ) : (
        <div className="bank-grid">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="bank-card"
              onClick={() => navigate(`/banks/${account.id}`)}
            >
              <div className="bank-icon">🏦</div>
              <div className="bank-info">
                <h3 className="bank-name">{account.bankName}</h3>
                <p className="owner-name">{account.ownerName}</p>
                {account.accountNumber && (
                  <p className="account-number">A/C: {account.accountNumber}</p>
                )}
              </div>
              <div className="bank-balance">
                <span className="balance-label">Balance</span>
                <span className={`balance-value ${account.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(account.balance)}
                </span>
              </div>
              <div className="bank-transactions-count">
                {account._count?.bankTransactions || 0} transactions
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <BankModal
          bankAccount={null}
          onClose={() => {
            setIsCreateModalOpen(false);
            fetchBankAccounts();
          }}
        />
      )}
    </div>
  );
};

export default Banks;
