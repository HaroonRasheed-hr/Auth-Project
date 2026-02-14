import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginForm({ onToggle, onAuthSuccess }) {
   const [formData, setFormData] = useState({
      email: '',
      password: ''
   });
   const navigate = useNavigate();

   const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleLogin = async (e) => {
      e.preventDefault();
      try {
         const res = await axios.post(`${API}/api/login`, {
            email: formData.email,
            password: formData.password
         });
         const { access_token, user } = res.data;
         // store token and user info
         localStorage.setItem('access_token', access_token);
         localStorage.setItem('user_id', user.id);
         localStorage.setItem('user_email', user.email);
         localStorage.setItem('user_username', user.username);
         alert('Login successful');
         if (onAuthSuccess) {
            onAuthSuccess();
         }
         navigate('/dashboard');
      } catch (err) {
         console.error(err);
         alert(err?.response?.data?.detail || 'Login failed');
      } finally {
         setFormData({ email: '', password: '' });
      }
   };

   return (
      <div className="card">
         <p className="lead">Welcome back — enter your details to sign in.</p>
         <h2>Login</h2>

         <form onSubmit={handleLogin}>
            <div className="form-grid single">
               <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
               />
               <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
               />
            </div>

            <div className="forgot">
               <a onClick={() => navigate('/forgot-password')} style={{ cursor: 'pointer' }}>Forgot Password?</a>
            </div>

            <div className="actions">
               <button type="submit" className="primary">Login</button>
               <div className="socials">
                  <button type="button" className="social-btn google">
                     <span className="icon google-icon" aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" focusable="false">
                           <path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-37-5-54.6H272v103.3h146.9c-6.3 34-25.1 62.9-53.6 82v68.4h86.6c50.6-46.6 80.6-115.4 80.6-199.1z" />
                           <path fill="#34A853" d="M272 544.3c72 0 132.6-23.9 176.8-65l-86.6-68.4c-24.5 16.4-56 26-90.2 26-69 0-127.5-46.6-148.5-109.3H34.3v68.6C78.5 482 168.7 544.3 272 544.3z" />
                           <path fill="#FBBC05" d="M123.5 328.6c-10.8-32.6-10.8-67.9 0-100.5V159.5H34.3c-38.2 76.8-38.2 167.5 0 244.3l89.2-75.2z" />
                           <path fill="#EA4335" d="M272 107.7c37.7 0 71.5 12.9 98.3 34.6l73.7-73.7C404.9 24.6 344.3 0 272 0 168.7 0 78.5 62.3 34.3 159.5l89.2 68.6C144.5 154.3 203 107.7 272 107.7z" />
                        </svg>
                     </span>
                     Continue with Google
                  </button>
                  <button type="button" className="social-btn facebook">
                     <span className="icon facebook-icon" aria-hidden="true">
                        <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" focusable="false">
                           <path fill="#1877F2" d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24H12.82v-9.294H9.692V11.01h3.127V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.797.142v3.24h-1.918c-1.504 0-1.796.715-1.796 1.763v2.312h3.587l-.467 3.696h-3.12V24h6.116C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z" />
                        </svg>
                     </span>
                     Continue with Facebook
                  </button>
               </div>
            </div>
         </form>

         <div className="toggle">
            Don't have an account?
            <a onClick={onToggle} style={{ cursor: 'pointer' }}>Sign up</a>
         </div>
      </div>
   );
}
