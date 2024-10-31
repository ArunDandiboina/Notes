import React, { useState } from 'react';
import './Signup.css';
import Footer from './Footer';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
    const [user, setUser] = useState({
        username: '',
        password: '',
    });
    const [message, setMessage] = useState("  ");
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { username, password } = user;
            const response = await axios.post("/api/register", { username, password });
            if (response.status === 201) {
                navigate("/"); // Navigate to home page or notes page
            }
        } catch (error) {
            if (error.response && error.response.status === 409) {
                setMessage("User already exists");
            } else {
                setMessage("An error occurred. Please try again.");
            }
        }
    };

    return (
        <div className='signup-page'>
            <div className="signup-container">
                <h2>Sign Up</h2>
                <p className='message'>{message}</p>
                <form onSubmit={handleSubmit} className="signup-form">
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
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
            </div>
            <p className="gap"> </p>
            <Footer />
        </div>
    );
}
