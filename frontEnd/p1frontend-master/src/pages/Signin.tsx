import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/signin.css';
// import logo from '../pictures/logo.png';

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        const url = "http://localhost:9090/api/auth"; // Adjust URL as needed
        const dto = {
            username: username,
            password: password
        };
        const headers = {
            "Content-Type": "application/json"
        };
        const req = {
            method: "POST",
            body: JSON.stringify(dto),
            headers: headers
        };

        try {
            const response = await fetch(url, req);

            if (response.ok) {
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    const responseBody = await response.json();
                    console.log("Login Response Body:", responseBody);
                    login(responseBody); 
                } else {
                    throw new Error('Expected JSON response but received something else.');
                }
            } else {
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    setErrorMessage(errorData.message || "An error occurred during sign-in.");
                } else {
                    setErrorMessage("An error occurred during sign-in. Please try again.");
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message || "Network error occurred. Please try again later.");
            } else {
                setErrorMessage("An unknown error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
                <div className='bodySignin'>
        <form className="form-signin " onSubmit={handleSubmit}>
            {/* <img className="mb-4" src={logo} alt="Logo" width="72" height="72" /> */}
            <h1 className="h3 mb-3 font-weight-normal">Please sign in</h1>
            <label htmlFor="username" className="sr-only">Username</label>
            <input
                type="text"
                id="username"
                className="form-control"
                placeholder="Username"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                />
            <label htmlFor="inputPassword" className="sr-only">Password</label>
            <input
                type="password"
                id="inputPassword"
                className="form-control"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
            <div className="checkbox mb-3">
                <label>
                    <input type="checkbox" value="remember-me" /> Remember me
                </label>
            </div>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <button className="btn btn-lg btn-primary btn-block" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
            </button>
            <div className="mt-3">
                <label>Don't have an account yet? Click to <Link to="/signup" className="btn btn-link">Register</Link></label>
            </div>
            <p className="mt-5 mb-3 text-muted">&copy; 2024</p>
        </form>

                </div>
    );
};

export default Signin;
