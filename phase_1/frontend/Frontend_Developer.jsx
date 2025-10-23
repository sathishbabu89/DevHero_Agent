Here's a complete React.js login page implementation with form validation and authentication integration:

**1. Project Structure Setup**

First, create the necessary files:
```
src/
├── components/
│   └── Login.js
├── services/
│   └── authService.js
├── styles/
│   └── Login.scss
├── utils/
│   └── constants.js
└── App.js
```

**2. Login Component with Form Validation**

```jsx
// src/components/Login.js
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.scss';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await axios.post('/api/auth/login', values);
        
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please sign in to your account</p>
        </div>
        
        <form onSubmit={formik.handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
              placeholder="Enter your email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="field-error">{formik.errors.email}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`form-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="field-error">{formik.errors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>

          <div className="login-footer">
            <p>
              Don't have an account? <Link to="/register">Sign up</Link>
            </p>
            <Link to="/forgot-password" className="forgot-password">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
```

**3. Authentication Service**

```javascript
// src/services/authService.js
import axios from 'axios';

// Set base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export default api;
```

**4. SCSS Styling**

```scss
// src/styles/Login.scss
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

$primary-color: #007bff;
$primary-hover: #0056b3;
$error-color: #dc3545;
$success-color: #28a745;
$text-color: #333;
$border-color: #ddd;
$background-color: #f8f9fa;
$white: #ffffff;
$shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
  padding: 20px;

  .login-form-wrapper {
    background: $white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: $shadow;
    width: 100%;
    max-width: 400px;
    animation: slideUp 0.5s ease-out;

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        color: $text-color;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 28px;
      }

      p {
        color: lighten($text-color, 20%);
        font-size: 14px;
        margin: 0;
      }
    }

    .login-form {
      .error-message {
        background: lighten($error-color, 42%);
        color: $error-color;
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 20px;
        border-left: 4px solid $error-color;
        font-size: 14px;
        font-weight: 500;
      }

      .form-group {
        margin-bottom: 20px;

        label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: $text-color;
          font-size: 14px;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid $border-color;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          box-sizing: border-box;

          &:focus {
            outline: none;
            border-color: $primary-color;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          }

          &.error {
            border-color: $error-color;
          }
        }

        .field-error {
          color: $error-color;
          font-size: 12px;
          margin-top: 4px;
          font-weight: 500;
        }
      }

      .login-button {
        width: 100%;
        padding: 14px;
        background: $primary-color;
        color: $white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;

        &:hover:not(:disabled) {
          background: $primary-hover;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        &:disabled {
          background: lighten($primary-color, 20%);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }

      .login-footer {
        text-align: center;
        font-size: 14px;

        p {
          margin-bottom: 12px;
          color: lighten($text-color, 20%);

          a {
            color: $primary-color;
            text-decoration: none;
            font-weight: 500;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .forgot-password {
          color: $primary-color;
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }
}

// Responsive design
@media (max-width: 480px) {
  .login-container {
    padding: 10px;

    .login-form-wrapper {
      padding: 30px 20px;
    }
  }
}
```

**5. App.js with Routing**

```jsx
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { authService } from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

**6. Dashboard Component (Example)**

```jsx
// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
```

**7. Package.json Dependencies**

Make sure your package.json includes these dependencies:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "formik": "^2.2.9",
    "yup": "^1.0.0"
  },
  "devDependencies": {
    "sass": "^1.58.0"
  }
}
```

**8. Environment Configuration**

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001/api
```

**Key Features Implemented:**

1. **Form Validation**: Using Formik with Yup schema validation for email and password fields
2. **Authentication Integration**: Axios for API calls with proper error handling
3. **Routing**: React Router with protected and public routes
4. **Styling**: Modern SCSS styling with responsive design
5. **State Management**: Loading states and error handling
6. **Security**: Token storage and automatic token inclusion in requests
7. **User Experience**: Form validation messages, loading states, and smooth transitions

This implementation provides a complete, production-ready login page with all the specified requirements and best practices for React.js development.