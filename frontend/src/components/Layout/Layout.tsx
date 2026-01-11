import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../services/auth.service';
import './Layout.css';

const Layout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = authService.getUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname]);

    return (
        <div className="layout">
            <button
                className="mobile-menu-btn"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
            >
                ☰
            </button>
            <div
                className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={closeMobileMenu}
            />
            <nav className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : 'mobile-hidden'}`}>
                <div className="sidebar-header">
                    <h2>💰 LMS</h2>
                    <p>Money Lending System</p>
                </div>
                <ul className="sidebar-menu">
                    <li>
                        <Link to="/" onClick={closeMobileMenu} className={location.pathname === '/' ? 'active' : ''}>
                            <span className="menu-icon">📊</span>
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <Link to="/employees" onClick={closeMobileMenu} className={location.pathname.startsWith('/employees') ? 'active' : ''}>
                            <span className="menu-icon">👥</span>
                            Employees
                        </Link>
                    </li>
                    <li>
                        <Link to="/customers" onClick={closeMobileMenu} className={location.pathname.startsWith('/customers') ? 'active' : ''}>
                            <span className="menu-icon">🧑‍💼</span>
                            Customers
                        </Link>
                    </li>
                    <li>
                        <Link to="/investors" onClick={closeMobileMenu} className={location.pathname.startsWith('/investors') ? 'active' : ''}>
                            <span className="menu-icon">📈</span>
                            Investors
                        </Link>
                    </li>
                    <li>
                        <Link to="/banks" onClick={closeMobileMenu} className={location.pathname.startsWith('/banks') ? 'active' : ''}>
                            <span className="menu-icon">🏦</span>
                            Banks
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <div className="user-info">
                        <p>{user?.name}</p>
                        <p className="user-role">{user?.role}</p>
                    </div>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
