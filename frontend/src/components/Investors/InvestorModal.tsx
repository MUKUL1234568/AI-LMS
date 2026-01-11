import { useState, useEffect } from 'react';
import { investorService } from '../../services/investor.service';
import { Investor } from '../../types';
import { BASE_URL } from '../../services/api';
import './InvestorModal.css';

interface InvestorModalProps {
  investor: Investor | null;
  onClose: () => void;
}

const InvestorModal: React.FC<InvestorModalProps> = ({ investor, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    idNumber: '',
    aadhaarNumber: '',
    panNumber: '',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null);
  const [panImage, setPanImage] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (investor) {
      setFormData({
        name: investor.name,
        email: investor.email || '',
        phone: investor.phone,
        address: investor.address || '',
        idNumber: investor.idNumber || '',
        aadhaarNumber: investor.aadhaarNumber || '',
        panNumber: investor.panNumber || '',
      });
      if (investor.photo) {
        setPhotoPreview(`${BASE_URL}${investor.photo}`);
      }
      if (investor.signature) {
        setSignaturePreview(`${BASE_URL}${investor.signature}`);
      }
      if (investor.aadhaarImage) {
        setAadhaarPreview(`${BASE_URL}${investor.aadhaarImage}`);
      }
      if (investor.panImage) {
        setPanPreview(`${BASE_URL}${investor.panImage}`);
      }
    }
  }, [investor]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignature(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAadhaarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAadhaarImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAadhaarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePanImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPanImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPanPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phone', formData.phone);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.idNumber) formDataToSend.append('idNumber', formData.idNumber);
      if (formData.aadhaarNumber) formDataToSend.append('aadhaarNumber', formData.aadhaarNumber);
      if (formData.panNumber) formDataToSend.append('panNumber', formData.panNumber);
      if (photo) formDataToSend.append('photo', photo);
      if (signature) formDataToSend.append('signature', signature);
      if (aadhaarImage) formDataToSend.append('aadhaarImage', aadhaarImage);
      if (panImage) formDataToSend.append('panImage', panImage);

      if (investor) {
        await investorService.update(investor.id, formDataToSend);
      } else {
        await investorService.create(formDataToSend);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save investor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{investor ? 'Edit Investor' : 'Add Investor'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          <div className="form-row">
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
              <label>Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>ID Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Aadhaar Number</label>
              <input
                type="text"
                value={formData.aadhaarNumber}
                onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {photoPreview && (
                <div className="image-preview">
                  <img src={photoPreview} alt="Photo preview" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Signature</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureChange}
              />
              {signaturePreview && (
                <div className="image-preview">
                  <img src={signaturePreview} alt="Signature preview" />
                </div>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Aadhaar Card Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAadhaarImageChange}
              />
              {aadhaarPreview && (
                <div className="image-preview">
                  <img src={aadhaarPreview} alt="Aadhaar preview" />
                </div>
              )}
            </div>
            <div className="form-group">
              <label>PAN Card Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePanImageChange}
              />
              {panPreview && (
                <div className="image-preview">
                  <img src={panPreview} alt="PAN preview" />
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : investor ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestorModal;
