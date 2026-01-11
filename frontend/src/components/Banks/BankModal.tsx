import { useState } from 'react';
import { bankService } from '../../services/bank.service';
import { BankAccount } from '../../types';

interface BankModalProps {
  bankAccount: BankAccount | null;
  onClose: () => void;
}

const BankModal = ({ bankAccount, onClose }: BankModalProps) => {
  const [formData, setFormData] = useState({
    bankName: bankAccount?.bankName || '',
    accountNumber: bankAccount?.accountNumber || '',
    ownerName: bankAccount?.ownerName || '',
    initialBalance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (bankAccount) {
        await bankService.update(bankAccount.id, {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber || undefined,
          ownerName: formData.ownerName,
        });
      } else {
        await bankService.create({
          bankName: formData.bankName,
          accountNumber: formData.accountNumber || undefined,
          ownerName: formData.ownerName,
          initialBalance: formData.initialBalance ? parseFloat(formData.initialBalance) : 0,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save bank account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{bankAccount ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <label>Bank Name *</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g., SBI, HDFC, PNB"
              required
            />
          </div>
          <div className="form-group">
            <label>Account Holder Name *</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder="Account holder name"
              required
            />
          </div>
          <div className="form-group">
            <label>Account Number (Optional)</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="Bank account number"
            />
          </div>
          {!bankAccount && (
            <div className="form-group">
              <label>Initial Balance (Optional)</label>
              <input
                type="number"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          )}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : bankAccount ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankModal;
