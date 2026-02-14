import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword({ onToggle }) {
   const [step, setStep] = useState(1); // 1: Enter email, 2: Confirm email
   const [email, setEmail] = useState('');
   const [token, setToken] = useState('');
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();

   const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

   const handleCheckEmail = async (e) => {
      e.preventDefault();
      setError('');
      setMessage('');
      setLoading(true);

      try {
         const response = await axios.post(`${API}/api/forgot-password`, {
            email: email.toLowerCase()
         });

         setToken(response.data.token);
         setStep(2);
         setMessage('Email found! A reset link has been generated.');
      } catch (err) {
         if (err.response?.status === 404) {
            setError('Email not found. Click "Sign Up" to create a new account.');
         } else {
            setError(err.response?.data?.detail || 'An error occurred');
         }
      } finally {
         setLoading(false);
      }
   };

   const handleResetPassword = () => {
      navigate(`/reset-password/${token}`);
   };

   return (
      <div className="card">
         <p className="lead">Recover your account access</p>
         <h2>Forgot Password</h2>

         {step === 1 ? (
            <form onSubmit={handleCheckEmail}>
               <div className="form-grid single">
                  <input
                     type="email"
                     placeholder="Enter your email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
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
                     {loading ? 'Checking...' : 'Check Email'}
                  </button>
               </div>
            </form>
         ) : (
            <div style={{ textAlign: 'center' }}>
               <p style={{ color: '#27ae60', marginBottom: '20px' }}>✓ Email sent successfully!</p>
               <p style={{ marginBottom: '20px', color: '#555' }}>
                  Check your inbox for the password reset email. Click the reset link in the email to proceed.
               </p>
               <p style={{ marginBottom: '20px', color: '#7f8c8d', fontSize: '14px' }}>
                  If you don't see it, check your spam folder.
               </p>

               <div className="actions">
                  <button
                     onClick={handleResetPassword}
                     className="primary"
                  >
                     Or Click Here to Reset Password
                  </button>
               </div>
            </div>
         )}

         <div className="toggle">
            Remember your password?
            <a onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Log in</a>
         </div>
         <div className="toggle">
            Don't have an account?
            <a onClick={onToggle} style={{ cursor: 'pointer' }}>Sign up</a>
         </div>
      </div>
   );
}
