"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function TeacherDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Forms
    const [newCourse, setNewCourse] = useState("");
    const [markForm, setMarkForm] = useState({ studentId: "", courseId: "", score: "" });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const loadData = useCallback(async (uid) => {
        try {
            const [cRes, sRes, mRes] = await Promise.all([
                fetch(`/api/courses?teacherId=${uid}`),
                fetch("/api/students"),
                fetch(`/api/marks?teacherId=${uid}`),
            ]);
            setCourses(await cRes.json());
            setStudents(await sRes.json());
            setMarks(await mRes.json());
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/"); return; }
        const u = JSON.parse(stored);
        if (u.role !== "teacher") { router.push("/"); return; }
        setUser(u);
        loadData(u._id);
    }, [router, loadData]);

    function logout() {
        localStorage.removeItem("user");
        router.push("/");
    }

    async function addCourse(e) {
        e.preventDefault();
        if (!newCourse.trim()) return;
        setSaving(true);
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: newCourse.trim(), teacherId: user._id }),
            });
            if (res.ok) {
                setNewCourse("");
                setMsg("✅ Course added!");
                loadData(user._id);
            }
        } catch { }
        setSaving(false);
        setTimeout(() => setMsg(""), 3000);
    }

    async function assignMark(e) {
        e.preventDefault();
        const { studentId, courseId, score } = markForm;
        if (!studentId || !courseId || score === "") return;
        setSaving(true);
        try {
            const res = await fetch("/api/marks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, courseId, score: Number(score) }),
            });
            if (res.ok) {
                setMarkForm({ studentId: "", courseId: "", score: "" });
                setMsg("✅ Mark assigned!");
                loadData(user._id);
            }
        } catch { }
        setSaving(false);
        setTimeout(() => setMsg(""), 3000);
    }

    if (!user || loading) {
        return (
            <div className="auth-container">
                <p style={{ color: "var(--text-muted)" }}>Loading…</p>
            </div>
        );
    }

    return (
        <div className="container-app animate-in">
            {/* Header */}
            <div className="topbar">
                <span className="topbar-brand">🎓 Learning Tracker</span>
                <div className="topbar-user">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Hi, <strong>{user.name}</strong> <span className="badge badge-purple" style={{ marginLeft: 4 }}>Teacher</span>
                    </span>
                    <button className="btn btn-ghost" onClick={logout} style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}>
                        Logout
                    </button>
                </div>
            </div>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                Teacher Dashboard
            </h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                Manage courses, assign marks, and track performance
            </p>

            {msg && (
                <div style={{
                    background: "var(--success-bg)",
                    color: "var(--success)",
                    padding: "0.65rem 1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    fontSize: "0.85rem",
                    textAlign: "center",
                }}>
                    {msg}
                </div>
            )}

            {/* Stats */}
            <div className="grid-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>📚</div>
                    <div>
                        <div className="stat-value">{courses.length}</div>
                        <div className="stat-label">My Courses</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>👨‍🎓</div>
                    <div>
                        <div className="stat-value">{students.length}</div>
                        <div className="stat-label">Students</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>📝</div>
                    <div>
                        <div className="stat-value">{marks.length}</div>
                        <div className="stat-label">Marks Assigned</div>
                    </div>
                </div>
            </div>

            {/* Two-column forms */}
            <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
                {/* Add Course */}
                <div className="card">
                    <h3 className="section-title">➕ Add Course</h3>
                    <form onSubmit={addCourse}>
                        <div className="form-group">
                            <label className="label">Course Title</label>
                            <input
                                id="course-title"
                                className="input-field"
                                placeholder="e.g. Web Development"
                                value={newCourse}
                                onChange={(e) => setNewCourse(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>
                            {saving ? "Saving…" : "Add Course"}
                        </button>
                    </form>
                </div>

                {/* Assign Mark */}
                <div className="card">
                    <h3 className="section-title">📝 Assign Mark</h3>
                    <form onSubmit={assignMark}>
                        <div className="form-group">
                            <label className="label">Student</label>
                            <select
                                id="mark-student"
                                className="input-field"
                                value={markForm.studentId}
                                onChange={(e) => setMarkForm((p) => ({ ...p, studentId: e.target.value }))}
                                required
                            >
                                <option value="">Select student…</option>
                                {students.map((s) => (
                                    <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Course</label>
                            <select
                                id="mark-course"
                                className="input-field"
                                value={markForm.courseId}
                                onChange={(e) => setMarkForm((p) => ({ ...p, courseId: e.target.value }))}
                                required
                            >
                                <option value="">Select course…</option>
                                {courses.map((c) => (
                                    <option key={c._id} value={c._id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label">Score (0–100)</label>
                            <input
                                id="mark-score"
                                type="number"
                                min="0"
                                max="100"
                                className="input-field"
                                placeholder="85"
                                value={markForm.score}
                                onChange={(e) => setMarkForm((p) => ({ ...p, score: e.target.value }))}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>
                            {saving ? "Saving…" : "Assign Mark"}
                        </button>
                    </form>
                </div>
            </div>

            {/* Student Performance Table */}
            <div className="card">
                <h3 className="section-title">📊 Student Performance</h3>
                {marks.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        No marks assigned yet. Use the form above to get started.
                    </p>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marks.map((m) => {
                                    const score = m.score;
                                    let g, cls;
                                    if (score >= 90) { g = "A+"; cls = "badge-success"; }
                                    else if (score >= 80) { g = "A"; cls = "badge-success"; }
                                    else if (score >= 70) { g = "B"; cls = "badge-purple"; }
                                    else if (score >= 60) { g = "C"; cls = "badge-warning"; }
                                    else { g = "F"; cls = "badge-danger"; }

                                    return (
                                        <tr key={m._id}>
                                            <td style={{ fontWeight: 600 }}>{m.studentId?.name || "—"}</td>
                                            <td>{m.courseId?.title || "—"}</td>
                                            <td>{score}/100</td>
                                            <td><span className={`badge ${cls}`}>{g}</span></td>
                                            <td style={{ minWidth: 120 }}>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${score}%` }}></div>
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
