import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../../services/investor.service';
import { BASE_URL } from '../../services/api';
import { Investor } from '../../types';
import InvestorModal from './InvestorModal';
import './Investors.css';

const Investors = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccumulating, setIsAccumulating] = useState(false);

  const fetchInvestors = async () => {
    try {
      const data = await investorService.getAll();
      setInvestors(data);
      setFilteredInvestors(data);
    } catch (error) {
      console.error('Error fetching investors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredInvestors(investors);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = investors.filter((investor) => {
      const nameMatch = investor.name.toLowerCase().includes(query);
      const phoneMatch = investor.phone.toLowerCase().includes(query);
      return nameMatch || phoneMatch;
    });
    setFilteredInvestors(filtered);
  }, [searchQuery, investors]);

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleAccumulateInterest = async () => {
    if (isAccumulating) return;

    setIsAccumulating(true);
    try {
      await investorService.accumulateInterestForAll();
      // Refresh the investor list to show updated interest
      await fetchInvestors();
    } catch (error) {
      console.error('Error accumulating interest:', error);
      alert('Failed to accumulate interest. Please try again.');
    } finally {
      setIsAccumulating(false);
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    return `${BASE_URL}${path}`;
  };

  const getTotalPrincipal = () => {
    return investors.reduce((sum, investor) => sum + (investor.principalAmount || 0), 0);
  };

  const getTotalInterest = () => {
    return investors.reduce((sum, investor) => sum + (investor.accumulatedInterest || 0), 0);
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
          <span className="page-title-icon">📈</span>
          <h1>Investors</h1>
        </div>
        <div className="header-actions">
          {investors.length > 0 && (
            <button
              onClick={handleAccumulateInterest}
              className="btn btn-accumulate"
              disabled={isAccumulating}
            >
              {isAccumulating ? 'Accumulating...' : 'Accumulate Interest'}
            </button>
          )}
          <button onClick={handleCreate} className="btn btn-primary">
            Add Investor
          </button>
        </div>
      </div>

      {/* Total Summary */}
      {investors.length > 0 && (
        <div className="investor-summary-card">
          <div className="summary-item principal-summary">
            <span className="summary-label">Total Loan Owed</span>
            <span className="summary-value principal-value">{formatCurrency(getTotalPrincipal())}</span>
          </div>
          <div className="summary-item interest-summary">
            <span className="summary-label">Total Interest Owed</span>
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

      {investors.length === 0 ? (
        <div className="card">
          <p>No investors found. Click "Add Investor" to get started.</p>
        </div>
      ) : filteredInvestors.length === 0 ? (
        <div className="card">
          <p>No investors match your search.</p>
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
              {filteredInvestors.map((investor) => (
                <tr
                  key={investor.id}
                  onClick={() => navigate(`/investors/${investor.id}`)}
                  className="clickable-row"
                >
                  <td>
                    {investor.photo ? (
                      <img
                        src={getImageUrl(investor.photo)!}
                        alt={investor.name}
                        className="investor-photo"
                      />
                    ) : (
                      <div className="no-photo">
                        <span className="avatar-icon">👤</span>
                      </div>
                    )}
                  </td>
                  <td><span className="cell-name">{investor.name}</span></td>
                  <td><span className="cell-phone">{investor.phone}</span></td>
                  <td><span className="cell-amount investor-principal">₹{investor.principalAmount.toFixed(2)}</span></td>
                  <td><span className="cell-amount investor-interest">₹{investor.accumulatedInterest.toFixed(2)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isCreateModalOpen && (
        <InvestorModal
          investor={null}
          onClose={() => {
            setIsCreateModalOpen(false);
            fetchInvestors();
          }}
        />
      )}
    </div>
  );
};

export default Investors;
