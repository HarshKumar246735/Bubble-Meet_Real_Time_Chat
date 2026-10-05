import { useState } from "react";
import {
    Link,
    useNavigate
} from "react-router-dom";

import axios from "axios";

import "../css/Login.css";


const API =
    import.meta.env.VITE_API_URL;


const Login = () => {

    const navigate =
        useNavigate();


    const [formData, setFormData] =
        useState({
            email: "",
            password: ""
        });


    const [loading, setLoading] =
        useState(false);


    const [error, setError] =
        useState("");


    /* =====================================
       HANDLE INPUT CHANGE
    ===================================== */

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value
        });

    };


    /* =====================================
       HANDLE LOGIN
    ===================================== */

    const handleSubmit = async (e) => {

        e.preventDefault();


        setError("");


        if (
            !formData.email ||
            !formData.password
        ) {

            setError(
                "Please enter email and password."
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
                "Login API:",
                `${API}/auth/login`
            );


            const response =
                await axios.post(
                    `${API}/auth/login`,
                    formData
                );


            const {
                token,
                user
            } = response.data;


            if (!token || !user) {

                setError(
                    "Invalid login response from server."
                );

                return;
            }


            localStorage.setItem(
                "token",
                token
            );


            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );


            navigate("/chat");


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please try again."
            );


        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="login-page">


            <div className="login-container">


                {/* ============================
                    LOGO
                ============================= */}

                <div className="login-logo">

                    <h1>
                        Bubble{" "}
                        <span>
                            Meet
                        </span>
                    </h1>

                </div>


                {/* ============================
                    HEADING
                ============================= */}

                <div className="login-heading">

                    <h2>
                        Welcome Back 👋
                    </h2>

                    <p>
                        Connect with your people
                        and continue your
                        conversations.
                    </p>

                </div>


                {/* ============================
                    LOGIN CARD
                ============================= */}

                <div className="login-card">


                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >


                        {/* ======================
                            EMAIL
                        ======================= */}

                        <div className="input-group">

                            <label>
                                Email Address
                            </label>


                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>


                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="email"
                                    disabled={
                                        loading
                                    }
                                />

                            </div>

                        </div>


                        {/* ======================
                            PASSWORD
                        ======================= */}

                        <div className="input-group">

                            <label>
                                Password
                            </label>


                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>


                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Enter your password"
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    autoComplete="current-password"
                                    disabled={
                                        loading
                                    }
                                />

                            </div>

                        </div>


                        {/* ======================
                            ERROR
                        ======================= */}

                        {error && (

                            <div className="login-error">

                                ⚠ {error}

                            </div>

                        )}


                        {/* ======================
                            LOGIN BUTTON
                        ======================= */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={
                                loading
                            }
                        >

                            {loading
                                ? "Signing In..."
                                : "Sign In →"
                            }

                        </button>


                    </form>


                    {/* ============================
                        DIVIDER
                    ============================= */}

                    <div className="login-divider">

                        <span>
                            SECURE CONNECTION
                        </span>

                    </div>


                    {/* ============================
                        REGISTER
                    ============================= */}

                    <div className="register-link">

                        <span>
                            Don't have an account?
                        </span>


                        <Link to="/register">
                            Create Account
                        </Link>

                    </div>


                </div>


                {/* ============================
                    SECURITY
                ============================= */}

                <div className="login-security">

                    🟢 Your connection is secure

                </div>


            </div>

        </div>
    );
};


export default Login;