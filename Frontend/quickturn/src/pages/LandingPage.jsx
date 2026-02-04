import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    ArrowRight, Users, Briefcase, TrendingUp,
    Star, CheckCircle, Instagram, Linkedin, Mail, Phone, MapPin,
    Target, Rocket, Award, ArrowUpRight, Sparkles, Shield, Timer, Quote
} from 'lucide-react';
import logoFull from '../assets/logo/Logo full.png';
import logoQ from '../assets/logo/logo Q.png';
// Import UI Images
import heroPerson from '../assets/ui/hero-person.jpg';
import teamCollab from '../assets/ui/team-collab.jpg';
import talentGirl from '../assets/ui/talent-girl.jpg';
import clientWoman from '../assets/ui/client-woman.jpg';
import coworking from '../assets/ui/coworking.jpg';
import remoteWork from '../assets/ui/remote-work.jpg';
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
            <Helmet>
                <title>QuickTurn | Platform Micro-Internship untuk Mahasiswa & UMKM</title>
                <meta name="description" content="Platform #1 di Indonesia yang menghubungkan Mahasiswa dengan UMKM untuk proyek micro-internship, freelance, dan pengembangan bisnis digital." />
                <meta name="keywords" content="micro-internship indonesia, jasa mahasiswa, proyek umkm, freelance mahasiswa, cari cuan mahasiswa, kerja sampingan mahasiswa, jasa desain logo murah, admin sosmed murah, digitalisasi umkm, magang wfa, side hustle mahasiswa, loker freelance remote, kerja online mahasiswa, magang online paid, freelance pemula, job part time kuliah, portofolio desain grafis, cari pengalaman kerja, uang saku tambahan, mahasiswa produktif, freelancer indo, creative worker, umkm go digital" />
                
                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://quickturn.id/" />
                <meta property="og:title" content="QuickTurn | Solusi Digital UMKM & Pengalaman Nyata Mahasiswa" />
                <meta property="og:description" content="Temukan talent mahasiswa terbaik untuk proyek UMKM Anda, atau bangun portofolio karir dengan proyek nyata." />
                <meta property="og:image" content="https://quickturn.id/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://quickturn.id/" />
                <meta property="twitter:title" content="QuickTurn | Jembatan Mahasiswa & UMKM" />
                <meta property="twitter:description" content="Micro-internship platform menghubungkan mahasiswa kreatif dengan UMKM yang butuh solusi digital cepat." />
                <meta property="twitter:image" content="https://quickturn.id/og-image.jpg" />
                
                {/* Structured Data (Schema.org) */}
                <script type="application/ld+json">
                    {`
                        {
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            "name": "QuickTurn",
                            "url": "https://quickturn.id",
                            "potentialAction": {
                                "@type": "SearchAction",
                                "target": "https://quickturn.id/search?q={search_term_string}",
                                "query-input": "required name=search_term_string"
                            }
                        }
                    `}
                </script>
            </Helmet>
            {/* Background Effects */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>
            <div className="bg-pattern"></div>

            {/* Navigation Header */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <img src={logoFull} alt="QuickTurn" className="nav-logo-img" />
                    </Link>
                    <div className="nav-actions">
                        <Link to="/login" className="btn-nav-login">
                            Login
                        </Link>
                        <Link to="/registerm" className="btn-nav-register">
                            Get Started
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Original Design with Logo Q */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={14} />
                            <span>Indonesia's #1 Micro-Internship Platform</span>
                        </div>
                        <h1 className="hero-title">
                            <span className="text-dark">Solusi Digital</span> <span className="gradient-text">UMKM</span> <span className="text-dark">karya</span> <span className="gradient-text">Mahasiswa</span>
                        </h1>
                        <p className="hero-subtitle">
                            Platform yang mempertemukan ide segar mahasiswa dengan kebutuhan nyata bisnis UMKM.
                            Dapatkan pengalaman kerja nyata atau solusi bisnis terjangkau sekarang.
                        </p>
                        <div className="hero-cta">
                            <Link to="/registerm" className="btn-primary-hero">
                                Start Now
                                <Rocket size={18} />
                            </Link>
                            <Link to="/registeru" className="btn-secondary-hero">
                                Find Talent
                                <Users size={18} />
                            </Link>
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

            {/* Community Showcase Section - NEW with hero-person image */}
            <section className="community-section">
                <div className="section-container">
                    <div className="community-grid">
                        <div className="community-image-wrapper">
                            <img src={heroPerson} alt="Our Community" className="community-image" loading="lazy" />
                            <div className="community-image-overlay"></div>
                            <div className="community-badge">
                                <Sparkles size={16} />
                                <span>Join 1,200+ Talents</span>
                            </div>
                        </div>
                        <div className="community-content">
                            <div className="section-header left-aligned">
                                <h2>Join Our Growing Community</h2>
                                <p>Connect with talented students and innovative businesses</p>
                            </div>
                            <div className="community-features">
                                <div className="community-feature">
                                    <div className="community-feature-icon">
                                        <Users size={20} />
                                    </div>
                                    <div className="community-feature-text">
                                        <h4>Collaborative Environment</h4>
                                        <p>Work alongside passionate individuals who share your drive for excellence</p>
                                    </div>
                                </div>
                                <div className="community-feature">
                                    <div className="community-feature-icon">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div className="community-feature-text">
                                        <h4>Career Growth</h4>
                                        <p>Build real-world experience and expand your professional network</p>
                                    </div>
                                </div>
                                <div className="community-feature">
                                    <div className="community-feature-icon">
                                        <Award size={20} />
                                    </div>
                                    <div className="community-feature-text">
                                        <h4>Recognition & Rewards</h4>
                                        <p>Get recognized for your contributions with reviews and ratings</p>
                                    </div>
                                </div>
                            </div>
                            <Link to="/registerm" className="btn-community">
                                Join the Community
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Section - With Images */}
            <section className="value-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>Micro-Internship, Macro-Impact</h2>
                    </div>
                    <div className="value-grid">
                        {/* For Talents */}
                        <div className="value-card talent">
                            <div className="value-card-image">
                                <img src={talentGirl} alt="Talent working on laptop" loading="lazy" />
                            </div>
                            <div className="value-card-content">
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
                                <Link to="/registerm" className="btn-value">
                                    Register as Talent
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>

                        {/* For Clients */}
                        <div className="value-card client">
                            <div className="value-card-image">
                                <img src={clientWoman} alt="Business professional" loading="lazy" />
                            </div>
                            <div className="value-card-content">
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
                                <Link to="/registeru" className="btn-value client-btn">
                                    Register as Client
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section - With Coworking Image */}
            <section className="how-section">
                <div className="section-container">
                    <div className="how-section-grid">
                        <div className="how-image-section">
                            <div className="how-image-wrapper">
                                <img src={coworking} alt="Coworking space" className="how-main-image" loading="lazy" />
                                <div className="how-image-badge">
                                    <Award size={20} />
                                    <span>Trusted by 300+ Companies</span>
                                </div>
                            </div>
                        </div>
                        <div className="how-content-section">
                            <div className="section-header left-aligned">
                                <h2>How It Works</h2>
                                <p>Get started in just 3 simple steps</p>
                            </div>
                            <div className="steps-vertical">
                                <div className="step-item">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <div className="step-icon-mini">
                                            <Users size={20} />
                                        </div>
                                        <h4>Sign Up & Complete Profile</h4>
                                        <p>Create a free account and fill in your profile or project needs.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <div className="step-icon-mini">
                                            <Target size={20} />
                                        </div>
                                        <h4>Match & Connect</h4>
                                        <p>Find projects or talents that match your requirements.</p>
                                    </div>
                                </div>
                                <div className="step-item">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <div className="step-icon-mini">
                                            <Award size={20} />
                                        </div>
                                        <h4>Collaborate & Grow</h4>
                                        <p>Work on the project, deliver results, and grow together!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonial/Social Proof Section */}
            <section className="testimonial-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2>What People Are Saying</h2>
                        <p>Real stories from our community</p>
                    </div>
                    <div className="testimonial-grid">
                        <div className="testimonial-card featured">
                            <div className="testimonial-image">
                                <img src={teamCollab} alt="Team collaborating" loading="lazy" />
                            </div>
                            <div className="testimonial-content">
                                <Quote size={32} className="quote-icon" />
                                <p className="testimonial-text">
                                    "QuickTurn helped us find amazing student talents who brought fresh perspectives to our marketing campaigns.
                                    The quality of work exceeded our expectations!"
                                </p>
                                <div className="testimonial-author">
                                    <div className="author-info">
                                        <span className="author-name">Sarah Wijaya</span>
                                        <span className="author-role">Marketing Director, TechStartup ID</span>
                                    </div>
                                    <div className="testimonial-rating">
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                        <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card small">
                            <Quote size={24} className="quote-icon" />
                            <p className="testimonial-text">
                                "As a student, I got my first real project experience here. Now I have a solid portfolio!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-info">
                                    <span className="author-name">Andi Pratama</span>
                                    <span className="author-role">UI/UX Designer, ITB Student</span>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card small">
                            <Quote size={24} className="quote-icon" />
                            <p className="testimonial-text">
                                "Found talented developers for our MVP in just 2 days. Incredible turnaround time!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-info">
                                    <span className="author-name">Budi Santoso</span>
                                    <span className="author-role">Founder, Local Coffee Co.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - With Remote Work Image */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-card">
                        <div className="cta-image">
                            <img src={remoteWork} alt="Remote work" loading="lazy" />
                        </div>
                        <div className="cta-content">
                            <h2>Ready to Get Started?</h2>
                            <p>
                                Ready to switch on your career? Or ready to scale up your business?
                                Join thousands who are already growing with QuickTurn.
                            </p>
                            <div className="cta-buttons">
                                <Link to="/registerm" className="btn-cta-primary">
                                    I'm a Talent
                                    <Rocket size={18} />
                                </Link>
                                <Link to="/registeru" className="btn-cta-secondary">
                                    I'm a Client
                                    <Briefcase size={18} />
                                </Link>
                            </div>
                        </div>
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
                                <Link to="/registerm">Register as Talent</Link>
                                <Link to="/registeru">Register as Client</Link>
                                <Link to="/login">Login</Link>
                            </div>
                            <div className="footer-links">
                                <h4>Company</h4>
                                <Link to="/faq">About Us & FAQ</Link>

                            </div>
                            <div className="footer-links">
                                <h4>Legal</h4>
                                <Link to="/terms">Terms & Conditions</Link>
                                <Link to="/privacy">Privacy Policy</Link>
                                <Link to="/refund">Refund Policy</Link>
                                <Link to="/faq">FAQ</Link>
                            </div>
                        </div>
                    </div>
                    <div className="footer-contact">
                        <div className="contact-info">
                            <div className="contact-item">
                                <MapPin size={16} />
                                <span>Bandung, Indonesia</span>
                            </div>
                            <div className="contact-item">
                                <Mail size={16} />
                                <span>quickturn.main@gmail.com</span>
                            </div>
                        </div>
                        <div className="social-links">
                            <a href="https://instagram.com/quickturn.id" target="_blank" rel="noopener noreferrer" className="social-link">
                                <Instagram size={18} />
                            </a>

                            <a href="mailto:quickturn.main@gmail.com" className="social-link">
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
