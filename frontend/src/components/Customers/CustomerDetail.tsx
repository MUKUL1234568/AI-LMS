import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionService } from '../../services/transaction.service';
import { customerService } from '../../services/customer.service';
import { bankService } from '../../services/bank.service';
import { Customer, BankAccount } from '../../types';
import CustomerModal from './CustomerModal';
import './CustomerDetail.css';

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
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

  const fetchCustomer = async () => {
    if (!id) return;
    try {
      const data = await transactionService.getCustomerWithInterest(id);
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !deletePassword) {
      alert('Please enter your password to delete');
      return;
    }
    setActionLoading(true);
    try {
      await customerService.delete(id, deletePassword);
      navigate('/customers');
    } catch (error: any) {
      console.error('Error deleting customer:', error);
      alert(error.response?.data?.error || 'Failed to delete customer');
      setDeletePassword('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateInterestRate = async () => {
    if (!id || !newInterestRate) return;
    setActionLoading(true);
    try {
      await customerService.updateInterestRate(id, parseFloat(newInterestRate));
      setShowInterestRateModal(false);
      setNewInterestRate('');
      fetchCustomer();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update interest rate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGiveLoan = async () => {
    if (!id || !loanAmount || !interestRate || !selectedBankAccountId) return;
    setActionLoading(true);
    try {
      await transactionService.giveLoan(id, {
        amount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        description,
        bankAccountId: selectedBankAccountId,
      });
      setShowLoanModal(false);
      setLoanAmount('');
      setInterestRate('');
      setDescription('');
      fetchCustomer();
      fetchBankAccounts(); // Refresh bank accounts to show updated balance
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to give loan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!id || !depositAmount || !selectedBankAccountId) return;
    setActionLoading(true);
    try {
      await transactionService.receiveDeposit(id, {
        amount: parseFloat(depositAmount),
        description,
        bankAccountId: selectedBankAccountId,
      });
      setShowDepositModal(false);
      setDepositAmount('');
      setDescription('');
      fetchCustomer();
      fetchBankAccounts(); // Refresh bank accounts to show updated balance
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to receive deposit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddInterestToPrincipal = async () => {
    if (!id || !customer) return;
    if (!window.confirm(`Add ₹${customer.accumulatedInterest.toFixed(2)} interest to principal?`)) {
      return;
    }
    setActionLoading(true);
    try {
      await transactionService.addInterestToPrincipal(id);
      fetchCustomer();
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

  if (!customer) {
    return <div className="container">Customer not found</div>;
  }

  const totalDue = customer.principalAmount + customer.accumulatedInterest;

  return (
    <div className="container">
      <div className="customer-detail-header">
        <button onClick={() => navigate('/customers')} className="btn btn-secondary">
          ← Back to Customers
        </button>
      </div>

      {/* Customer Profile Card */}
      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-photo">
            {customer.photo ? (
              <img src={customer.photo} alt={customer.name} />
            ) : (
              <div className="no-photo-large">No Photo</div>
            )}
          </div>
          <div className="profile-info">
            <h1>{customer.name}</h1>
            <p className="phone">{customer.phone}</p>
            {customer.email && <p className="email">{customer.email}</p>}
            {customer.address && <p className="address">{customer.address}</p>}
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
          {customer.aadhaarNumber && (
            <div className="id-item">
              <span className="label">Aadhaar:</span>
              <span className="value">{customer.aadhaarNumber}</span>
            </div>
          )}
          {customer.panNumber && (
            <div className="id-item">
              <span className="label">PAN:</span>
              <span className="value">{customer.panNumber}</span>
            </div>
          )}
          {customer.idNumber && (
            <div className="id-item">
              <span className="label">ID Number:</span>
              <span className="value">{customer.idNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Loan Summary Card */}
      <div className="card loan-summary-card">
        <div className="loan-amounts">
          <div className="amount-box principal">
            <span className="label">Principal Amount</span>
            <span className="value">{formatCurrency(customer.principalAmount)}</span>
          </div>
          <div className="amount-box interest">
            <span className="label">Accumulated Interest</span>
            <span className="value">{formatCurrency(customer.accumulatedInterest)}</span>
            {customer.accumulatedInterest > 0 && (
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
            <span className="label">Total Due</span>
            <span className="value">{formatCurrency(totalDue)}</span>
          </div>
        </div>
        <div className="interest-rate-info">
          <span>Monthly Interest Rate: <strong>{customer.monthlyInterestRate}%</strong></span>
          <button
            onClick={() => {
              setNewInterestRate(customer.monthlyInterestRate.toString());
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
            Give Loan
          </button>
          <button onClick={() => setShowDepositModal(true)} className="btn btn-success btn-large">
            Receive Deposit
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="card">
        <h2>Transaction History</h2>
        <div className="transaction-list">
          {!customer.transactions || customer.transactions.length === 0 ? (
            <p className="no-transactions">No transactions yet</p>
          ) : (
            customer.transactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`transaction-item ${transaction.type === 'DEPOSIT' ? 'deposit' :
                  transaction.type === 'INTEREST_ADD' ? 'interest-add' : 'loan'
                  }`}
              >
                <div className="transaction-content">
                  <div className="transaction-header">
                    <span className="transaction-type">
                      {transaction.type === 'DEPOSIT' ? '💰 Deposit' :
                        transaction.type === 'INTEREST_ADD' ? '📊 Interest Added' : '🏦 Loan Given'}
                    </span>
                    <span className="transaction-amount">
                      {transaction.type === 'DEPOSIT' ? '-' : '+'}{formatCurrency(transaction.amount)}
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

      {/* Give Loan Modal */}
      {showLoanModal && (
        <div className="modal-overlay" onClick={() => setShowLoanModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Give Loan</h2>
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
                  <label>Principal Amount (₹) *</label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                  {loanAmount && selectedBankAccountId && parseFloat(loanAmount) > (bankAccounts.find(b => b.id === selectedBankAccountId)?.balance || 0) && (
                    <p className="error" style={{ marginTop: '5px' }}>
                      Insufficient balance in selected bank account!
                    </p>
                  )}
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
                    onClick={handleGiveLoan}
                    className="btn btn-danger"
                    disabled={actionLoading || !loanAmount || !interestRate || !selectedBankAccountId || (!!loanAmount && parseFloat(loanAmount) > (bankAccounts.find(b => b.id === selectedBankAccountId)?.balance || 0))}
                  >
                    {actionLoading ? 'Processing...' : 'Give Loan'}
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
              <h2>Receive Deposit</h2>
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
                  Note: Deposit will first be deducted from interest (₹{customer.accumulatedInterest.toFixed(2)}),
                  then from principal (₹{customer.principalAmount.toFixed(2)}).
                </p>
                <div className="modal-footer">
                  <button onClick={() => setShowDepositModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    onClick={handleDeposit}
                    className="btn btn-success"
                    disabled={actionLoading || !depositAmount || !selectedBankAccountId}
                  >
                    {actionLoading ? 'Processing...' : 'Receive Deposit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && customer && (
        <CustomerModal
          customer={customer}
          onClose={() => {
            setIsEditModalOpen(false);
            fetchCustomer();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Customer</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div className="form-group">
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Are you sure you want to delete this customer? This action cannot be undone.
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
                {actionLoading ? 'Deleting...' : 'Delete Customer'}
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

export default CustomerDetail;
