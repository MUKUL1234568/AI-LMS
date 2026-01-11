import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customer.service';
import { Customer } from '../../types';
import CustomerModal from './CustomerModal';
import './Customers.css';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccumulating, setIsAccumulating] = useState(false);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(query);
      const phoneMatch = customer.phone.toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    });
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleAccumulateInterest = async () => {
    if (isAccumulating) return;

    setIsAccumulating(true);
    try {
      await customerService.accumulateInterestForAll();
      // Refresh the customer list to show updated interest
      await fetchCustomers();
    } catch (error) {
      console.error('Error accumulating interest:', error);
      alert('Failed to accumulate interest. Please try again.');
    } finally {
      setIsAccumulating(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    // Paths are already in format /uploads/photos/... so we use them directly
    // No need for API_URL prefix since vite proxy handles /uploads
    return path;
  };

  const getTotalPrincipal = () => {
    return customers.reduce((sum, customer) => sum + (customer.principalAmount || 0), 0);
  };

  const getTotalInterest = () => {
    return customers.reduce((sum, customer) => sum + (customer.accumulatedInterest || 0), 0);
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

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title">
          <span className="page-title-icon">🧑‍💼</span>
          <h1>Customers</h1>
        </div>
        <div className="header-actions">
          {customers.length > 0 && (
            <button
              onClick={handleAccumulateInterest}
              className="btn btn-accumulate"
              disabled={isAccumulating}
            >
              {isAccumulating ? 'Accumulating...' : 'Accumulate Interest'}
            </button>
          )}
          <button onClick={handleCreate} className="btn btn-primary">
            Add Customer
          </button>
        </div>
      </div>

      {/* Total Summary */}
      {customers.length > 0 && (
        <div className="customer-summary-card">
          <div className="summary-item principal-summary">
            <span className="summary-label">Total Principal Amount</span>
            <span className="summary-value principal-value">{formatCurrency(getTotalPrincipal())}</span>
          </div>
          <div className="summary-item interest-summary">
            <span className="summary-label">Total Accumulated Interest</span>
            <span className="summary-value interest-value">{formatCurrency(getTotalInterest())}</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="card">
          <p>No customers found. Click "Add Customer" to get started.</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="card">
          <p>No customers match your search.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Principal Amount</th>
                <th>Accumulated Interest</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => navigate(`/customers/${customer.id}`)}
                  className="clickable-row"
                >
                  <td>
                    {customer.photo ? (
                      <img
                        src={getImageUrl(customer.photo)!}
                        alt={customer.name}
                        className="customer-photo"
                      />
                    ) : (
                      <div className="no-photo">
                        <span className="avatar-icon">👤</span>
                      </div>
                    )}
                  </td>
                  <td><span className="cell-name">{customer.name}</span></td>
                  <td><span className="cell-phone">{customer.phone}</span></td>
                  <td><span className="cell-amount principal">₹{customer.principalAmount.toFixed(2)}</span></td>
                  <td><span className="cell-amount interest">₹{customer.accumulatedInterest.toFixed(2)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateModalOpen && (
        <CustomerModal
          customer={null}
          onClose={() => {
            setIsCreateModalOpen(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default Customers;
