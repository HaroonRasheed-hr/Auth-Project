import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Settings.css';

export default function Settings() {
   const [username, setUsername] = useState('');
   const [currentPassword, setCurrentPassword] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [file, setFile] = useState(null);
   const [preview, setPreview] = useState(null);
   const [message, setMessage] = useState({ type: '', text: '' });
   const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

   const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
   const token = localStorage.getItem('access_token');

   useEffect(() => {
      const name = localStorage.getItem('user_username');
      const pic = localStorage.getItem('user_profile_pic');
      setUsername(name || '');
      if (pic) {
         setPreview(`${API}/static/profile_pics/${pic}`);
      }
   }, [API]);

   const handleFileChange = (e) => {
      const f = e.target.files[0];
      setFile(f || null);
      if (f) setPreview(URL.createObjectURL(f));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage({ type: '', text: '' });
      
      // Validate password change
      if (password && !currentPassword) {
         setMessage({ type: 'error', text: 'Current password required to change password' });
         return;
      }
      if (password && password !== confirmPassword) {
         setMessage({ type: 'error', text: 'Passwords do not match' });
         return;
      }
      
      setLoading(true);
      try {
         const form = new FormData();
         if (username) form.append('username', username);
         if (currentPassword) form.append('current_password', currentPassword);
         if (password) form.append('password', password);
         if (file) form.append('file', file);

         const res = await axios.put(`${API}/api/user/me`, form, {
            headers: {
               'Content-Type': 'multipart/form-data',
               Authorization: `Bearer ${token}`,
            },
         });

         const user = res.data.user;
         localStorage.setItem('user_username', user.username);
         if (user.profile_pic) localStorage.setItem('user_profile_pic', user.profile_pic);
         
         setCurrentPassword('');
         setPassword('');
         setConfirmPassword('');
         
         setMessage({ type: 'success', text: '✓ Profile updated successfully' });
         // reload to update navbar
         setTimeout(() => window.location.reload(), 800);
      } catch (err) {
         console.error(err);
         const errorMsg = err?.response?.data?.detail || err?.message || 'Update failed';
         setMessage({ type: 'error', text: errorMsg });
      } finally {
         setLoading(false);
      }
   };

   const handleDeletePic = async () => {
      if (!confirm('Are you sure you want to delete your profile photo?')) return;
      setLoading(true);
      try {
         await axios.delete(`${API}/api/user/me/photo`, { headers: { Authorization: `Bearer ${token}` } });
         localStorage.removeItem('user_profile_pic');
         setPreview(null);
         setMessage({ type: 'success', text: '✓ Profile photo deleted' });
         setTimeout(() => window.location.reload(), 800);
      } catch (err) {
         console.error(err);
         setMessage({ type: 'error', text: err?.response?.data?.detail || 'Delete failed' });
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="settings-container">
         <div className="settings-wrapper">
            <div className="settings-header">
               <h1 className="settings-title">Update Profile</h1>
               <p className="settings-subtitle">Manage your account settings and preferences</p>
            </div>

            <div className="settings-card">
               {message.text && (
                  <div className={`settings-message ${message.type}`}>
                     {message.text}
                  </div>
               )}

               <form onSubmit={handleSubmit} className="settings-form">
                  {/* Account Information Section */}
                  <div className="form-section">
                     <h3 className="form-section-title">Account Information</h3>
                     
                     <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input 
                           id="username"
                           type="text"
                           value={username} 
                           onChange={(e) => setUsername(e.target.value)}
                           placeholder="Enter your username"
                        />
                     </div>
                  </div>

                  {/* Security Section */}
                  <div className="form-section">
                     <h3 className="form-section-title">Security</h3>
                     
                     <div className="form-group forgot-link">
                        <label htmlFor="current-password">
                           Current Password
                        </label>
                        <button 
                           type="button"
                           className="forgot-password-link"
                           onClick={() => navigate('/forgot-password', { state: { from: 'settings' } })}
                        >
                           Forgot password?
                        </button>
                     </div>
                     <input 
                        id="current-password"
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Required to change password"
                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', transition: 'all 0.2s ease', background: '#f9fbfd', marginBottom: '16px' }}
                     />

                     <div className="form-group" style={{ marginTop: 16 }}>
                        <label htmlFor="new-password">New Password</label>
                        <input 
                           id="new-password"
                           type="password" 
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)}
                           placeholder="Leave blank to keep current password"
                        />
                     </div>

                     <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input 
                           id="confirm-password"
                           type="password" 
                           value={confirmPassword} 
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           placeholder="Confirm new password"
                        />
                     </div>
                  </div>

                  {/* Profile Photo Section */}
                  <div className="form-section">
                     <h3 className="form-section-title">Profile Photo</h3>
                     
                     <div className="form-group">
                        <label htmlFor="profile-pic">Upload Photo</label>
                        <input 
                           id="profile-pic"
                           type="file" 
                           accept="image/*" 
                           onChange={handleFileChange}
                        />
                     </div>

                     {preview && (
                        <div className="profile-preview-section">
                           <img 
                              src={preview} 
                              alt="preview" 
                              className="profile-preview-image"
                           />
                           <div className="profile-actions">
                              <button 
                                 type="button" 
                                 className="btn-remove"
                                 onClick={() => { setFile(null); setPreview(null); }}
                              >
                                 Remove File
                              </button>
                              <button 
                                 type="button" 
                                 className="btn-delete"
                                 onClick={handleDeletePic}
                              >
                                 Delete from Server
                              </button>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                     <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                     >
                        {loading ? '⏳ Updating...' : '✓ Update Profile'}
                     </button>
                     <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => navigate('/dashboard')}
                     >
                        ← Back
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}
