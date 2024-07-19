import React from 'react';
import './Login.css';
import logo from './images/Logo.png';

function Login() {
  return (
    <div className="login-container">
      <div className="login-form">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <form>
          <label className="form-label" htmlFor="email">Email address</label>
          <input className="form-control" type="email" id="email" placeholder="Enter email" />
          
          <label className="form-label" htmlFor="password">Password</label>
          <input className="form-control" type="password" id="password" placeholder="Password" />
          
          <button className="submit-btn" type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default Login;