
import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-page">
      <nav className="home-nav">
        <Link to="/" className="home-brand">
          <span className="brand-icon">E</span>
          <span>EduPlanner</span>
        </Link>

        <div className="home-nav-actions">
          <Link to="/login" className="nav-login">
            Log In
          </Link>
          <Link to="/signup" className="nav-signup">
            Sign Up <span>→</span>
          </Link>
        </div>
      </nav>

      <main>
        <section className="home-hero">
          <div className="hero-content">
            <span className="hero-label">
              ✦ YOUR PERSONAL STUDY SPACE
            </span>

            <h1>
              Your goals.
              <br />
              Your plan.
              <br />
              <span>Your success.</span>
            </h1>

            <p className="hero-description">
              Bring your academic life together. Organize subjects,
              manage assignments, and plan study sessions with
              one simple, beautiful workspace.
            </p>

            <div className="hero-actions">
              <Link to="/signup" className="hero-primary">
                Get Started Free <span>→</span>
              </Link>

              <Link to="/login" className="hero-secondary">
                I already have an account
              </Link>
            </div>

            <div className="hero-note">
              <span className="note-dot" />
              Your study journey starts here.
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-orb orb-one" />
            <div className="visual-orb orb-two" />

            <div className="planner-preview">
              <div className="preview-top">
                <div>
                  <span className="preview-eyebrow">
                    YOUR WORKSPACE
                  </span>
                  <h3>Study overview</h3>
                </div>
                <span className="preview-icon">✦</span>
              </div>

              <div className="welcome-panel">
                <span>READY WHEN YOU ARE</span>
                <h3>Make today count.</h3>
                <p>Small steps lead to big achievements.</p>
              </div>

              <div className="preview-grid">
                <div className="preview-card">
                  <span className="mini-icon lavender-icon">▤</span>
                  <span className="mini-label">ORGANIZE</span>
                  <h4>Your Subjects</h4>
                  <p>Everything in its place.</p>
                </div>

                <div className="preview-card">
                  <span className="mini-icon blue-icon">✓</span>
                  <span className="mini-label">STAY ON TRACK</span>
                  <h4>Your Tasks</h4>
                  <p>Know what comes next.</p>
                </div>
              </div>

              <div className="preview-bottom">
                <span className="preview-check">✓</span>
                <div>
                  <strong>A little progress every day</strong>
                  <p>Build a routine that works for you.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="section-heading">
            <span>MADE FOR YOUR STUDIES</span>
            <h2>Everything you need to stay organized.</h2>
            <p>
              Less confusion, better planning, and more time
              to focus on learning.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon feature-lavender">▤</div>
              <h3>Manage Subjects</h3>
              <p>
                Keep your courses organized in one convenient place.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon feature-blue">✓</div>
              <h3>Track Assignments</h3>
              <p>
                Keep track of deadlines, priorities, and completed tasks.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon feature-purple">◷</div>
              <h3>Plan Study Sessions</h3>
              <p>
                Build a study routine that fits your schedule.
              </p>
            </article>
          </div>
        </section>

        <section className="home-cta">
          <span>YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Make your study time count.</h2>
          <p>
            Create your workspace and take control of your study routine.
          </p>
          <Link to="/signup" className="hero-primary">
            Create Your Account →
          </Link>
        </section>
      </main>

      <footer className="home-footer">
        <Link to="/" className="footer-brand">EduPlanner</Link>
        <span>Plan with purpose. Learn with confidence.</span>
      </footer>
    </div>
  );
}
