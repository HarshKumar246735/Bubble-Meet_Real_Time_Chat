import { useEffect, useState } from "react";
import FlyingPeople from "./FlyingPeople";
import "../css/IntroScreen.css";

const IntroScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const duration = 7000;
        const start = Date.now();

        const animate = () => {
            const elapsed = Date.now() - start;
            const value = Math.min((elapsed / duration) * 100, 100);

            setProgress(value);

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    onComplete();
                }, 400);
            }
        };

        requestAnimationFrame(animate);
    }, [onComplete]);

    return (
        <div className="intro-screen">

            {/* BACKGROUND */}
            <img
                src="/images/intro-screen.png"
                className="intro-background"
                alt=""
            />

            <div className="intro-overlay"></div>


            {/* AMBIENT GLOW */}
            <div className="ambient ambient-blue"></div>
            <div className="ambient ambient-purple"></div>
            <div className="ambient ambient-cyan"></div>


            {/* PARTICLES */}
            <div className="particles">

                {Array.from({ length: 25 }).map((_, index) => (
                    <span
                        key={index}
                        className={`particle p-${index + 1}`}
                    />
                ))}

            </div>


            {/* FLYING PEOPLE */}
            <FlyingPeople />


            {/* ORBIT LINES */}
            <div className="main-orbit orbit-a"></div>
            <div className="main-orbit orbit-b"></div>
            <div className="main-orbit orbit-c"></div>


            {/* CHAT BUBBLES */}

            <div className="chat-bubble bubble-left">

                <span className="bubble-online"></span>

                Hey! 👋

            </div>


            <div className="chat-bubble bubble-right">

                Let's connect

                <span className="typing">•••</span>

            </div>


            <div className="chat-bubble bubble-bottom">

                Together always 💙

            </div>


            {/* CENTER */}

            <div className="intro-content">

                {/* LOGO */}

                <div className="logo-container">

                    <div className="logo-aura"></div>

                    <div className="chat-logo">

                        <div className="chat-logo-screen">

                            <span></span>
                            <span></span>
                            <span></span>

                        </div>

                    </div>

                    <div className="logo-ring ring-a"></div>
                    <div className="logo-ring ring-b"></div>

                </div>


                {/* BRAND */}

                <h1 className="brand-title">

                    Bubble<span>Meet</span>

                </h1>


                {/* TAGLINE */}

                <div className="brand-tagline">

                    <i></i>

                    <span>CONNECT</span>

                    <b>•</b>

                    <span>CHAT</span>

                    <b>•</b>

                    <span>BELONG</span>

                    <i></i>

                </div>


                <p className="brand-description">

                    REAL-TIME CONVERSATIONS. ANYWHERE. ANYTIME.

                </p>

            </div>


            {/* TOP UI */}

            <div className="system-status">

                <span className="status-light"></span>

                SYSTEM ONLINE

            </div>


            <div className="version">

                v1.0.0

            </div>


            {/* LOADER */}

            <div className="loader-container">

                <div className="loader-header">

                    <span>INITIALIZING</span>

                    <strong>
                        {Math.floor(progress)}%
                    </strong>

                </div>


                <div className="loader-bar">

                    <div
                        className="loader-fill"
                        style={{
                            width: `${progress}%`
                        }}
                    >
                        <span></span>
                    </div>

                </div>


                <div className="loader-dots">

                    {[1, 2, 3, 4, 5, 6, 7, 8].map(
                        (dot) => (

                            <span
                                key={dot}
                                className={
                                    progress >
                                    dot * 12
                                        ? "dot-active"
                                        : ""
                                }
                            ></span>

                        )
                    )}

                </div>


                <p className="loader-message">

                    SECURE CONNECTION ESTABLISHING

                </p>

            </div>


            {/* BOTTOM STATUS */}

            <div className="bottom-status bottom-left">

                🔒 ENCRYPTED

            </div>


            <div className="bottom-status bottom-right">

                ⚡ REAL-TIME

            </div>

        </div>
    );
};

export default IntroScreen;