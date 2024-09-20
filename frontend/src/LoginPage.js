import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import axios from 'axios'; // Import axios for API calls

function LoginPage() {
  const [username, setUsername] = useState(''); // Username state
  const [password, setPassword] = useState(''); // Password state
  const [errorMessage, setErrorMessage] = useState(''); // Error message state

  const navigate = useNavigate(); // Get the navigate function

  // Handle username input change
  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  // Handle password input change
  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Handle form submit and make an API call to login
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    try {
      // Make API call to backend for admin login
      const response = await axios.post('http://127.0.0.1:8000/admin_login/', {
        admin_name: username, // Send username as admin_name
        password: password, // Send password
      });

      // If login is successful, handle the token
      if (response.data.message === 'Login successful.') {
        const { token } = response.data;

        // Store the token in localStorage or sessionStorage
        localStorage.setItem('authToken', token);

        // Redirect to the Statistics page on success
        navigate('/Statistics');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setErrorMessage('Username does not exist.');
      } else if (error.response && error.response.status === 401) {
        setErrorMessage('Incorrect password.');
      } else {
        setErrorMessage('Error logging in. Please try again.');
      }
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body">
          <h2 className="card-title text-center">Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ padding: '10px 0' }}>
              <label htmlFor="username" style={{ paddingBottom: '5px' }}>Username</label>
              <input 
                type="text" 
                className="form-control" 
                id="username" 
                value={username} 
                onChange={handleUsernameChange} 
                style={{ padding: '10px' }} 
                required 
              />
            </div>
            <div className="form-group" style={{ padding: '10px 0' }}>
              <label htmlFor="password" style={{ paddingBottom: '5px' }}>Password</label>
              <input 
                type="password" 
                className="form-control" 
                id="password" 
                value={password} 
                onChange={handlePasswordChange} 
                style={{ padding: '10px' }} 
                required 
              />
            </div>
            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success">Login</button>
            </div>
          </form>
          {errorMessage && <p className="text-danger text-center mt-3">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
