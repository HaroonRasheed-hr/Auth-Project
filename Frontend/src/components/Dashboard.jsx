import Navbar from './Navbar';
import '../styles/Dashboard.css';

export default function Dashboard({ onLogout }) {
   const userEmail = localStorage.getItem('user_email') || 'Guest';
   const userName = localStorage.getItem('user_username') || 'User';

   return (
      <div className="dashboard-container">
         <Navbar onLogout={onLogout} />

         <div className="dashboard-content">
            <div className="welcome-section">
               <h1 className="welcome-title">Welcome to Dashboard, {userName}!</h1>
               <p className="welcome-subtitle">Here's what's happening with your account today.</p>
            </div>

            <div className="dashboard-grid">
               <div className="dashboard-card">
                  <div className="card-header">
                     <h3>Profile Information</h3>
                  </div>
                  <div className="card-body">
                     <p><strong>Email:</strong> {userEmail}</p>
                     <p><strong>Username:</strong> {userName}</p>
                     <p><strong>Account Status:</strong> Active</p>
                  </div>
               </div>

               <div className="dashboard-card">
                  <div className="card-header">
                     <h3>Quick Stats</h3>
                  </div>
                  <div className="card-body">
                     <div className="stat-item">
                        <span className="stat-label">Last Login</span>
                        <span className="stat-value">Today</span>
                     </div>
                     <div className="stat-item">
                        <span className="stat-label">Session Time</span>
                        <span className="stat-value">Just now</span>
                     </div>
                  </div>
               </div>

               <div className="dashboard-card">
                  <div className="card-header">
                     <h3>Account Settings</h3>
                  </div>
                  <div className="card-body">
                     <button className="action-btn">Change Password</button>
                     <button className="action-btn">Update Profile</button>
                  </div>
               </div>

               <div className="dashboard-card">
                  <div className="card-header">
                     <h3>Security</h3>
                  </div>
                  <div className="card-body">
                     <p>🔒 Your account is secure</p>
                     <p className="security-text">Two-factor authentication is available</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
