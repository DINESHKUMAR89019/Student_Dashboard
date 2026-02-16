"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/"); return; }
        const u = JSON.parse(stored);
        if (u.role !== "student") { router.push("/"); return; }
        setUser(u);

        async function load() {
            try {
                const [mRes, cRes] = await Promise.all([
                    fetch(`/api/marks?studentId=${u._id}`),
                    fetch(`/api/courses?studentId=${u._id}`),
                ]);
                const mData = await mRes.json();
                const cData = await cRes.json();
                setMarks(Array.isArray(mData) ? mData : []);
                setCourses(Array.isArray(cData) ? cData : []);
            } catch { }
            setLoading(false);
        }
        load();
    }, [router]);

    function logout() {
        localStorage.removeItem("user");
        router.push("/");
    }

    if (!user || loading) {
        return (
            <div className="auth-container">
                <p style={{ color: "var(--text-muted)" }}>Loading…</p>
            </div>
        );
    }

    const avg =
        marks.length > 0
            ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length)
            : 0;

    function grade(score) {
        if (score >= 90) return { label: "A+", cls: "badge-success" };
        if (score >= 80) return { label: "A", cls: "badge-success" };
        if (score >= 70) return { label: "B", cls: "badge-purple" };
        if (score >= 60) return { label: "C", cls: "badge-warning" };
        return { label: "F", cls: "badge-danger" };
    }

    return (
        <div className="container-app animate-in">
            {/* Header */}
            <div className="topbar">
                <span className="topbar-brand">🎓 Learning Tracker</span>
                <div className="topbar-user">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Hi, <strong>{user.name}</strong>
                    </span>
                    <button className="btn btn-ghost" onClick={logout} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                        Logout
                    </button>
                </div>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                Student Dashboard
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Track your courses, grades, and progress
            </p>

            {/* Stats */}
            <div className="grid-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>📚</div>
                    <div>
                        <div className="stat-value">{courses.length}</div>
                        <div className="stat-label">Enrolled Courses</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>📝</div>
                    <div>
                        <div className="stat-value">{marks.length}</div>
                        <div className="stat-label">Grades Received</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>📊</div>
                    <div>
                        <div className="stat-value">{avg}%</div>
                        <div className="stat-label">Average Score</div>
                    </div>
                </div>
            </div>

            {/* Average progress bar */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="section-title" style={{ margin: 0 }}>Overall Progress</span>
                    <span className={`badge ${grade(avg).cls}`}>{grade(avg).label}</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${avg}%` }}></div>
                </div>
            </div>

            {/* Marks table */}
            <div className="card">
                <h3 className="section-title">My Grades</h3>
                {marks.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No grades yet. Your teacher will assign marks soon.
                    </p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marks.map((m) => {
                                    const g = grade(m.score);
                                    return (
                                        <tr key={m._id}>
                                            <td style={{ fontWeight: 600 }}>
                                                {m.courseId?.title || "—"}
                                            </td>
                                            <td>{m.score}/100</td>
                                            <td>
                                                <span className={`badge ${g.cls}`}>{g.label}</span>
                                            </td>
                                            <td style={{ minWidth: 120 }}>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${m.score}%` }}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
