import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employee.service';
import { Employee } from '../../types';
import './EmployeeModal.css';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ employee, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        address: employee.address || '',
        position: employee.position || '',
        salary: employee.salary?.toString() || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        joinDate: formData.joinDate ? new Date(formData.joinDate).toISOString() : undefined,
      };

      if (employee) {
        await employeeService.update(employee.id, data);
      } else {
        await employeeService.create(data);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{employee ? 'Edit Employee' : 'Add Employee'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Join Date</label>
            <input
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
