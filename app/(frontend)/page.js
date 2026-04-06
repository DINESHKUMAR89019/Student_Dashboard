"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "./components/ThemeToggle";

export default function HomePortal() {
    const router = useRouter();
    
    // "portal", "login", "register"
    const [view, setView] = useState("portal");
    // Default role for forms if they navigate directly
    const [authRole, setAuthRole] = useState("student"); 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });

    const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = view === "login" ? "/api/login" : "/api/register";
        const body = view === "login"
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, password: form.password, role: form.role };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Authentication failed");
                setLoading(false);
                return;
            }

            localStorage.setItem("user", JSON.stringify(data));
            if (data.role === "admin") router.push("/admin");
            else if (data.role === "teacher") router.push("/teacher");
            else router.push("/student");
        } catch {
            setError("Network error connecting to the server");
            setLoading(false);
        }
    }

    if (view === "login" || view === "register") {
        const isLogin = view === "login";
        return (
            <div className="auth-container">
                <div className="auth-card animate-in" style={{ position: 'relative' }}>
                    
                    <button 
                        onClick={() => { setView("portal"); setError(""); }}
                        style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                        ←
                    </button>

                    <div style={{ textAlign: "center", marginBottom: "1.5rem", marginTop: "1rem" }}>
                        <div style={{
                            width: 56, height: 56, margin: "0 auto 0.75rem", borderRadius: "1rem",
                            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem",
                        }}>
                            {isLogin ? "🔒" : "📝"}
                        </div>
                        <h1 className="auth-title">
                            {isLogin ? `Welcome Back` : "Create Account"}
                        </h1>
                        <p className="auth-subtitle">
                            {isLogin
                                ? `Sign in to your learning dashboard`
                                : "Join the LearnTrack platform"}
                        </p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} suppressHydrationWarning>
                        {!isLogin && (
                            <div className="form-group">
                                <label className="label">Full Name</label>
                                <input
                                    id="name"
                                    className="input-field"
                                    placeholder="John Doe"
                                    value={form.name}
                                    onChange={(e) => update("name", e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="you@school.edu"
                                value={form.email}
                                onChange={(e) => update("email", e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Password</label>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => update("password", e.target.value)}
                                required
                            />
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label className="label">Account Type</label>
                                <select
                                    id="role"
                                    className="input-field"
                                    value={form.role}
                                    onChange={(e) => update("role", e.target.value)}
                                >
                                    <option value="student">🎓 Student</option>
                                    <option value="teacher">🧑‍🏫 Staff (Teacher)</option>
                                </select>
                                <small style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.4rem", display: "block" }}>
                                    Admin accounts can only be provisioned internally.
                                </small>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{ width: "100%", marginTop: "0.5rem" }}
                        >
                            {loading
                                ? "Processing…"
                                : isLogin
                                    ? "Sign In →"
                                    : "Register →"}
                        </button>
                    </form>

                    <p className="auth-toggle" style={{ marginTop: '1rem' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <a onClick={() => { setView(isLogin ? "register" : "login"); setError(""); }} style={{ cursor: "pointer", color: "var(--accent)", fontWeight: 600 }}>
                            {isLogin ? "Register" : "Sign In"}
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}>
                        🎓
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }}>LearnTrack</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <ThemeToggle />
                    <button onClick={() => { setView("login"); setAuthRole("student"); }} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>Log in</button>
                    <button onClick={() => { setView("register"); setAuthRole("student"); }} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Register</button>
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem', animation: 'fadeInUp 0.8s ease' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(to right, var(--text-primary), var(--text-muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                        Choose Your Portal
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                        Securely access your academic resources, manage students, or oversee the entire platform infrastructure.
                    </p>
                </div>

                <div className="grid-3" style={{ width: '100%', gap: '2rem' }}>
                    
                    {/* Student Portal */}
                    <div className="card glass-card hover-lift" style={{ textAlign: 'center', padding: '3rem 2rem', borderTop: '4px solid var(--accent)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' }}>🎓</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Student Portal</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Access your courses, track your grades, submit assignments, and view attendance.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button onClick={() => { setView("login"); setAuthRole("student"); }} className="btn btn-primary" style={{ flex: 1 }}>Sign In</button>
                        </div>
                    </div>

                    {/* Staff Portal */}
                    <div className="card glass-card hover-lift" style={{ textAlign: 'center', padding: '3rem 2rem', borderTop: '4px solid var(--success)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 12px rgba(16,185,129,0.3))' }}>🧑‍🏫</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Staff Portal</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Manage classrooms, evaluate student submissions, and update academic records.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button onClick={() => { setView("login"); setAuthRole("teacher"); }} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--border)' }}>Staff Login</button>
                        </div>
                    </div>

                    {/* Admin Portal */}
                    <div className="card glass-card hover-lift" style={{ textAlign: 'center', padding: '3rem 2rem', borderTop: '4px solid var(--danger)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 12px rgba(239,68,68,0.3))' }}>🛡️</div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Admin Portal</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                            Full platform overview, user management, and system-wide analytics tracking.
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button onClick={() => { setView("login"); setAuthRole("admin"); }} className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--danger-bg)', color: 'var(--danger)' }}>Admin Login</button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
