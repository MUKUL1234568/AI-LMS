import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import './Admin.css';

const Admin = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [company, setCompany] = useState<any>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await adminService.getAdminData();
            setUser(data.user);
            setCompany(data.company);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setMessage({ type: 'error', text: 'Failed to load admin data' });
        } finally {
            setLoading(false);
        }
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCompany({ ...company, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.updateAdminProfile(user);
            setMessage({ type: 'success', text: 'Admin profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update admin profile' });
        }
    };

    const updateCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminService.updateCompanyProfile(company);
            setMessage({ type: 'success', text: 'Company profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update company profile' });
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        try {
            await adminService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <p>Manage your account and company details</p>
            </div>

            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="admin-sections">
                {/* Admin Profile Section */}
                <section className="admin-card">
                    <h2>👤 Admin Profile</h2>
                    <form onSubmit={updateAdmin}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={user?.name || ''}
                                    onChange={handleUserChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user?.email || ''}
                                    onChange={handleUserChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={user?.phone || ''}
                                    onChange={handleUserChange}
                                />
                            </div>
                        </div>
                        <div className="btn-container">
                            <button type="submit" className="save-btn">Update Profile</button>
                        </div>
                    </form>
                </section>

                {/* Company Profile Section */}
                {company && (
                    <section className="admin-card">
                        <h2>🏢 Company Details</h2>
                        <form onSubmit={updateCompany}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={company.name || ''}
                                        onChange={handleCompanyChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={company.email || ''}
                                        onChange={handleCompanyChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={company.phone || ''}
                                        onChange={handleCompanyChange}
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={company.address || ''}
                                        onChange={handleCompanyChange}
                                    />
                                </div>
                            </div>
                            <div className="btn-container">
                                <button type="submit" className="save-btn">Update Company</button>
                            </div>
                        </form>
                    </section>
                )}

                {/* Security Section */}
                <section className="admin-card">
                    <h2>🔒 Security</h2>
                    <form onSubmit={changePassword}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="btn-container">
                            <button type="submit" className="save-btn">Change Password</button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Admin;
