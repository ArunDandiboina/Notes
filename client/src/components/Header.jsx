import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import {Navigate } from "react-router-dom";

export default function Header() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await axios.get('/api/auth/check');
                console.log("Auth check response:", response.data.auth); // Debugging log
                if (response.data.auth == 200) {
                    setIsAuthenticated(true);
                    // console.log(isAuthenticated);

                } else {
                    setIsAuthenticated(false);
                    // console.log(isAuthenticated);
                }
            } catch (error) {
                console.error("Auth check error:", error); // Debugging log for error
                setIsAuthenticated(false);
            }
        };
        checkAuthStatus();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await axios.get('/api/logout');
            console.log("Logout response:", response); // Debugging log
            setIsAuthenticated(false);
            window.location.href = '/'; // Redirect to home page after logout
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.hamburger')) {
                closeMenu();
            }
        };

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <header>
            <h1>Notes</h1>
            <p>{isAuthenticated}</p>
            <nav className={`nav ${menuOpen ? 'open' : ''}`}>
                {isAuthenticated ? (
                    <button className="nav-button logout" onClick={handleLogout}>
                        Log Out
                    </button>
                ) : (
                    <>
                        <button className="nav-button log"><a href='/Login'>Log In</a></button>
                        <button className="nav-button sign"><a href='/SignUp'>Sign Up</a></button>
                    </>
                )}
            </nav>
            <div className="hamburger" onClick={toggleMenu}>
                &#9776;
            </div>
        </header>
    );
}
