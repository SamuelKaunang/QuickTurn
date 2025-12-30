import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, ArrowRight, Users, Briefcase, TrendingUp, Clock,
    Star, CheckCircle, Instagram, Linkedin, Mail, Phone, MapPin,
    Target, Rocket, Award, ArrowUpRight, Sparkles, Shield, Timer
} from 'lucide-react';
import logoFull from './assets/logo/Logo full.png';
import logoQ from './assets/logo/logo Q.png';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    // Redirect if already logged in
    useEffect(() => {
        if (token) {
            const role = sessionStorage.getItem('role');
            if (role === 'UMKM') {
                navigate('/dashboardu');
            } else {
                navigate('/dashboardm');
            }
        }
    }, [token, navigate]);

    return (
        <div className="landing-page">
            {/* Background Effects */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>
            <div className="bg-pattern"></div>

            {/* Navigation Header */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-logo" onClick={() => navigate('/')}>
                        <img src={logoFull} alt="QuickTurn" className="nav-logo-img" />
                    </div>
                    <div className="nav-actions">
                        <button className="btn-nav-login" onClick={() => navigate('/login')}>
                            Login
                        </button>
                        <button className="btn-nav-register" onClick={() => navigate('/registerm')}>
                            Get Started
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            <span className="text-dark">Turning</span> <span className="gradient-text">Potential</span> <span className="text-dark">into</span> <span className="gradient-text">Power</span>
                        </h1>
                        <p className="hero-subtitle">
                            The fastest bridge between fresh ideas from students and real needs from businesses.
                            We don't just offer internships, we offer opportunities to make real impact.
                        </p>
                        <div className="hero-cta">
                            <button className="btn-primary-hero" onClick={() => navigate('/registerm')}>
                                Start Now
                                <Rocket size={18} />
                            </button>
                            <button className="btn-secondary-hero" onClick={() => navigate('/registeru')}>
                                Find Talent
                                <Users size={18} />
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <span className="hero-stat-number">500+</span>
                                <span className="hero-stat-label">Projects Completed</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="hero-stat">
                                <span className="hero-stat-number">1,200+</span>
                                <span className="hero-stat-label">Active Talents</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="hero-stat">
                                <span className="hero-stat-number">300+</span>
                                <span className="hero-stat-label">Happy Clients</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-image-container">
                            <img src={logoQ} alt="QuickTurn" className="hero-logo-icon" />
                            <div className="hero-ring ring-1"></div>
                            <div className="hero-ring ring-2"></div>
                            <div className="hero-floating-card card-1">
                                <TrendingUp size={18} />
                                <span>Growth +127%</span>
                            </div>
                            <div className="hero-floating-card card-2">
                                <Star size={18} />
                                <span>4.9 Rating</span>
                            </div>
                            <div className="hero-floating-card card-3">
                                <CheckCircle size={18} />
                                <span>Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="hero-decoration dec-1"></div>
                <div className="hero-decoration dec-2"></div>
                <div className="hero-decoration dec-3"></div>
                <div className="hero-decoration dec-4"></div>
                <div className="hero-decoration dec-5"></div>
            </section>

            {/* Features Grid */}
            <section className="features-section">
                <div className="section-container">
                    <div className="features-grid">
                        <div className="feature-card red">
                            <div className="feature-icon">
                                <Timer size={24} />
                            </div>
                            <h4>Quick Start</h4>
                            <p>Get matched with projects in minutes, not weeks</p>
                        </div>
                        <div className="feature-card purple">
                            <div className="feature-icon">
                                <Shield size={24} />
                            </div>
                            <h4>Verified Talents</h4>
                            <p>All talents are vetted and reviewed by peers</p>
                        </div>
                        <div className="feature-card blue">
                            <div className="feature-icon">
                                <Sparkles size={24} />
                            </div>
                            <h4>Real Impact</h4>
                            <p>Work on actual projects with measurable outcomes</p>
                        </div>
                        <div className="feature-card green">
                            <div className="feature-icon">
                                <TrendingUp size={24} />
                            </div>
                            <h4>Grow Together</h4>
                            <p>Build your portfolio while helping businesses scale</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <section className="value-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Micro-Internship, Macro-Impact</h2>
                    </div>
                    <div className="value-grid">
                        {/* For Talents */}
                        <div className="value-card talent">
                            <div className="value-card-header">
                                <div className="value-icon">
                                    <Users size={24} />
                                </div>
                                <span className="value-tag">For Students</span>
                            </div>
                            <h3>No More Ghosting, Just Growing</h3>
                            <p>
                                Tired of internships requiring 10 years of experience when you're only in your 3rd semester?
                                At Quickturn, you work on micro-projects focused on results.
                            </p>
                            <ul className="value-list">
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Complete projects, build portfolio</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Get fair compensation</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Real work experience</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Flexible, work from anywhere</span>
                                </li>
                            </ul>
                            <button className="btn-value" onClick={() => navigate('/registerm')}>
                                Register as Talent
                                <ArrowUpRight size={16} />
                            </button>
                        </div>

                        {/* For Clients */}
                        <div className="value-card client">
                            <div className="value-card-header">
                                <div className="value-icon">
                                    <Briefcase size={24} />
                                </div>
                                <span className="value-tag">For Businesses</span>
                            </div>
                            <h3>Fast Solutions, Friendly Prices</h3>
                            <p>
                                Don't need a big team for content or admin work?
                                Hire talented students for specific tasks without the hassle.
                            </p>
                            <ul className="value-list">
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Save recruitment time</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Reduce operational costs</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Fresh Gen Z perspectives</span>
                                </li>
                                <li>
                                    <CheckCircle size={16} />
                                    <span>Verified talents & transparent reviews</span>
                                </li>
                            </ul>
                            <button className="btn-value client-btn" onClick={() => navigate('/registeru')}>
                                Register as Client
                                <ArrowUpRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                    </div>
                    <div className="steps-container">
                        <div className="steps-line"></div>
                        <div className="steps-grid">
                            <div className="step-card">
                                <div className="step-number">1</div>
                                <div className="step-icon">
                                    <Users size={24} />
                                </div>
                                <h4>Sign Up & Complete Profile</h4>
                                <p>Create a free account and fill in your profile or project needs.</p>
                            </div>
                            <div className="step-card">
                                <div className="step-number">2</div>
                                <div className="step-icon">
                                    <Target size={24} />
                                </div>
                                <h4>Match & Connect</h4>
                                <p>Find projects or talents that match your requirements.</p>
                            </div>
                            <div className="step-card">
                                <div className="step-number">3</div>
                                <div className="step-icon">
                                    <Award size={24} />
                                </div>
                                <h4>Collaborate & Grow</h4>
                                <p>Work on the project, deliver results, and grow together!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-card">
                        <div className="cta-content">
                            <h2>Ready to Get Started?</h2>
                            <p>
                                Ready to switch on your career? Or ready to scale up your business?
                            </p>
                            <div className="cta-buttons">
                                <button className="btn-cta-primary" onClick={() => navigate('/registerm')}>
                                    I'm a Talent
                                    <Rocket size={18} />
                                </button>
                                <button className="btn-cta-secondary" onClick={() => navigate('/registeru')}>
                                    I'm a Client
                                    <Briefcase size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="cta-decoration"></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <img src={logoFull} alt="QuickTurn" className="footer-logo" />
                            <p className="footer-tagline">Micro-Internship, Macro-Impact.</p>
                            <p className="footer-description">
                                Quickturn connects talented students with businesses that need
                                fast and affordable solutions to grow together.
                            </p>
                        </div>
                        <div className="footer-links-section">
                            <div className="footer-links">
                                <h4>Platform</h4>
                                <a onClick={() => navigate('/registerm')}>Register as Talent</a>
                                <a onClick={() => navigate('/registeru')}>Register as Client</a>
                                <a onClick={() => navigate('/login')}>Login</a>
                            </div>
                            <div className="footer-links">
                                <h4>Company</h4>
                                <a href="#">About Us</a>
                                <a href="#">Careers</a>
                                <a href="#">Blog</a>
                            </div>
                            <div className="footer-links">
                                <h4>Legal</h4>
                                <a href="#">Terms & Conditions</a>
                                <a href="#">Privacy Policy</a>
                                <a href="#">FAQ</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-contact">
                        <div className="contact-info">
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>Jl. Startup Avenue No. 123, Jakarta, Indonesia</span>
                            </div>
                            <div className="contact-item">
                                <Phone size={16} />
                                <span>+62 21 1234 5678</span>
                            </div>
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>hello@quickturn.id</span>
                            </div>
                        </div>
                        <div className="social-links">
                            <a href="https://instagram.com/quickturn.id" target="_blank" rel="noopener noreferrer" className="social-link">
                                <Instagram size={18} />
                            </a>
                            <a href="https://linkedin.com/company/quickturn" target="_blank" rel="noopener noreferrer" className="social-link">
                                <Linkedin size={18} />
                            </a>
                            <a href="mailto:hello@quickturn.id" className="social-link">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2025 QuickTurn. All rights reserved.</p>
                        <p>Made with ❤️ in Indonesia</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
