import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SignupForm({ onToggle, onAuthSuccess }) {
   const [formData, setFormData] = useState({
      fullName: '',
      organization: '',
      country: '',
      website: '',
      email: '',
      password: '',
      confirmPassword: '',
      qualification: '',
      field: ''
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

   const handleSignup = async (e) => {
      e.preventDefault();

      if (formData.password !== formData.confirmPassword) {
         alert("Passwords do not match!");
         return;
      }

      try {
         const payload = {
            username: formData.fullName,
            email: formData.email,
            password: formData.password
         };
         const response = await axios.post(`${API}/api/signup`, payload);
         alert('Signup successful! Logging in...');
         localStorage.setItem('access_token', response.data.access_token);
         localStorage.setItem('user_id', response.data.user.id);
         localStorage.setItem('user_email', response.data.user.email);
         localStorage.setItem('user_username', response.data.user.username);
         setFormData({
            fullName: '',
            organization: '',
            country: '',
            website: '',
            email: '',
            password: '',
            confirmPassword: '',
            qualification: '',
            field: ''
         });
         if (onAuthSuccess) {
            onAuthSuccess();
         }
         navigate('/dashboard');
      } catch (err) {
         console.error(err);
         alert(err?.response?.data?.detail || 'Signup failed');
      }
   };

   return (
      <div className="card">
         <p className="lead">Start your free account — we'll never share your details.</p>
         <h2>Create account</h2>

         <form onSubmit={handleSignup}>
            <div className="form-grid">
               <input
                  type="text"
                  name="fullName"
                  placeholder="Full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
               />
               <input
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={handleChange}
                  required
               />

               <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
               />
               <input
                  type="text"
                  name="website"
                  placeholder="Website"
                  value={formData.website}
                  onChange={handleChange}
                  required
               />

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
               <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
               />

               <div className="select-wrap">
                  <select
                     name="qualification"
                     value={formData.qualification}
                     onChange={handleChange}
                     required
                  >
                     <option value="">Qualification</option>
                     <option value="matric">Matric</option>
                     <option value="intermediate">Intermediate</option>
                     <option value="bachelor">Bachelor</option>
                     <option value="master">Master</option>
                  </select>
               </div>

               <div className="select-wrap">
                  <select
                     name="field"
                     value={formData.field}
                     onChange={handleChange}
                     required
                  >
                     <option value="">Field</option>
                     <option value="software-engineering">Software Engineering</option>
                     <option value="information-technology">Information Technology</option>
                     <option value="business">Business</option>
                     <option value="machine-learning">Machine Learning</option>
                     <option value="ai">AI</option>
                     <option value="other">Other</option>
                  </select>
               </div>
            </div>

            <div className="actions">
               <button type="submit" className="primary">Create account</button>
            </div>
         </form>

         <div className="toggle">
            Already have an account?
            <a onClick={onToggle} style={{ cursor: 'pointer' }}>Log in</a>
         </div>
      </div>
   );
}
