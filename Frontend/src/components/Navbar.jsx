import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Navbar({ onLogout }) {
   const [showProfileMenu, setShowProfileMenu] = useState(false);
   const navigate = useNavigate();
   const userEmail = localStorage.getItem('user_email') || 'User';
   const profilePic = localStorage.getItem('user_profile_pic') || null;
   const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

   const handleLogout = () => {
      if (onLogout) {
         onLogout();
      }
      navigate('/');
   };

   return (
      <nav className="navbar">
         <div className="navbar-container">
            <div className="navbar-brand">
               <h1>Dashboard</h1>
            </div>

            <div className="navbar-menu">
               <button
                  className="nav-btn"
                  onClick={() => navigate('/dashboard')}
               >
                  Home
               </button>
               <button className="nav-btn">Analytics</button>
               <button className="nav-btn">Settings</button>
            </div>

            <div className="navbar-profile">
               <div
                  className="profile-btn"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
               >
                  <div className="profile-avatar">
                     {profilePic ? (
                        <img src={`${API}/static/profile_pics/${profilePic}`} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                     ) : (
                        userEmail.charAt(0).toUpperCase()
                     )}
                  </div>
                  <span className="profile-email">{userEmail}</span>
                  <span className="dropdown-icon">▼</span>
               </div>

               {showProfileMenu && (
                  <div className="profile-dropdown">
                     <button
                        className="dropdown-item"
                        onClick={() => navigate('/settings')}
                     >
                        Settings
                     </button>
                     <button
                        className="dropdown-item logout"
                        onClick={handleLogout}
                     >
                        Logout
                     </button>
                  </div>
               )}
            </div>
         </div>
      </nav>
   );
}
