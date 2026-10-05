import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "../css/Register.css";


const API =
    import.meta.env.VITE_API_URL;


const Register = () => {

    const navigate = useNavigate();


    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value
        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");
        setSuccess("");


        const {
            name,
            email,
            password,
            confirmPassword
        } = formData;


        // Basic validation
        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            setError(
                "Please fill in all fields."
            );

            return;
        }


        if (
            name.trim().length < 2
        ) {

            setError(
                "Name must be at least 2 characters."
            );

            return;
        }


        if (password.length < 6) {

            setError(
                "Password must be at least 6 characters."
            );

            return;
        }


        if (
            password !== confirmPassword
        ) {

            setError(
                "Passwords do not match."
            );

            return;
        }


        if (!API) {

            setError(
                "API configuration is missing."
            );

            return;
        }


        try {

            setLoading(true);


            console.log(
                "Register API:",
                `${API}/auth/register`
            );


            await axios.post(
                `${API}/auth/register`,
                {
                    name: name.trim(),
                    email: email.trim(),
                    password
                }
            );


            setSuccess(
                "Account created successfully! Redirecting to login..."
            );


            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });


            setTimeout(() => {

                navigate("/login");

            }, 1500);


        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            setError(
                error.response?.data?.message ||
                error.message ||
                "Registration failed. Please try again."
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="register-page">

            {/* Background */}
            <div className="register-background">

                <div className="register-glow register-glow-one"></div>

                <div className="register-glow register-glow-two"></div>

                <div className="register-glow register-glow-three"></div>

            </div>


            <div className="register-container">

                {/* Logo */}
                <div className="register-logo">

                    <div className="register-logo-icon">

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>


                    <h1>

                        Bubble{" "}

                        <span>
                            Meet
                        </span>

                    </h1>

                </div>


                {/* Heading */}
                <div className="register-heading">

                    <h2>
                        Create Your Account 🚀
                    </h2>


                    <p>
                        Join Bubble Meet and start connecting
                        with people in real time.
                    </p>

                </div>


                {/* Register Card */}
                <div className="register-card">

                    <form
                        onSubmit={handleSubmit}
                    >

                        {/* Name */}
                        <div className="register-input-group">

                            <label>
                                Full Name
                            </label>


                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    👤
                                </span>


                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    autoComplete="name"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Email */}
                        <div className="register-input-group">

                            <label>
                                Email Address
                            </label>


                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    ✉
                                </span>


                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Password */}
                        <div className="register-input-group">

                            <label>
                                Password
                            </label>


                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    🔒
                                </span>


                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                            </div>


                            <small>
                                Password must contain at least 6 characters.
                            </small>

                        </div>


                        {/* Confirm Password */}
                        <div className="register-input-group">

                            <label>
                                Confirm Password
                            </label>


                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    🔐
                                </span>


                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                            </div>

                        </div>


                        {/* Error */}
                        {error && (

                            <div className="register-message register-error">

                                ⚠ {error}

                            </div>

                        )}


                        {/* Success */}
                        {success && (

                            <div className="register-message register-success">

                                ✓ {success}

                            </div>

                        )}


                        {/* Button */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >

                            {loading ? (

                                <>

                                    <span className="register-loader"></span>

                                    Creating Account...

                                </>

                            ) : (

                                <>

                                    Create Account

                                    <span>
                                        →
                                    </span>

                                </>

                            )}

                        </button>

                    </form>


                    {/* Divider */}
                    <div className="register-divider">

                        <span>
                            SECURE REGISTRATION
                        </span>

                    </div>


                    {/* Login */}
                    <div className="login-link">

                        <span>
                            Already have an account?
                        </span>


                        <Link to="/login">
                            Sign In
                        </Link>

                    </div>

                </div>


                {/* Security */}
                <div className="register-security">

                    <span className="register-security-dot"></span>

                    Your information is securely protected

                </div>


                {/* Footer */}
                <div className="register-footer">

                    <span>
                        🔒 Secure Authentication
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        Bubble Meet v1.0.0
                    </span>

                </div>

            </div>

        </div>
    );
};


export default Register;