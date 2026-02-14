import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResetPassword() {
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();
   const { token } = useParams();

   const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

   const handleResetPassword = async (e) => {
      e.preventDefault();
      setError('');
      setMessage('');

      // Validation
      if (password.length < 6) {
         setError('Password must be at least 6 characters long');
         return;
      }

      if (password !== confirmPassword) {
         setError('Passwords do not match');
         return;
      }

      setLoading(true);

      try {
         const response = await axios.post(`${API}/api/reset-password`, {
            token: token,
            password: password,
            confirm_password: confirmPassword
         });

         setMessage(response.data.message || 'Password reset successfully!');
         setPassword('');
         setConfirmPassword('');

         // Redirect to login after success
         setTimeout(() => {
            navigate('/');
         }, 2000);
      } catch (err) {
         const errorMsg = err.response?.data?.detail || 'An error occurred';
         setError(errorMsg);
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="card">
         <p className="lead">Create a new password</p>
         <h2>Reset Password</h2>

         <form onSubmit={handleResetPassword}>
            <div className="form-grid single">
               <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
               />
            </div>

            <div className="form-grid single">
               <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
               />
            </div>

            {error && <p style={{ color: '#e74c3c', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
            {message && <p style={{ color: '#27ae60', marginBottom: '15px', textAlign: 'center' }}>{message}</p>}

            <div className="actions">
               <button
                  type="submit"
                  className="primary"
                  disabled={loading}
               >
                  {loading ? 'Resetting...' : 'Reset Password'}
               </button>
            </div>
         </form>

         <div className="toggle">
            Remember your password?
            <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Log in</a>
         </div>
      </div>
   );
}
