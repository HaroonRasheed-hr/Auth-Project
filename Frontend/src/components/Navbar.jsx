import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Navbar({ onLogout }) {
   const [showProfileMenu, setShowProfileMenu] = useState(false);
   const navigate = useNavigate();
   const userEmail = localStorage.getItem('user_email') || 'User';

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
                     {userEmail.charAt(0).toUpperCase()}
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
