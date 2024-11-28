import React, { useState } from 'react';
import './Login.css';
import Footer from './Footer';
import { useNavigate } from "react-router-dom";
import axios from 'axios';



export default function Login() {
    const [user, setUser] = useState({
        username: '',
        password: '',
    });
    const [message, setMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    }

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const { username, password } = user;
          const response = await axios.post("/api/login", { username, password });
          if (response.status === 200) {
            navigate("/"); // Navigate to notes page if login successful
          }
        } catch (error) {
          if (error.response && error.response.data.message) {
            setMessage(error.response.data.message); // Set message based on server response
          } else {
            setMessage("An error occurred. Please try again.");
          }
        }
      };

   

    return (
        <div className='login-page'>
            <div className="login-container">
                <h2>Login</h2>
                <p className='message'>{message}</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Email</label>
                        <input
                            name='username'
                            type="email"
                            id="username"
                            value={user.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            name='password'
                            type="password"
                            id="password"
                            value={user.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
            <Footer />
        </div>
    );
}