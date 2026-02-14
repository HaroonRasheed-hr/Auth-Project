import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/ForgotPassword.css';

export default function ForgotPassword({ onToggle }) {
   const [step, setStep] = useState(1); // 1: Enter email, 2: Email sent
   const [email, setEmail] = useState('');
   const [token, setToken] = useState('');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState({ type: '', text: '' });
   const navigate = useNavigate();
   const location = useLocation();

   const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
   const isFromSettings = location.state?.from === 'settings';

   const handleCheckEmail = async (e) => {
      e.preventDefault();
      setMessage({ type: '', text: '' });
      
      if (!email.trim()) {
         setMessage({ type: 'error', text: 'Please enter your email address' });
         return;
      }

      setLoading(true);

      try {
         const response = await axios.post(`${API}/api/forgot-password`, {
            email: email.toLowerCase()
         });

         setToken(response.data.token);
         setStep(2);
         setMessage({ type: 'success', text: '✓ Reset email sent successfully!' });
      } catch (err) {
         if (err.response?.status === 404) {
            setMessage({ type: 'error', text: 'Email not found in our system' });
         } else {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'An error occurred' });
         }
      } finally {
         setLoading(false);
      }
   };

   const handleResetPassword = () => {
      navigate(`/reset-password/${token}`);
   };

   const handleBack = () => {
      if (isFromSettings) {
         navigate('/settings');
      } else {
         navigate('/');
      }
   };

   return (
      <div className="forgot-password-container">
         <div className="forgot-password-wrapper">
            <div className="forgot-password-header">
               <h1 className="forgot-password-title">Reset Your Password</h1>
               <p className="forgot-password-subtitle">Enter your email to receive a password reset link</p>
            </div>

            <div className="forgot-password-card">
               {step === 1 ? (
                  <>
                     {message.text && (
                        <div className={`forgot-message ${message.type}`}>
                           {message.text}
                        </div>
                     )}

                     <form onSubmit={handleCheckEmail} className="forgot-form">
                        <div className="form-group">
                           <label htmlFor="email">Email Address</label>
                           <input
                              id="email"
                              type="email"
                              placeholder="Enter your registered email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              disabled={loading}
                              autoFocus
                           />
                        </div>

                        <button
                           type="submit"
                           className="btn-primary"
                           disabled={loading}
                        >
                           {loading ? '⏳ Sending...' : '→ Send Reset Link'}
                        </button>
                     </form>
                  </>
               ) : (
                  <div className="success-section">
                     <div className="success-icon">✓</div>
                     <h2 className="success-title">Email Sent!</h2>
                     <p className="success-message">
                        We've sent a password reset link to <strong>{email}</strong>
                     </p>
                     <p className="success-info">
                        Check your inbox and click the link to reset your password. If you don't see it within a few minutes, check your spam folder.
                     </p>

                     <button
                        onClick={handleResetPassword}
                        className="btn-primary"
                     >
                        → Reset Password Now
                     </button>
                  </div>
               )}

               <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleBack}
                  style={{ marginTop: '16px' }}
               >
                  ← {isFromSettings ? 'Back to Settings' : 'Back to Login'}
               </button>
            </div>
         </div>
      </div>
   );
}
