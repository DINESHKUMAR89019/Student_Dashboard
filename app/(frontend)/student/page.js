"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ThemeToggle";

export default function StudentDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [marks, setMarks] = useState([]);
    const [specialCourses, setSpecialCourses] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [events, setEvents] = useState([]);
    const [semResults, setSemResults] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [projects, setProjects] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [skills, setSkills] = useState([]);
    const [goals, setGoals] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Goal form state
    const [goalForm, setGoalForm] = useState({ title: "", description: "", category: "academic", priority: "medium", targetDate: "" });
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [saving, setSaving] = useState(false);

    // AI Quiz state
    const [quizTopic, setQuizTopic] = useState("");
    const [quizCount, setQuizCount] = useState(5);
    const [quizDifficulty, setQuizDifficulty] = useState("medium");
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizScore, setQuizScore] = useState(null);
    const [quizError, setQuizError] = useState("");

    // Event creation form state
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({ title: "", eventDate: "", eventType: "other", role: "participant", description: "", achievement: "", venue: "" });
    const [eventSaving, setEventSaving] = useState(false);

    // Semester result form state
    const [showSemForm, setShowSemForm] = useState(false);
    const [semForm, setSemForm] = useState({ semester: "", sgpa: "", cgpa: "", totalCredits: "", earnedCredits: "", backlogs: "0", status: "pass", academicYear: "" });
    const [semSaving, setSemSaving] = useState(false);

    const loadData = useCallback(async (uid) => {
        try {
            const endpoints = [
                `/api/marks?studentId=${uid}`,
                `/api/courses?studentId=${uid}`,
                `/api/special-courses?studentId=${uid}`,
                `/api/certifications?studentId=${uid}`,
                `/api/events?studentId=${uid}`,
                `/api/semester-results?studentId=${uid}`,
                `/api/attendance?studentId=${uid}`,
                `/api/assignments?studentId=${uid}`,
                `/api/projects?studentId=${uid}`,
                `/api/announcements?active=true`,
                `/api/skills?studentId=${uid}`,
                `/api/goals?studentId=${uid}`,
                `/api/leaderboard`,
            ];
            const responses = await Promise.all(endpoints.map(e => fetch(e)));
            const data = await Promise.all(responses.map(r => r.json()));

            setMarks(Array.isArray(data[0]) ? data[0] : []);
            setCourses(Array.isArray(data[1]) ? data[1] : []);
            setSpecialCourses(Array.isArray(data[2]) ? data[2] : []);
            setCertifications(Array.isArray(data[3]) ? data[3] : []);
            setEvents(Array.isArray(data[4]) ? data[4] : []);
            setSemResults(Array.isArray(data[5]) ? data[5] : []);
            setAttendance(Array.isArray(data[6]) ? data[6] : []);
            setAssignments(Array.isArray(data[7]) ? data[7] : []);
            setProjects(Array.isArray(data[8]) ? data[8] : []);
            setAnnouncements(Array.isArray(data[9]) ? data[9] : []);
            setSkills(Array.isArray(data[10]) ? data[10] : []);
            setGoals(Array.isArray(data[11]) ? data[11] : []);
            setLeaderboard(Array.isArray(data[12]) ? data[12] : []);
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/"); return; }
        const u = JSON.parse(stored);
        if (u.role !== "student") { router.push("/"); return; }
        setUser(u);
        loadData(u._id);
    }, [router, loadData]);

    function logout() {
        localStorage.removeItem("user");
        router.push("/");
    }

    async function addGoal(e) {
        e.preventDefault();
        if (!goalForm.title) return;
        setSaving(true);
        try {
            const res = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...goalForm, studentId: user._id }),
            });
            if (res.ok) {
                setGoalForm({ title: "", description: "", category: "academic", priority: "medium", targetDate: "" });
                setShowGoalForm(false);
                loadData(user._id);
            }
        } catch { }
        setSaving(false);
    }

    async function updateGoalProgress(goalId, progress) {
        try {
            await fetch("/api/goals", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    goalId,
                    progress,
                    status: progress >= 100 ? "completed" : "in-progress",
                }),
            });
            loadData(user._id);
        } catch { }
    }

    // AI Quiz functions
    async function generateQuiz() {
        if (!quizTopic.trim()) return;
        setQuizLoading(true);
        setQuizError("");
        setQuizQuestions([]);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        try {
            const res = await fetch("/api/generate-mcq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: quizTopic, numberOfQuestions: quizCount, difficulty: quizDifficulty }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
            setQuizQuestions(data.questions || []);
        } catch (err) {
            setQuizError(err.message);
        }
        setQuizLoading(false);
    }

    function submitQuiz() {
        let correct = 0;
        quizQuestions.forEach((q) => {
            if (quizAnswers[q.id] === q.correctAnswer) correct++;
        });
        setQuizScore(correct);
        setQuizSubmitted(true);
    }

    // Event creation
    async function addEvent(e) {
        e.preventDefault();
        if (!eventForm.title || !eventForm.eventDate) return;
        setEventSaving(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...eventForm, studentId: user._id }),
            });
            if (res.ok) {
                setEventForm({ title: "", eventDate: "", eventType: "other", role: "participant", description: "", achievement: "", venue: "" });
                setShowEventForm(false);
                loadData(user._id);
            }
        } catch { }
        setEventSaving(false);
    }

    // Semester result addition
    async function addSemResult(e) {
        e.preventDefault();
        if (!semForm.semester || !semForm.sgpa) return;
        setSemSaving(true);
        try {
            const res = await fetch("/api/semester-results", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: user._id,
                    semester: Number(semForm.semester),
                    sgpa: Number(semForm.sgpa),
                    cgpa: semForm.cgpa ? Number(semForm.cgpa) : undefined,
                    totalCredits: Number(semForm.totalCredits) || 0,
                    earnedCredits: Number(semForm.earnedCredits) || 0,
                    backlogs: Number(semForm.backlogs) || 0,
                    status: semForm.status || "pass",
                    academicYear: semForm.academicYear || "",
                }),
            });
            if (res.ok) {
                setSemForm({ semester: "", sgpa: "", cgpa: "", totalCredits: "", earnedCredits: "", backlogs: "0", status: "pass", academicYear: "" });
                setShowSemForm(false);
                loadData(user._id);
            }
        } catch { }
        setSemSaving(false);
    }

    if (!user || loading) {
        return (
            <div className="auth-container">
                <div className="loader-spinner"></div>
            </div>
        );
    }

    // ─── Computed Stats ───
    const avg = marks.length > 0
        ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length)
        : 0;

    const latestCgpa = semResults.length > 0
        ? semResults[semResults.length - 1].cgpa || semResults[semResults.length - 1].sgpa
        : 0;

    const totalAttendance = attendance.length;
    const presentCount = attendance.filter(a => a.status === "present" || a.status === "late").length;
    const attendancePercent = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const pendingAssignments = assignments.filter(a => {
        const sub = a.submissions?.[0];
        return !sub && new Date(a.dueDate) > new Date();
    }).length;

    const completedGoals = goals.filter(g => g.status === "completed").length;

    const myRank = leaderboard.find(l => l.studentId === user._id)?.rank || "—";

    function grade(score) {
        if (score >= 90) return { label: "A+", cls: "badge-success" };
        if (score >= 80) return { label: "A", cls: "badge-success" };
        if (score >= 70) return { label: "B", cls: "badge-purple" };
        if (score >= 60) return { label: "C", cls: "badge-warning" };
        return { label: "F", cls: "badge-danger" };
    }

    function statusBadge(status) {
        const map = {
            "completed": "badge-success", "active": "badge-success", "presented": "badge-success",
            "in-progress": "badge-warning", "enrolled": "badge-purple", "graded": "badge-success",
            "expired": "badge-danger", "pass": "badge-success", "fail": "badge-danger",
            "pending": "badge-warning", "withheld": "badge-danger", "planning": "badge-purple",
            "submitted": "badge-warning", "late": "badge-danger", "returned": "badge-purple",
            "not-started": "badge-danger", "abandoned": "badge-danger",
        };
        return map[status] || "badge-purple";
    }

    function priorityBadge(p) {
        return { "low": "badge-success", "medium": "badge-warning", "high": "badge-danger", "urgent": "badge-danger" }[p] || "badge-purple";
    }

    function eventTypeIcon(type) {
        return { "hackathon": "💻", "seminar": "🎤", "workshop": "🔧", "sports": "⚽", "cultural": "🎭", "conference": "🏛️" }[type] || "📌";
    }

    function categoryIcon(cat) {
        return { "workshop": "🔧", "elective": "📖", "online": "💻", "summer": "☀️", "bridge": "🌉" }[cat] || "📚";
    }

    function skillCategoryIcon(cat) {
        return { "programming": "💻", "framework": "⚛️", "database": "🗄️", "devops": "🔄", "soft-skill": "🤝", "language": "🌐", "tools": "🛠️" }[cat] || "📦";
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "ai-quiz", label: "AI Quiz", icon: "🤖" },
        { id: "attendance", label: "Attendance", icon: "📋" },
        { id: "assignments", label: "Assignments", icon: "📝" },
        { id: "special-courses", label: "Special Courses", icon: "⭐" },
        { id: "certifications", label: "Certifications", icon: "🏅" },
        { id: "events", label: "Events", icon: "🎯" },
        { id: "projects", label: "Projects", icon: "💼" },
        { id: "skills", label: "Skills", icon: "🧠" },
        { id: "goals", label: "Goals", icon: "🎯" },
        { id: "semester-results", label: "Sem Results", icon: "📈" },
        { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
        { id: "announcements", label: "Notices", icon: "📢" },
    ];

    return (
        <div className="dashboard-layout">
            {/* ─── Sidebar ─── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🎓</div>
                    <span className="brand-text">LearnTrack</span>
                </div>

                <div className="sidebar-profile">
                    <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-role">Student</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            id={`nav-${tab.id}`}
                            className={`nav-item ${activeTab === tab.id ? "nav-active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span className="nav-icon">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                            {tab.id === "assignments" && pendingAssignments > 0 && (
                                <span className="nav-badge">{pendingAssignments}</span>
                            )}
                            {tab.id === "announcements" && announcements.length > 0 && (
                                <span className="nav-badge">{announcements.length}</span>
                            )}
                        </button>
                    ))}
                </nav>

                <button className="btn btn-ghost sidebar-logout" onClick={logout}>
                    🚪 Logout
                </button>
            </aside>

            {/* ─── Main Content ─── */}
            <main className="main-content">
                <div className="main-header">
                    <div>
                        <h1 className="page-title">
                            {tabs.find(t => t.id === activeTab)?.icon}{" "}
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="page-subtitle">Welcome back, {user.name}!</p>
                    </div>
                    <div className="header-actions">
                        <ThemeToggle />
                        <div className="rank-badge">
                            <span className="rank-label">Rank</span>
                            <span className="rank-value">#{myRank}</span>
                        </div>
                    </div>
                </div>

                {/* ═══════════════ OVERVIEW ═══════════════ */}
                {activeTab === "overview" && (
                    <div className="animate-in">
                        {/* Announcements Banner */}
                        {announcements.length > 0 && (
                            <div className="announcement-banner">
                                <span className="announcement-icon">📢</span>
                                <div className="announcement-text">
                                    <strong>{announcements[0].title}</strong>
                                    <span> — {announcements[0].content?.substring(0, 80)}{announcements[0].content?.length > 80 ? "…" : ""}</span>
                                </div>
                                {announcements.length > 1 && (
                                    <span className="badge badge-purple" style={{ marginLeft: "auto", cursor: "pointer" }}
                                        onClick={() => setActiveTab("announcements")}>
                                        +{announcements.length - 1} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Stat Cards */}
                        <div className="stats-grid">
                            <div className="hero-stat" onClick={() => setActiveTab("semester-results")}>
                                <div className="hero-stat-icon" style={{ background: "var(--teal-bg)", color: "var(--teal)" }}>📈</div>
                                <div className="hero-stat-value">{latestCgpa > 0 ? latestCgpa.toFixed(2) : "—"}</div>
                                <div className="hero-stat-label">CGPA</div>
                            </div>
                            <div className="hero-stat" onClick={() => setActiveTab("leaderboard")}>
                                <div className="hero-stat-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>🏆</div>
                                <div className="hero-stat-value">#{myRank}</div>
                                <div className="hero-stat-label">Class Rank</div>
                            </div>
                            <div className="hero-stat" onClick={() => setActiveTab("attendance")}>
                                <div className="hero-stat-icon" style={{ background: attendancePercent >= 75 ? "var(--success-bg)" : "var(--danger-bg)", color: attendancePercent >= 75 ? "var(--success)" : "var(--danger)" }}>📋</div>
                                <div className="hero-stat-value">{attendancePercent}%</div>
                                <div className="hero-stat-label">Attendance</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>📚</div>
                                <div className="hero-stat-value">{courses.length}</div>
                                <div className="hero-stat-label">Courses</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>📊</div>
                                <div className="hero-stat-value">{avg}%</div>
                                <div className="hero-stat-label">Avg Score</div>
                            </div>
                            <div className="hero-stat" onClick={() => setActiveTab("certifications")}>
                                <div className="hero-stat-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>🏅</div>
                                <div className="hero-stat-value">{certifications.length}</div>
                                <div className="hero-stat-label">Certifications</div>
                            </div>
                            <div className="hero-stat" onClick={() => setActiveTab("projects")}>
                                <div className="hero-stat-icon" style={{ background: "var(--pink-bg)", color: "var(--pink)" }}>💼</div>
                                <div className="hero-stat-value">{projects.length}</div>
                                <div className="hero-stat-label">Projects</div>
                            </div>
                            <div className="hero-stat" onClick={() => setActiveTab("goals")}>
                                <div className="hero-stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>✅</div>
                                <div className="hero-stat-value">{completedGoals}/{goals.length}</div>
                                <div className="hero-stat-label">Goals Done</div>
                            </div>
                        </div>

                        {/* Progress + Grades grid */}
                        <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
                            <div className="card glass-card">
                                <h3 className="section-title">Overall Progress</h3>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Average Score</span>
                                    <span className={`badge ${grade(avg).cls}`}>{grade(avg).label}</span>
                                </div>
                                <div className="progress-track progress-lg">
                                    <div className="progress-fill" style={{ width: `${avg}%` }}></div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Attendance</span>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: attendancePercent >= 75 ? "var(--success)" : "var(--danger)" }}>
                                        {attendancePercent}%
                                    </span>
                                </div>
                                <div className="progress-track progress-lg">
                                    <div className="progress-fill" style={{
                                        width: `${attendancePercent}%`,
                                        background: attendancePercent >= 75
                                            ? "linear-gradient(90deg, #22c55e, #14b8a6)"
                                            : "linear-gradient(90deg, #ef4444, #f59e0b)",
                                    }}></div>
                                </div>
                            </div>

                            <div className="card glass-card">
                                <h3 className="section-title">Quick Stats</h3>
                                <div className="quick-stats-list">
                                    <div className="quick-stat-row">
                                        <span>📝 Pending Assignments</span>
                                        <span className={`badge ${pendingAssignments > 0 ? "badge-warning" : "badge-success"}`}>
                                            {pendingAssignments}
                                        </span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>⭐ Special Courses</span>
                                        <span className="badge badge-purple">{specialCourses.length}</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>🎯 Events Participated</span>
                                        <span className="badge badge-success">{events.length}</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>🧠 Skills Tracked</span>
                                        <span className="badge badge-purple">{skills.length}</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>📈 Semesters Completed</span>
                                        <span className="badge badge-success">{semResults.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Grades */}
                        <div className="card glass-card">
                            <h3 className="section-title">Recent Grades</h3>
                            {marks.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">📝</span><p>No grades yet.</p></div>
                            ) : (
                                <div className="table-wrap">
                                    <table>
                                        <thead><tr><th>Course</th><th>Score</th><th>Grade</th><th>Progress</th></tr></thead>
                                        <tbody>
                                            {marks.slice(0, 5).map((m) => {
                                                const g = grade(m.score);
                                                return (
                                                    <tr key={m._id}>
                                                        <td style={{ fontWeight: 600 }}>{m.courseId?.title || "—"}</td>
                                                        <td>{m.score}/100</td>
                                                        <td><span className={`badge ${g.cls}`}>{g.label}</span></td>
                                                        <td style={{ minWidth: 120 }}>
                                                            <div className="progress-track"><div className="progress-fill" style={{ width: `${m.score}%` }}></div></div>
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
                )}

                {/* ═══════════════ AI QUIZ ═══════════════ */}
                {activeTab === "ai-quiz" && (
                    <div className="animate-in">
                        {/* Quiz Generator Card */}
                        <div className="card glass-card" style={{ marginBottom: "1.5rem" }}>
                            <h3 className="section-title">🤖 AI-Powered Quiz Generator</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                Enter any topic and our AI will generate MCQ questions for you to test your knowledge.
                            </p>
                            <div className="grid-2" style={{ marginBottom: "1rem" }}>
                                <div className="form-group">
                                    <label className="label">Topic</label>
                                    <input className="input-field" placeholder="e.g. JavaScript Promises, Data Structures, Machine Learning"
                                        value={quizTopic} onChange={e => setQuizTopic(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ display: "flex", gap: "0.75rem" }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="label">Questions</label>
                                        <select className="input-field" value={quizCount} onChange={e => setQuizCount(Number(e.target.value))}>
                                            <option value={5}>5 Questions</option>
                                            <option value={10}>10 Questions</option>
                                            <option value={15}>15 Questions</option>
                                        </select>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="label">Difficulty</label>
                                        <select className="input-field" value={quizDifficulty} onChange={e => setQuizDifficulty(e.target.value)}>
                                            <option value="easy">Easy</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={generateQuiz}
                                disabled={quizLoading || !quizTopic.trim()} style={{ width: "100%" }}>
                                {quizLoading ? "🔄 Generating Quiz…" : "✨ Generate Quiz"}
                            </button>
                            {quizError && (
                                <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "var(--danger-bg)", color: "var(--danger)",
                                    borderRadius: "0.75rem", fontSize: "0.85rem" }}>
                                    ❌ {quizError}
                                </div>
                            )}
                        </div>

                        {/* Quiz Questions */}
                        {quizQuestions.length > 0 && (
                            <div className="card glass-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                    <h3 className="section-title" style={{ marginBottom: 0 }}>
                                        📝 Quiz: {quizTopic}
                                        <span className={`badge ${quizDifficulty === "easy" ? "badge-success" : quizDifficulty === "medium" ? "badge-warning" : "badge-danger"}`}
                                            style={{ marginLeft: "0.75rem", fontSize: "0.7rem" }}>
                                            {quizDifficulty}
                                        </span>
                                    </h3>
                                    {quizSubmitted && (
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: quizScore >= quizQuestions.length * 0.7 ? "var(--success)" : quizScore >= quizQuestions.length * 0.4 ? "var(--warning)" : "var(--danger)" }}>
                                                {quizScore}/{quizQuestions.length}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Score</div>
                                        </div>
                                    )}
                                </div>

                                {quizQuestions.map((q, qIdx) => {
                                    const isCorrect = quizSubmitted && quizAnswers[q.id] === q.correctAnswer;
                                    const isWrong = quizSubmitted && quizAnswers[q.id] !== undefined && quizAnswers[q.id] !== q.correctAnswer;
                                    const unanswered = quizSubmitted && quizAnswers[q.id] === undefined;
                                    return (
                                        <div key={q.id} style={{
                                            marginBottom: "1.5rem", padding: "1.25rem", borderRadius: "1rem",
                                            background: quizSubmitted
                                                ? isCorrect ? "rgba(34, 197, 94, 0.06)" : isWrong ? "rgba(239, 68, 68, 0.06)" : "rgba(245, 158, 11, 0.06)"
                                                : "var(--card-nested)",
                                            border: quizSubmitted
                                                ? isCorrect ? "1px solid rgba(34, 197, 94, 0.2)" : isWrong ? "1px solid rgba(239, 68, 68, 0.2)" : "1px solid rgba(245, 158, 11, 0.2)"
                                                : "1px solid var(--border)",
                                            transition: "all 0.3s ease",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "1rem" }}>
                                                <span style={{
                                                    background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                                                    color: "#fff", borderRadius: "0.5rem", padding: "0.25rem 0.6rem",
                                                    fontSize: "0.75rem", fontWeight: 700, minWidth: "28px", textAlign: "center",
                                                }}>Q{qIdx + 1}</span>
                                                <p style={{ fontSize: "0.95rem", fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{q.question}</p>
                                            </div>

                                            <div style={{ display: "grid", gap: "0.5rem", marginLeft: "2.5rem" }}>
                                                {q.options.map((opt, optIdx) => {
                                                    const selected = quizAnswers[q.id] === optIdx;
                                                    const isCorrectOpt = quizSubmitted && optIdx === q.correctAnswer;
                                                    const isWrongSel = quizSubmitted && selected && optIdx !== q.correctAnswer;
                                                    return (
                                                        <label key={optIdx} style={{
                                                            display: "flex", alignItems: "center", gap: "0.75rem",
                                                            padding: "0.75rem 1rem", borderRadius: "0.75rem", cursor: quizSubmitted ? "default" : "pointer",
                                                            border: isCorrectOpt ? "1.5px solid var(--success)" : isWrongSel ? "1.5px solid var(--danger)" : selected ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
                                                            background: isCorrectOpt ? "rgba(34, 197, 94, 0.08)" : isWrongSel ? "rgba(239, 68, 68, 0.08)" : selected ? "var(--accent-glow)" : "transparent",
                                                            transition: "all 0.2s ease",
                                                        }}>
                                                            <input type="radio" name={`q-${q.id}`}
                                                                checked={selected} disabled={quizSubmitted}
                                                                onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                                                                style={{ accentColor: "var(--accent)" }} />
                                                            <span style={{ fontSize: "0.85rem", fontWeight: selected ? 600 : 400 }}>
                                                                {String.fromCharCode(65 + optIdx)}. {opt}
                                                            </span>
                                                            {isCorrectOpt && <span style={{ marginLeft: "auto", fontSize: "0.85rem" }}>✅</span>}
                                                            {isWrongSel && <span style={{ marginLeft: "auto", fontSize: "0.85rem" }}>❌</span>}
                                                        </label>
                                                    );
                                                })}
                                            </div>

                                            {quizSubmitted && q.explanation && (
                                                <div style={{
                                                    marginTop: "0.75rem", marginLeft: "2.5rem", padding: "0.75rem 1rem",
                                                    background: "var(--accent-glow)", borderRadius: "0.75rem",
                                                    fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5,
                                                    borderLeft: "3px solid var(--accent)",
                                                }}>
                                                    💡 {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {!quizSubmitted ? (
                                    <button className="btn btn-primary" onClick={submitQuiz}
                                        disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                                        style={{ width: "100%", marginTop: "0.5rem" }}>
                                        {Object.keys(quizAnswers).length < quizQuestions.length
                                            ? `Answer all questions (${Object.keys(quizAnswers).length}/${quizQuestions.length})`
                                            : "Submit Quiz →"}
                                    </button>
                                ) : (
                                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                                        <button className="btn btn-primary" onClick={() => {
                                            setQuizQuestions([]); setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null);
                                        }} style={{ flex: 1 }}>
                                            🔄 Try New Topic
                                        </button>
                                        <button className="btn btn-primary" onClick={() => {
                                            setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null);
                                        }} style={{ flex: 1, background: "linear-gradient(135deg, #14b8a6, #22c55e)" }}>
                                            🔁 Retry Same Quiz
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ═══════════════ ATTENDANCE ═══════════════ */}
                {activeTab === "attendance" && (
                    <div className="animate-in">
                        <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                            <div className="hero-stat"><div className="hero-stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>✅</div>
                                <div className="hero-stat-value">{attendance.filter(a => a.status === "present").length}</div><div className="hero-stat-label">Present</div></div>
                            <div className="hero-stat"><div className="hero-stat-icon" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>❌</div>
                                <div className="hero-stat-value">{attendance.filter(a => a.status === "absent").length}</div><div className="hero-stat-label">Absent</div></div>
                            <div className="hero-stat"><div className="hero-stat-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>⏰</div>
                                <div className="hero-stat-value">{attendance.filter(a => a.status === "late").length}</div><div className="hero-stat-label">Late</div></div>
                            <div className="hero-stat"><div className="hero-stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>📊</div>
                                <div className="hero-stat-value">{attendancePercent}%</div><div className="hero-stat-label">Overall</div></div>
                        </div>

                        <div className="card glass-card">
                            <h3 className="section-title">Attendance Records</h3>
                            {attendance.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">📋</span><p>No attendance records yet.</p></div>
                            ) : (
                                <div className="table-wrap">
                                    <table>
                                        <thead><tr><th>Date</th><th>Course</th><th>Status</th><th>Remarks</th></tr></thead>
                                        <tbody>
                                            {attendance.map((a) => (
                                                <tr key={a._id}>
                                                    <td>{new Date(a.date).toLocaleDateString()}</td>
                                                    <td style={{ fontWeight: 600 }}>{a.courseId?.title || "—"}</td>
                                                    <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                                                    <td style={{ color: "var(--text-muted)" }}>{a.remarks || "—"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ ASSIGNMENTS ═══════════════ */}
                {activeTab === "assignments" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">📝 Assignments</h3>
                            {assignments.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">📝</span><p>No assignments yet.</p></div>
                            ) : (
                                <div className="feature-grid">
                                    {assignments.map((a) => {
                                        const sub = a.submissions?.[0];
                                        const isPast = new Date(a.dueDate) < new Date();
                                        const statusText = sub ? sub.status : (isPast ? "missing" : "pending");
                                        return (
                                            <div key={a._id} className="feature-card">
                                                <div className="feature-card-header">
                                                    <span className="feature-card-icon">
                                                        {a.type === "quiz" ? "❓" : a.type === "lab" ? "🧪" : a.type === "project" ? "💼" : a.type === "midterm" ? "📋" : a.type === "final" ? "🎓" : "📝"}
                                                    </span>
                                                    <span className={`badge ${statusBadge(statusText)}`}>{statusText}</span>
                                                </div>
                                                <h4 className="feature-card-title">{a.title}</h4>
                                                <p className="feature-card-desc">{a.courseId?.title || "Unknown Course"}</p>
                                                <div className="feature-card-meta">
                                                    <span className="meta-tag">📅 Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                                                    <span className="meta-tag">📊 {a.totalMarks} marks</span>
                                                    {sub?.score != null && (
                                                        <span className="meta-tag achievement-tag">🏆 {sub.score}/{a.totalMarks}</span>
                                                    )}
                                                </div>
                                                {sub?.feedback && (
                                                    <div className="feedback-box">
                                                        <span className="feedback-label">Feedback:</span> {sub.feedback}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ SPECIAL COURSES ═══════════════ */}
                {activeTab === "special-courses" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">⭐ Special Courses</h3>
                            {specialCourses.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">⭐</span><p>No special courses enrolled yet.</p></div>
                            ) : (
                                <div className="feature-grid">
                                    {specialCourses.map((sc) => (
                                        <div key={sc._id} className="feature-card">
                                            <div className="feature-card-header">
                                                <span className="feature-card-icon">{categoryIcon(sc.category)}</span>
                                                <span className={`badge ${statusBadge(sc.status)}`}>{sc.status}</span>
                                            </div>
                                            <h4 className="feature-card-title">{sc.title}</h4>
                                            {sc.description && <p className="feature-card-desc">{sc.description}</p>}
                                            <div className="feature-card-meta">
                                                <span className="meta-tag">{sc.category}</span>
                                                {sc.platform && <span className="meta-tag">{sc.platform}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ CERTIFICATIONS ═══════════════ */}
                {activeTab === "certifications" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">🏅 Certifications</h3>
                            {certifications.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">🏅</span><p>No certifications earned yet.</p></div>
                            ) : (
                                <div className="feature-grid">
                                    {certifications.map((cert) => (
                                        <div key={cert._id} className="feature-card cert-card">
                                            <div className="feature-card-header">
                                                <span className="feature-card-icon">🏅</span>
                                                <span className={`badge ${statusBadge(cert.status)}`}>{cert.status}</span>
                                            </div>
                                            <h4 className="feature-card-title">{cert.title}</h4>
                                            <p className="feature-card-desc">Issued by <strong>{cert.issuedBy}</strong></p>
                                            <div className="feature-card-meta">
                                                <span className="meta-tag">{cert.category}</span>
                                                <span className="meta-tag">{new Date(cert.issueDate).toLocaleDateString()}</span>
                                                {cert.credentialId && <span className="meta-tag">🔑 {cert.credentialId}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ EVENTS ═══════════════ */}
                {activeTab === "events" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 className="section-title" style={{ marginBottom: 0 }}>🎯 Event Participation</h3>
                                <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                                    onClick={() => setShowEventForm(!showEventForm)}>
                                    {showEventForm ? "Cancel" : "+ Add Event"}
                                </button>
                            </div>

                            {showEventForm && (
                                <form onSubmit={addEvent} className="goal-form animate-in" style={{ marginBottom: "1.5rem" }}>
                                    <div className="grid-2">
                                        <div className="form-group"><label className="label">Event Title</label>
                                            <input className="input-field" placeholder="e.g. Hackathon 2026" value={eventForm.title}
                                                onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} required />
                                        </div>
                                        <div className="form-group"><label className="label">Event Date</label>
                                            <input type="date" className="input-field" value={eventForm.eventDate}
                                                onChange={e => setEventForm(p => ({ ...p, eventDate: e.target.value }))} required />
                                        </div>
                                        <div className="form-group"><label className="label">Event Type</label>
                                            <select className="input-field" value={eventForm.eventType}
                                                onChange={e => setEventForm(p => ({ ...p, eventType: e.target.value }))}>
                                                <option value="hackathon">Hackathon</option><option value="seminar">Seminar</option>
                                                <option value="workshop">Workshop</option><option value="sports">Sports</option>
                                                <option value="cultural">Cultural</option><option value="conference">Conference</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="label">Your Role</label>
                                            <select className="input-field" value={eventForm.role}
                                                onChange={e => setEventForm(p => ({ ...p, role: e.target.value }))}>
                                                <option value="participant">Participant</option><option value="organizer">Organizer</option>
                                                <option value="volunteer">Volunteer</option><option value="speaker">Speaker</option>
                                                <option value="winner">Winner</option>
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="label">Venue</label>
                                            <input className="input-field" placeholder="e.g. Main Auditorium" value={eventForm.venue}
                                                onChange={e => setEventForm(p => ({ ...p, venue: e.target.value }))} />
                                        </div>
                                        <div className="form-group"><label className="label">Achievement</label>
                                            <input className="input-field" placeholder="e.g. 1st Place" value={eventForm.achievement}
                                                onChange={e => setEventForm(p => ({ ...p, achievement: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="form-group"><label className="label">Description (optional)</label>
                                        <input className="input-field" placeholder="Brief description of the event" value={eventForm.description}
                                            onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={eventSaving} style={{ width: "100%" }}>
                                        {eventSaving ? "Saving…" : "Add Event"}
                                    </button>
                                </form>
                            )}

                            {events.length === 0 && !showEventForm ? (
                                <div className="empty-state"><span className="empty-icon">🎯</span><p>No events participated in yet. Click "+ Add Event" to record your first event!</p></div>
                            ) : (
                                <div className="timeline">
                                    {events.map((ev) => (
                                        <div key={ev._id} className="timeline-item">
                                            <div className="timeline-dot">{eventTypeIcon(ev.eventType)}</div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <h4>{ev.title}</h4>
                                                    <span className="meta-tag">{ev.eventType}</span>
                                                </div>
                                                {ev.description && <p className="feature-card-desc">{ev.description}</p>}
                                                <div className="feature-card-meta">
                                                    <span className="meta-tag">📅 {new Date(ev.eventDate).toLocaleDateString()}</span>
                                                    <span className="meta-tag">👤 {ev.role}</span>
                                                    {ev.venue && <span className="meta-tag">📍 {ev.venue}</span>}
                                                    {ev.achievement && <span className="meta-tag achievement-tag">🏆 {ev.achievement}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ PROJECTS ═══════════════ */}
                {activeTab === "projects" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">💼 Project Portfolio</h3>
                            {projects.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">💼</span><p>No projects yet. Start building!</p></div>
                            ) : (
                                <div className="feature-grid">
                                    {projects.map((p) => (
                                        <div key={p._id} className="feature-card project-card">
                                            <div className="feature-card-header">
                                                <span className="feature-card-icon">
                                                    {p.category === "web" ? "🌐" : p.category === "mobile" ? "📱" : p.category === "ml-ai" ? "🤖" : p.category === "iot" ? "📡" : p.category === "data-science" ? "📊" : p.category === "cybersecurity" ? "🔒" : "💻"}
                                                </span>
                                                <span className={`badge ${statusBadge(p.status)}`}>{p.status}</span>
                                            </div>
                                            <h4 className="feature-card-title">{p.title}</h4>
                                            {p.description && <p className="feature-card-desc">{p.description}</p>}
                                            {p.techStack?.length > 0 && (
                                                <div className="tech-stack">
                                                    {p.techStack.map((tech, i) => (
                                                        <span key={i} className="tech-tag">{tech}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="feature-card-meta">
                                                <span className="meta-tag">{p.category}</span>
                                                {p.mentor && <span className="meta-tag">👨‍🏫 {p.mentor}</span>}
                                                {p.teamMembers?.length > 0 && <span className="meta-tag">👥 {p.teamMembers.length + 1} members</span>}
                                                {p.grade && <span className="meta-tag achievement-tag">📊 {p.grade}</span>}
                                            </div>
                                            <div className="project-links">
                                                {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="project-link">📦 Repository</a>}
                                                {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link live">🌐 Live Demo</a>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ SKILLS ═══════════════ */}
                {activeTab === "skills" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">🧠 Skills Matrix</h3>
                            {skills.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">🧠</span><p>No skills tracked yet.</p></div>
                            ) : (
                                <div className="skills-grid">
                                    {skills.map((skill) => (
                                        <div key={skill._id} className="skill-card">
                                            <div className="skill-header">
                                                <span className="skill-icon">{skillCategoryIcon(skill.category)}</span>
                                                <h4 className="skill-name">{skill.name}</h4>
                                                {skill.verified && <span className="verified-badge" title="Verified by teacher">✓</span>}
                                            </div>
                                            <div className="skill-category">{skill.category}</div>
                                            <div className="skill-bars">
                                                {[1, 2, 3, 4, 5].map((level) => (
                                                    <div
                                                        key={level}
                                                        className={`skill-bar-segment ${level <= skill.proficiency ? "filled" : ""}`}
                                                    ></div>
                                                ))}
                                            </div>
                                            <div className="skill-level">
                                                {skill.proficiency === 1 ? "Beginner" : skill.proficiency === 2 ? "Elementary" : skill.proficiency === 3 ? "Intermediate" : skill.proficiency === 4 ? "Advanced" : "Expert"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ GOALS ═══════════════ */}
                {activeTab === "goals" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 className="section-title" style={{ marginBottom: 0 }}>🎯 Study Goals</h3>
                                <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                                    onClick={() => setShowGoalForm(!showGoalForm)}>
                                    {showGoalForm ? "Cancel" : "+ Add Goal"}
                                </button>
                            </div>

                            {showGoalForm && (
                                <form onSubmit={addGoal} className="goal-form animate-in">
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="label">Goal Title</label>
                                            <input className="input-field" placeholder="e.g. Learn React" value={goalForm.title}
                                                onChange={e => setGoalForm(p => ({ ...p, title: e.target.value }))} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Category</label>
                                            <select className="input-field" value={goalForm.category}
                                                onChange={e => setGoalForm(p => ({ ...p, category: e.target.value }))}>
                                                <option value="academic">Academic</option>
                                                <option value="skill">Skill</option>
                                                <option value="career">Career</option>
                                                <option value="personal">Personal</option>
                                                <option value="certification">Certification</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Priority</label>
                                            <select className="input-field" value={goalForm.priority}
                                                onChange={e => setGoalForm(p => ({ ...p, priority: e.target.value }))}>
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Target Date</label>
                                            <input type="date" className="input-field" value={goalForm.targetDate}
                                                onChange={e => setGoalForm(p => ({ ...p, targetDate: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="label">Description (optional)</label>
                                        <input className="input-field" placeholder="Brief description" value={goalForm.description}
                                            onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>
                                        {saving ? "Saving…" : "Create Goal"}
                                    </button>
                                </form>
                            )}

                            {goals.length === 0 && !showGoalForm ? (
                                <div className="empty-state"><span className="empty-icon">🎯</span><p>No goals set. Create your first goal!</p></div>
                            ) : (
                                <div className="goals-list">
                                    {goals.map((goal) => (
                                        <div key={goal._id} className="goal-card">
                                            <div className="goal-header">
                                                <div>
                                                    <h4 className="goal-title">{goal.title}</h4>
                                                    {goal.description && <p className="feature-card-desc" style={{ margin: 0 }}>{goal.description}</p>}
                                                </div>
                                                <div className="goal-badges">
                                                    <span className={`badge ${priorityBadge(goal.priority)}`}>{goal.priority}</span>
                                                    <span className={`badge ${statusBadge(goal.status)}`}>{goal.status}</span>
                                                </div>
                                            </div>
                                            <div className="goal-progress-section">
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Progress</span>
                                                    <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>{goal.progress}%</span>
                                                </div>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{
                                                        width: `${goal.progress}%`,
                                                        background: goal.progress >= 100
                                                            ? "linear-gradient(90deg, #22c55e, #14b8a6)"
                                                            : "linear-gradient(90deg, var(--gradient-start), var(--gradient-end))",
                                                    }}></div>
                                                </div>
                                                {goal.status !== "completed" && (
                                                    <div className="goal-actions">
                                                        {[25, 50, 75, 100].map(p => (
                                                            <button key={p} className="goal-progress-btn"
                                                                onClick={() => updateGoalProgress(goal._id, p)}>
                                                                {p}%
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="feature-card-meta" style={{ marginTop: "0.5rem" }}>
                                                <span className="meta-tag">{goal.category}</span>
                                                {goal.targetDate && <span className="meta-tag">📅 {new Date(goal.targetDate).toLocaleDateString()}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ SEMESTER RESULTS ═══════════════ */}
                {activeTab === "semester-results" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 className="section-title" style={{ marginBottom: 0 }}>📈 Semester Results</h3>
                                <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                                    onClick={() => setShowSemForm(!showSemForm)}>
                                    {showSemForm ? "Cancel" : "+ Add Result"}
                                </button>
                            </div>

                            {showSemForm && (
                                <form onSubmit={addSemResult} className="goal-form animate-in" style={{ marginBottom: "1.5rem" }}>
                                    <div className="grid-2">
                                        <div className="form-group"><label className="label">Semester (1-8)</label>
                                            <input type="number" min="1" max="8" className="input-field" placeholder="e.g. 3" value={semForm.semester}
                                                onChange={e => setSemForm(p => ({ ...p, semester: e.target.value }))} required />
                                        </div>
                                        <div className="form-group"><label className="label">SGPA (0-10)</label>
                                            <input type="number" min="0" max="10" step="0.01" className="input-field" placeholder="8.5" value={semForm.sgpa}
                                                onChange={e => setSemForm(p => ({ ...p, sgpa: e.target.value }))} required />
                                        </div>
                                        <div className="form-group"><label className="label">CGPA (0-10)</label>
                                            <input type="number" min="0" max="10" step="0.01" className="input-field" placeholder="8.2" value={semForm.cgpa}
                                                onChange={e => setSemForm(p => ({ ...p, cgpa: e.target.value }))} />
                                        </div>
                                        <div className="form-group"><label className="label">Total Credits</label>
                                            <input type="number" className="input-field" placeholder="24" value={semForm.totalCredits}
                                                onChange={e => setSemForm(p => ({ ...p, totalCredits: e.target.value }))} />
                                        </div>
                                        <div className="form-group"><label className="label">Earned Credits</label>
                                            <input type="number" className="input-field" placeholder="22" value={semForm.earnedCredits}
                                                onChange={e => setSemForm(p => ({ ...p, earnedCredits: e.target.value }))} />
                                        </div>
                                        <div className="form-group"><label className="label">Backlogs</label>
                                            <input type="number" className="input-field" value={semForm.backlogs}
                                                onChange={e => setSemForm(p => ({ ...p, backlogs: e.target.value }))} />
                                        </div>
                                        <div className="form-group"><label className="label">Status</label>
                                            <select className="input-field" value={semForm.status}
                                                onChange={e => setSemForm(p => ({ ...p, status: e.target.value }))}>
                                                <option value="pass">Pass</option><option value="fail">Fail</option>
                                                <option value="withheld">Withheld</option><option value="pending">Pending</option>
                                            </select>
                                        </div>
                                        <div className="form-group"><label className="label">Academic Year</label>
                                            <input className="input-field" placeholder="2025-2026" value={semForm.academicYear}
                                                onChange={e => setSemForm(p => ({ ...p, academicYear: e.target.value }))} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={semSaving} style={{ width: "100%" }}>
                                        {semSaving ? "Saving…" : "Add Result"}
                                    </button>
                                </form>
                            )}

                            {semResults.length === 0 && !showSemForm ? (
                                <div className="empty-state"><span className="empty-icon">📈</span><p>No semester results yet. Click "+ Add Result" to add your first result!</p></div>
                            ) : (
                                <>
                                    <div className="sgpa-chart">
                                        <div className="sgpa-chart-bars">
                                            {semResults.map((sr) => {
                                                const height = (sr.sgpa / 10) * 100;
                                                return (
                                                    <div key={sr._id} className="sgpa-bar-wrap">
                                                        <span className="sgpa-bar-value">{sr.sgpa.toFixed(1)}</span>
                                                        <div className="sgpa-bar-track">
                                                            <div className="sgpa-bar-fill" style={{ height: `${height}%` }}></div>
                                                        </div>
                                                        <span className="sgpa-bar-label">Sem {sr.semester}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="table-wrap" style={{ marginTop: "1.5rem" }}>
                                        <table>
                                            <thead><tr><th>Semester</th><th>SGPA</th><th>CGPA</th><th>Credits</th><th>Backlogs</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {semResults.map((sr) => (
                                                    <tr key={sr._id}>
                                                        <td style={{ fontWeight: 600 }}>
                                                            Semester {sr.semester}
                                                            {sr.academicYear && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({sr.academicYear})</span>}
                                                        </td>
                                                        <td><span style={{ fontWeight: 700, color: sr.sgpa >= 8 ? "var(--success)" : sr.sgpa >= 6 ? "var(--warning)" : "var(--danger)" }}>{sr.sgpa.toFixed(2)}</span></td>
                                                        <td>{sr.cgpa ? sr.cgpa.toFixed(2) : "—"}</td>
                                                        <td>{sr.earnedCredits}/{sr.totalCredits}</td>
                                                        <td>{sr.backlogs > 0 ? <span className="badge badge-danger">{sr.backlogs}</span> : <span className="badge badge-success">0</span>}</td>
                                                        <td><span className={`badge ${statusBadge(sr.status)}`}>{sr.status}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ LEADERBOARD ═══════════════ */}
                {activeTab === "leaderboard" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">🏆 Class Leaderboard</h3>
                            {leaderboard.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">🏆</span><p>No rankings available yet.</p></div>
                            ) : (
                                <>
                                    {/* Top 3 podium */}
                                    {leaderboard.length >= 3 && (
                                        <div className="podium">
                                            <div className="podium-item silver">
                                                <div className="podium-avatar">{leaderboard[1].name.charAt(0)}</div>
                                                <div className="podium-name">{leaderboard[1].name}</div>
                                                <div className="podium-score">{leaderboard[1].avgScore}%</div>
                                                <div className="podium-rank">🥈 2nd</div>
                                            </div>
                                            <div className="podium-item gold">
                                                <div className="podium-avatar">{leaderboard[0].name.charAt(0)}</div>
                                                <div className="podium-name">{leaderboard[0].name}</div>
                                                <div className="podium-score">{leaderboard[0].avgScore}%</div>
                                                <div className="podium-rank">🥇 1st</div>
                                            </div>
                                            <div className="podium-item bronze">
                                                <div className="podium-avatar">{leaderboard[2].name.charAt(0)}</div>
                                                <div className="podium-name">{leaderboard[2].name}</div>
                                                <div className="podium-score">{leaderboard[2].avgScore}%</div>
                                                <div className="podium-rank">🥉 3rd</div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="table-wrap" style={{ marginTop: "1.5rem" }}>
                                        <table>
                                            <thead><tr><th>Rank</th><th>Student</th><th>Avg Score</th><th>Total Grades</th><th>Highest</th><th>Lowest</th></tr></thead>
                                            <tbody>
                                                {leaderboard.map((entry) => (
                                                    <tr key={entry.studentId} className={entry.studentId === user._id ? "highlight-row" : ""}>
                                                        <td>
                                                            <span className="rank-number">
                                                                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                                                            </span>
                                                        </td>
                                                        <td style={{ fontWeight: 600 }}>
                                                            {entry.name}
                                                            {entry.studentId === user._id && <span className="badge badge-purple" style={{ marginLeft: "0.5rem" }}>You</span>}
                                                        </td>
                                                        <td><span style={{ fontWeight: 700, color: entry.avgScore >= 80 ? "var(--success)" : entry.avgScore >= 60 ? "var(--warning)" : "var(--danger)" }}>{entry.avgScore}%</span></td>
                                                        <td>{entry.totalMarks}</td>
                                                        <td>{entry.highestScore}</td>
                                                        <td>{entry.lowestScore}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════════════ ANNOUNCEMENTS ═══════════════ */}
                {activeTab === "announcements" && (
                    <div className="animate-in">
                        <div className="card glass-card">
                            <h3 className="section-title">📢 Announcements</h3>
                            {announcements.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">📢</span><p>No announcements at the moment.</p></div>
                            ) : (
                                <div className="announcements-list">
                                    {announcements.map((ann) => (
                                        <div key={ann._id} className={`announcement-card priority-${ann.priority}`}>
                                            <div className="announcement-card-header">
                                                <h4>{ann.title}</h4>
                                                <span className={`badge ${priorityBadge(ann.priority)}`}>{ann.priority}</span>
                                            </div>
                                            <p className="announcement-card-body">{ann.content}</p>
                                            <div className="feature-card-meta">
                                                <span className="meta-tag">👤 {ann.teacherId?.name || "Teacher"}</span>
                                                {ann.courseId && <span className="meta-tag">📚 {ann.courseId.title}</span>}
                                                <span className="meta-tag">📅 {new Date(ann.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
