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
            </div>
         </form>

         <div className="toggle">
            Don't have an account?
            <a onClick={onToggle} style={{ cursor: 'pointer' }}>Sign up</a>
         </div>
      </div>
   );
}
