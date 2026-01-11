import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bankService } from '../../services/bank.service';
import { BankAccount } from '../../types';
import BankModal from './BankModal';
import './BankDetail.css';

const BankDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [allBankAccounts, setAllBankAccounts] = useState<BankAccount[]>([]);

  const fetchBankAccount = async () => {
    if (!id) return;
    try {
      const data = await bankService.getById(id);
      setBankAccount(data);
    } catch (error) {
      console.error('Error fetching bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBankAccounts = async () => {
    try {
      const data = await bankService.getAll();
      setAllBankAccounts(data.filter(acc => acc.id !== id)); // Exclude current account
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  useEffect(() => {
    fetchBankAccount();
    fetchAllBankAccounts();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDeposit = async () => {
    if (!id || !amount) return;
    setActionLoading(true);
    setError('');
    try {
      await bankService.deposit(id, {
        amount: parseFloat(amount),
        description: description || undefined,
      });
      setShowDepositModal(false);
      setAmount('');
      setDescription('');
      fetchBankAccount();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!id || !amount) return;
    setActionLoading(true);
    setError('');
    try {
      await bankService.withdraw(id, {
        amount: parseFloat(amount),
        description: description || undefined,
      });
      setShowWithdrawModal(false);
      setAmount('');
      setDescription('');
      fetchBankAccount();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to withdraw');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this bank account? All transactions will be lost.')) {
      return;
    }
    try {
      await bankService.delete(id);
      navigate('/banks');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleTransfer = async () => {
    if (!id || !transferAmount || !toAccountId) return;
    setActionLoading(true);
    setError('');
    try {
      await bankService.transfer({
        fromAccountId: id,
        toAccountId,
        amount: parseFloat(transferAmount),
        description: description || undefined,
      });
      setShowTransferModal(false);
      setTransferAmount('');
      setToAccountId('');
      setDescription('');
      fetchBankAccount();
      fetchAllBankAccounts(); // Refresh to update balances
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to transfer');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!bankAccount) {
    return (
      <div className="container">
        <p>Bank account not found.</p>
        <button onClick={() => navigate('/banks')} className="btn btn-secondary">
          Back to Banks
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bank-detail-header">
        <button onClick={() => navigate('/banks')} className="btn btn-secondary">
          ← Back to Banks
        </button>
      </div>

      {/* Bank Account Info Card */}
      <div className="card bank-info-card">
        <div className="bank-header">
          <div className="bank-icon-large">🏦</div>
          <div className="bank-details">
            <h1>{bankAccount.bankName}</h1>
            <p className="owner">Account Holder: <strong>{bankAccount.ownerName}</strong></p>
            {bankAccount.accountNumber && (
              <p className="account-num">A/C: {bankAccount.accountNumber}</p>
            )}
          </div>
          <div className="bank-actions">
            <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
              Edit
            </button>
            <button onClick={handleDelete} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="balance-display">
          <span className="balance-label">Current Balance</span>
          <span className={`balance-amount ${bankAccount.balance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(bankAccount.balance)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="btn btn-danger btn-large"
          >
            Withdraw
          </button>
          <button
            onClick={() => setShowDepositModal(true)}
            className="btn btn-success btn-large"
          >
            Deposit
          </button>
          <button
            onClick={() => {
              setShowTransferModal(true);
              fetchAllBankAccounts();
            }}
            className="btn btn-secondary btn-large"
          >
            Transfer
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2>Transaction History</h2>
        <div className="transaction-list">
          {!bankAccount.bankTransactions || bankAccount.bankTransactions.length === 0 ? (
            <p className="no-transactions">No transactions yet</p>
          ) : (
            bankAccount.bankTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`bank-transaction-item ${transaction.type.toLowerCase()}`}
              >
                <div className="transaction-content">
                  <div className="transaction-header">
                    <span className="transaction-type">
                      {transaction.type === 'DEPOSIT' ? '💰 Deposit' : '💸 Withdrawal'}
                    </span>
                    <span className="transaction-amount">
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="transaction-description">{transaction.description}</p>
                  )}
                  <div className="transaction-footer">
                    <span className="transaction-date">{formatDate(transaction.createdAt)}</span>
                    <span className="transaction-balance">
                      Balance: {formatCurrency(transaction.balanceAfter)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deposit Money</h2>
              <button className="close-btn" onClick={() => setShowDepositModal(false)}>&times;</button>
            </div>
            {error && <div className="error">{error}</div>}
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Cash deposit, Transfer from..."
                rows={3}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowDepositModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="btn btn-success"
                disabled={actionLoading || !amount}
              >
                {actionLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Withdraw Money</h2>
              <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>&times;</button>
            </div>
            {error && <div className="error">{error}</div>}
            <div className="current-balance-info">
              Available Balance: <strong>{formatCurrency(bankAccount.balance)}</strong>
            </div>
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                max={bankAccount.balance}
                step="0.01"
                autoFocus
              />
              {amount && parseFloat(amount) > bankAccount.balance && (
                <p className="error" style={{ marginTop: '5px' }}>
                  Insufficient balance! Available: {formatCurrency(bankAccount.balance)}
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., ATM withdrawal, Transfer to..."
                rows={3}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowWithdrawModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                className="btn btn-danger"
                disabled={actionLoading || !amount || parseFloat(amount) > bankAccount.balance}
              >
                {actionLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transfer Money</h2>
              <button className="close-btn" onClick={() => setShowTransferModal(false)}>&times;</button>
            </div>
            {error && <div className="error">{error}</div>}
            <div className="current-balance-info">
              From: <strong>{bankAccount.bankName} - {bankAccount.ownerName}</strong><br />
              Available Balance: <strong>{formatCurrency(bankAccount.balance)}</strong>
            </div>
            {allBankAccounts.length === 0 ? (
              <div className="error">
                No other bank accounts found. Please create another bank account first.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>To Bank Account *</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    required
                  >
                    <option value="">Select bank account</option>
                    {allBankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.bankName} - {account.ownerName} (Balance: ₹{account.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter transfer amount"
                    min="0"
                    max={bankAccount.balance}
                    step="0.01"
                    autoFocus
                  />
                  {transferAmount && parseFloat(transferAmount) > bankAccount.balance && (
                    <p className="error" style={{ marginTop: '5px' }}>
                      Insufficient balance! Available: {formatCurrency(bankAccount.balance)}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., Transfer for business expenses..."
                    rows={3}
                  />
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowTransferModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    className="btn btn-primary"
                    disabled={actionLoading || !transferAmount || !toAccountId || (!!transferAmount && parseFloat(transferAmount) > bankAccount.balance)}
                  >
                    {actionLoading ? 'Processing...' : 'Transfer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <BankModal
          bankAccount={bankAccount}
          onClose={() => {
            setShowEditModal(false);
            fetchBankAccount();
          }}
        />
      )}
    </div>
  );
};

export default BankDetail;
