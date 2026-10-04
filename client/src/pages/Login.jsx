import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Login.css";

const Login = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                formData
            );

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));

            navigate("/chat");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-container">

                <div className="login-logo">
                    <h1>
                        Bubble <span>Meet</span>
                    </h1>
                </div>

                <div className="login-heading">
                    <h2>Welcome Back 👋</h2>
                    <p>
                        Connect with your people and continue
                        your conversations.
                    </p>
                </div>

                <div className="login-card">

                    <form onSubmit={handleSubmit}>

                        <div className="input-group">
                            <label>Email Address</label>

                            <div className="input-wrapper">
                                <span className="input-icon">✉</span>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>

                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="login-error">
                                ⚠ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Sign In →"}
                        </button>

                    </form>

                    <div className="login-divider">
                        <span>SECURE CONNECTION</span>
                    </div>

                    <div className="register-link">
                        <span>Don't have an account?</span>

                        <Link to="/register">
                            Create Account
                        </Link>
                    </div>

                </div>

                <div className="login-security">
                    🟢 Your connection is secure
                </div>

            </div>

        </div>
    );
};

export default Login;