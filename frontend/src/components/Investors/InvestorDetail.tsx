import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { investorTransactionService } from '../../services/investorTransaction.service';
import { investorService } from '../../services/investor.service';
import { bankService } from '../../services/bank.service';
import { Investor, BankAccount } from '../../types';
import InvestorModal from './InvestorModal';
import './InvestorDetail.css';

const InvestorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investor, setInvestor] = useState<Investor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [description, setDescription] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showInterestRateModal, setShowInterestRateModal] = useState(false);
  const [newInterestRate, setNewInterestRate] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');

  const fetchBankAccounts = async () => {
    try {
      const data = await bankService.getAll();
      setBankAccounts(data);
      if (data.length > 0 && !selectedBankAccountId) {
        setSelectedBankAccountId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchInvestor = async () => {
    if (!id) return;
    try {
      const data = await investorTransactionService.getInvestorWithInterest(id);
      setInvestor(data);
    } catch (error) {
      console.error('Error fetching investor:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestor();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !deletePassword) {
      alert('Please enter your password to delete');
      return;
    }
    setActionLoading(true);
    try {
      await investorService.delete(id, deletePassword);
      navigate('/investors');
    } catch (error: any) {
      console.error('Error deleting investor:', error);
      alert(error.response?.data?.error || 'Failed to delete investor');
      setDeletePassword('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateInterestRate = async () => {
    if (!id || !newInterestRate) return;
    setActionLoading(true);
    try {
      await investorService.updateInterestRate(id, parseFloat(newInterestRate));
      setShowInterestRateModal(false);
      setNewInterestRate('');
      fetchInvestor();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update interest rate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTakeLoan = async () => {
    if (!id || !loanAmount || !interestRate || !selectedBankAccountId) return;
    setActionLoading(true);
    try {
      await investorTransactionService.takeLoan(id, {
        amount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        description,
        bankAccountId: selectedBankAccountId,
      });
      setShowLoanModal(false);
      setLoanAmount('');
      setInterestRate('');
      setDescription('');
      fetchInvestor();
      fetchBankAccounts(); // Refresh bank accounts to show updated balance
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to take loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnLoan = async () => {
    if (!id || !depositAmount || !selectedBankAccountId) return;
    setActionLoading(true);
    try {
      await investorTransactionService.returnLoan(id, {
        amount: parseFloat(depositAmount),
        description,
        bankAccountId: selectedBankAccountId,
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setDescription('');
      fetchInvestor();
      fetchBankAccounts(); // Refresh bank accounts to show updated balance
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to return loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddInterestToPrincipal = async () => {
    if (!id || !investor) return;
    if (!window.confirm(`Add ₹${investor.accumulatedInterest.toFixed(2)} interest to principal?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await investorTransactionService.addInterestToPrincipal(id);
      fetchInvestor();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add interest to principal');
    } finally {
      setActionLoading(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!investor) {
    return <div className="container">Investor not found</div>;
  }

  const totalDue = investor.principalAmount + investor.accumulatedInterest;

  return (
    <div className="container">
      <div className="customer-detail-header">
        <button onClick={() => navigate('/investors')} className="btn btn-secondary">
          ← Back to Investors
        </button>
      </div>

      {/* Investor Profile Card */}
      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-photo">
            {investor.photo ? (
              <img src={investor.photo} alt={investor.name} />
            ) : (
              <div className="no-photo-large">No Photo</div>
            )}
          </div>
          <div className="profile-info">
            <h1>{investor.name}</h1>
            <p className="phone">{investor.phone}</p>
            {investor.email && <p className="email">{investor.email}</p>}
            {investor.address && <p className="address">{investor.address}</p>}
          </div>
          <div className="profile-actions">
            <button onClick={() => setIsEditModalOpen(true)} className="btn btn-secondary">
              Edit
            </button>
            <button onClick={() => setShowDeleteModal(true)} className="btn btn-danger">
              Delete
            </button>
          </div>
        </div>

        {/* ID Details */}
        <div className="id-details">
          {investor.aadhaarNumber && (
            <div className="id-item">
              <span className="label">Aadhaar:</span>
              <span className="value">{investor.aadhaarNumber}</span>
            </div>
          )}
          {investor.panNumber && (
            <div className="id-item">
              <span className="label">PAN:</span>
              <span className="value">{investor.panNumber}</span>
            </div>
          )}
          {investor.idNumber && (
            <div className="id-item">
              <span className="label">ID Number:</span>
              <span className="value">{investor.idNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loan Summary Card */}
      <div className="card loan-summary-card">
        <div className="loan-amounts">
          <div className="amount-box principal">
            <span className="label">Total Loan</span>
            <span className="value">{formatCurrency(investor.principalAmount)}</span>
          </div>
          <div className="amount-box interest">
            <span className="label">Total Interest</span>
            <span className="value">{formatCurrency(investor.accumulatedInterest)}</span>
            {investor.accumulatedInterest > 0 && (
              <button
                onClick={handleAddInterestToPrincipal}
                className="btn btn-small btn-warning"
                disabled={actionLoading}
              >
                Add to Principal
              </button>
            )}
          </div>
          <div className="amount-box total">
            <span className="label">Total Owed</span>
            <span className="value">{formatCurrency(totalDue)}</span>
          </div>
        </div>
        <div className="interest-rate-info">
          <span>Monthly Interest Rate: <strong>{investor.monthlyInterestRate}%</strong></span>
          <button
            onClick={() => {
              setNewInterestRate(investor.monthlyInterestRate.toString());
              setShowInterestRateModal(true);
            }}
            className="btn btn-small btn-secondary"
            style={{ marginLeft: '15px' }}
          >
            Change Rate
          </button>
        </div>
        <div className="loan-actions">
          <button onClick={() => setShowLoanModal(true)} className="btn btn-danger btn-large">
            Take Loan
          </button>
          <button onClick={() => setShowDepositModal(true)} className="btn btn-success btn-large">
            Return Loan
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2>Transaction History</h2>
        <div className="transaction-list">
          {!investor.transactions || investor.transactions.length === 0 ? (
            <p className="no-transactions">No transactions yet</p>
          ) : (
            investor.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`transaction-item ${transaction.type === 'LOAN_RETURN' ? 'deposit' :
                    transaction.type === 'INTEREST_ADD' ? 'interest-add' : 'loan'
                  }`}
              >
                <div className="transaction-content">
                  <div className="transaction-header">
                    <span className="transaction-type">
                      {transaction.type === 'LOAN_RETURN' ? '💰 Loan Return' :
                        transaction.type === 'INTEREST_ADD' ? '📊 Interest Added' : '🏦 Loan Taken'}
                    </span>
                    <span className="transaction-amount">
                      {transaction.type === 'LOAN_RETURN' ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  {transaction.description && (
                    <p className="transaction-description">{transaction.description}</p>
                  )}
                  <div className="transaction-footer">
                    <span className="transaction-date">{formatDate(transaction.createdAt)}</span>
                    <span className="transaction-balance">
                      Balance: P: {formatCurrency(transaction.principalAfter)} | I: {formatCurrency(transaction.interestAfter)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Take Loan Modal */}
      {showLoanModal && (
        <div className="modal-overlay" onClick={() => setShowLoanModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Take Loan</h2>
              <button className="close-btn" onClick={() => setShowLoanModal(false)}>&times;</button>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="error">
                No bank accounts found. Please create a bank account first.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Select Bank Account *</label>
                  <select
                    value={selectedBankAccountId}
                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                    required
                  >
                    {bankAccounts.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName} - {bank.ownerName} (Balance: ₹{bank.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  {selectedBankAccountId && (
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      Available Balance: ₹{bankAccounts.find(b => b.id === selectedBankAccountId)?.balance.toFixed(2) || '0.00'}
                    </p>
                  )}
                </div>
                <div className="form-group">
                  <label>Total Loan (₹) *</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Interest Rate (%) *</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Enter monthly rate"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a note"
                  />
                </div>
                <div className="modal-footer">
                  <button onClick={() => setShowLoanModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleTakeLoan}
                    className="btn btn-danger"
                    disabled={actionLoading || !loanAmount || !interestRate || !selectedBankAccountId}
                  >
                    {actionLoading ? 'Processing...' : 'Take Loan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Return Loan</h2>
              <button className="close-btn" onClick={() => setShowDepositModal(false)}>&times;</button>
            </div>
            {bankAccounts.length === 0 ? (
              <div className="error">
                No bank accounts found. Please create a bank account first.
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Select Bank Account *</label>
                  <select
                    value={selectedBankAccountId}
                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                    required
                  >
                    {bankAccounts.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.bankName} - {bank.ownerName} (Balance: ₹{bank.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Deposit Amount (₹) *</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a note"
                  />
                </div>
                <p className="deposit-info">
                  Note: Loan return will first be deducted from interest (₹{investor.accumulatedInterest.toFixed(2)}),
                  then from principal (₹{investor.principalAmount.toFixed(2)}).
                </p>
                <div className="modal-footer">
                  <button onClick={() => setShowDepositModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleReturnLoan}
                    className="btn btn-success"
                    disabled={actionLoading || !depositAmount || !selectedBankAccountId}
                  >
                    {actionLoading ? 'Processing...' : 'Return Loan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Investor Modal */}
      {isEditModalOpen && investor && (
        <InvestorModal
          investor={investor}
          onClose={() => {
            setIsEditModalOpen(false);
            fetchInvestor();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Investor</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Are you sure you want to delete this investor? This action cannot be undone.
              </p>
              <label>Enter Admin Password to Confirm *</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={actionLoading || !deletePassword}
              >
                {actionLoading ? 'Deleting...' : 'Delete Investor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Interest Rate Modal */}
      {showInterestRateModal && (
        <div className="modal-overlay" onClick={() => setShowInterestRateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Update Interest Rate</h2>
              <button className="close-btn" onClick={() => setShowInterestRateModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <label>Monthly Interest Rate (%) *</label>
              <input
                type="number"
                value={newInterestRate}
                onChange={(e) => setNewInterestRate(e.target.value)}
                placeholder="Enter monthly interest rate"
                min="0"
                step="0.1"
                autoFocus
              />
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Note: Changing the interest rate will reset the interest calculation date.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowInterestRateModal(false);
                  setNewInterestRate('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateInterestRate}
                className="btn btn-primary"
                disabled={actionLoading || !newInterestRate}
              >
                {actionLoading ? 'Updating...' : 'Update Rate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDetail;
