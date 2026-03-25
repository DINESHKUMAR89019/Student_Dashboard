"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });

    const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/login" : "/api/register";
        const body = isLogin
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
                setError(data.error || "Something went wrong");
                setLoading(false);
                return;
            }

            localStorage.setItem("user", JSON.stringify(data));
            router.push(data.role === "teacher" ? "/teacher" : "/student");
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card animate-in">
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            margin: "0 auto 0.75rem",
                            borderRadius: "1rem",
                            background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.6rem",
                        }}
                    >
                        🎓
                    </div>
                    <h1 className="auth-title">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="auth-subtitle">
                        {isLogin
                            ? "Sign in to your learning dashboard"
                            : "Start your learning journey today"}
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
                                placeholder="Dinesh Kumar"
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
                            placeholder="you@example.com"
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
                            <label className="label">I am a …</label>
                            <select
                                id="role"
                                className="input-field"
                                value={form.role}
                                onChange={(e) => update("role", e.target.value)}
                            >
                                <option value="student">🎓 Student</option>
                                <option value="teacher">🧑‍🏫 Teacher</option>
                            </select>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", marginTop: "0.5rem" }}
                    >
                        {loading
                            ? "Please wait…"
                            : isLogin
                                ? "Sign In →"
                                : "Create Account →"}
                    </button>
                </form>

                <p className="auth-toggle">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <a
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                    >
                        {isLogin ? "Register" : "Sign In"}
                    </a>
                </p>
            </div>
        </div>
    );
}
