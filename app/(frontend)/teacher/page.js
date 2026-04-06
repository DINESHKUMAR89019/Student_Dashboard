"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../components/ThemeToggle";

export default function TeacherDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");
    const [activeSection, setActiveSection] = useState("courses");

    // ─── Form States ───
    const [newCourse, setNewCourse] = useState("");
    const [markForm, setMarkForm] = useState({ studentId: "", courseId: "", score: "" });
    const [scForm, setScForm] = useState({ title: "", studentId: "", category: "workshop", description: "", platform: "", status: "enrolled" });
    const [certForm, setCertForm] = useState({ title: "", issuedBy: "", studentId: "", category: "technical", credentialId: "", status: "active" });
    const [eventForm, setEventForm] = useState({ title: "", studentId: "", eventDate: "", eventType: "other", role: "participant", description: "", achievement: "", venue: "" });
    const [semForm, setSemForm] = useState({ studentId: "", semester: "", sgpa: "", cgpa: "", totalCredits: "", earnedCredits: "", backlogs: "0", status: "pass", academicYear: "" });
    const [attendForm, setAttendForm] = useState({ studentId: "", courseId: "", date: "", status: "present", remarks: "" });
    const [assignForm, setAssignForm] = useState({ title: "", courseId: "", dueDate: "", totalMarks: "100", type: "homework", description: "" });
    const [gradeForm, setGradeForm] = useState({ assignmentId: "", studentId: "", score: "", feedback: "", status: "graded" });
    const [projForm, setProjForm] = useState({ title: "", studentId: "", description: "", techStack: "", category: "web", status: "planning", repoUrl: "", liveUrl: "", mentor: "", teamMembers: "" });
    const [annForm, setAnnForm] = useState({ title: "", content: "", courseId: "", priority: "medium", targetAudience: "all" });
    const [skillForm, setSkillForm] = useState({ studentId: "", name: "", category: "programming", proficiency: "3" });

    // ─── Assignment list for grading ───
    const [assignmentsList, setAssignmentsList] = useState([]);

    // ─── AI Quiz state ───
    const [aiQuizTopic, setAiQuizTopic] = useState("");
    const [aiQuizCount, setAiQuizCount] = useState(5);
    const [aiQuizDifficulty, setAiQuizDifficulty] = useState("medium");
    const [aiQuizQuestions, setAiQuizQuestions] = useState([]);
    const [aiQuizLoading, setAiQuizLoading] = useState(false);
    const [aiQuizError, setAiQuizError] = useState("");

    const loadData = useCallback(async (uid) => {
        try {
            const [cRes, sRes, mRes, aRes] = await Promise.all([
                fetch(`/api/courses?teacherId=${uid}`),
                fetch("/api/students"),
                fetch(`/api/marks?teacherId=${uid}`),
                fetch(`/api/assignments?teacherId=${uid}`),
            ]);
            const [cData, sData, mData, aData] = await Promise.all([
                cRes.json(), sRes.json(), mRes.json(), aRes.json(),
            ]);
            setCourses(Array.isArray(cData) ? cData : []);
            setStudents(Array.isArray(sData) ? sData : []);
            setMarks(Array.isArray(mData) ? mData : []);
            setAssignmentsList(Array.isArray(aData) ? aData : []);
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

    function logout() { localStorage.removeItem("user"); router.push("/"); }
    function flash(message) { setMsg(message); setTimeout(() => setMsg(""), 3000); }

    // ─── Submit Handlers ───
    async function postData(url, body, resetFn, successMsg) {
        setSaving(true);
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) { resetFn(); flash(successMsg); loadData(user._id); }
            else { const d = await res.json(); flash(`❌ ${d.error || "Error"}`); }
        } catch { flash("❌ Network error"); }
        setSaving(false);
    }

    async function putData(url, body, resetFn, successMsg) {
        setSaving(true);
        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (res.ok) { resetFn(); flash(successMsg); loadData(user._id); }
        } catch { }
        setSaving(false);
    }

    const addCourse = (e) => { e.preventDefault(); if (!newCourse.trim()) return; postData("/api/courses", { title: newCourse.trim(), teacherId: user._id }, () => setNewCourse(""), "✅ Course added!"); };
    const assignMark = (e) => { e.preventDefault(); postData("/api/marks", { ...markForm, score: Number(markForm.score) }, () => setMarkForm({ studentId: "", courseId: "", score: "" }), "✅ Mark assigned!"); };
    const addSpecialCourse = (e) => { e.preventDefault(); postData("/api/special-courses", scForm, () => setScForm({ title: "", studentId: "", category: "workshop", description: "", platform: "", status: "enrolled" }), "✅ Special course added!"); };
    const addCert = (e) => { e.preventDefault(); postData("/api/certifications", certForm, () => setCertForm({ title: "", issuedBy: "", studentId: "", category: "technical", credentialId: "", status: "active" }), "✅ Certification added!"); };
    const addEvent = (e) => { e.preventDefault(); postData("/api/events", eventForm, () => setEventForm({ title: "", studentId: "", eventDate: "", eventType: "other", role: "participant", description: "", achievement: "", venue: "" }), "✅ Event added!"); };
    const addSemResult = (e) => {
        e.preventDefault();
        postData("/api/semester-results", {
            ...semForm, semester: Number(semForm.semester), sgpa: Number(semForm.sgpa),
            cgpa: semForm.cgpa ? Number(semForm.cgpa) : undefined,
            totalCredits: Number(semForm.totalCredits) || 0, earnedCredits: Number(semForm.earnedCredits) || 0, backlogs: Number(semForm.backlogs) || 0,
        }, () => setSemForm({ studentId: "", semester: "", sgpa: "", cgpa: "", totalCredits: "", earnedCredits: "", backlogs: "0", status: "pass", academicYear: "" }), "✅ Semester result added!");
    };
    const addAttendance = (e) => { e.preventDefault(); postData("/api/attendance", attendForm, () => setAttendForm({ studentId: "", courseId: "", date: "", status: "present", remarks: "" }), "✅ Attendance recorded!"); };
    const addAssignment = (e) => { e.preventDefault(); postData("/api/assignments", { ...assignForm, teacherId: user._id, totalMarks: Number(assignForm.totalMarks) }, () => setAssignForm({ title: "", courseId: "", dueDate: "", totalMarks: "100", type: "homework", description: "" }), "✅ Assignment created!"); };
    const gradeAssignment = (e) => {
        e.preventDefault();
        putData("/api/assignments", { ...gradeForm, score: Number(gradeForm.score) },
            () => setGradeForm({ assignmentId: "", studentId: "", score: "", feedback: "", status: "graded" }), "✅ Assignment graded!");
    };
    const addProject = (e) => {
        e.preventDefault();
        postData("/api/projects", {
            ...projForm,
            techStack: projForm.techStack ? projForm.techStack.split(",").map(s => s.trim()) : [],
            teamMembers: projForm.teamMembers ? projForm.teamMembers.split(",").map(s => s.trim()) : [],
        }, () => setProjForm({ title: "", studentId: "", description: "", techStack: "", category: "web", status: "planning", repoUrl: "", liveUrl: "", mentor: "", teamMembers: "" }), "✅ Project added!");
    };
    const addAnnouncement = (e) => { e.preventDefault(); postData("/api/announcements", { ...annForm, teacherId: user._id, courseId: annForm.courseId || undefined }, () => setAnnForm({ title: "", content: "", courseId: "", priority: "medium", targetAudience: "all" }), "✅ Announcement posted!"); };
    const addSkill = (e) => { e.preventDefault(); postData("/api/skills", { ...skillForm, proficiency: Number(skillForm.proficiency) }, () => setSkillForm({ studentId: "", name: "", category: "programming", proficiency: "3" }), "✅ Skill added!"); };

    async function generateTeacherQuiz() {
        if (!aiQuizTopic.trim()) return;
        setAiQuizLoading(true);
        setAiQuizError("");
        setAiQuizQuestions([]);
        try {
            const res = await fetch("/api/generate-mcq", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: aiQuizTopic, numberOfQuestions: aiQuizCount, difficulty: aiQuizDifficulty }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to generate quiz");
            setAiQuizQuestions(data.questions || []);
            flash("✅ Quiz generated successfully!");
        } catch (err) {
            setAiQuizError(err.message);
            flash(`❌ ${err.message}`);
        }
        setAiQuizLoading(false);
    }

    if (!user || loading) {
        return (<div className="auth-container"><div className="loader-spinner"></div></div>);
    }

    const sections = [
        { id: "courses", label: "Courses & Marks", icon: "📚" },
        { id: "attendance", label: "Attendance", icon: "📋" },
        { id: "assignments", label: "Assignments", icon: "📝" },
        { id: "special", label: "Special Courses", icon: "⭐" },
        { id: "certs", label: "Certifications", icon: "🏅" },
        { id: "events", label: "Events", icon: "🎯" },
        { id: "projects", label: "Projects", icon: "💼" },
        { id: "skills", label: "Skills", icon: "🧠" },
        { id: "results", label: "Sem Results", icon: "📈" },
        { id: "announce", label: "Announcements", icon: "📢" },
    ];

    /* ─── Helper: select student ─── */
    const StudentSelect = ({ value, onChange, id }) => (
        <select id={id} className="input-field" value={value} onChange={onChange} required>
            <option value="">Select student…</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
        </select>
    );

    const CourseSelect = ({ value, onChange, id }) => (
        <select id={id} className="input-field" value={value} onChange={onChange} required>
            <option value="">Select course…</option>
            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
    );

    return (
        <div className="dashboard-layout">
            {/* ─── Sidebar ─── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🎓</div>
                    <span className="brand-text">LearnTrack</span>
                </div>
                <div className="sidebar-profile">
                    <div className="avatar avatar-teacher">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-role">Teacher</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {sections.map((sec) => (
                        <button key={sec.id} id={`teacher-nav-${sec.id}`}
                            className={`nav-item ${activeSection === sec.id ? "nav-active" : ""}`}
                            onClick={() => setActiveSection(sec.id)}>
                            <span className="nav-icon">{sec.icon}</span>
                            <span className="nav-label">{sec.label}</span>
                        </button>
                    ))}
                </nav>
                <button className="btn btn-ghost sidebar-logout" onClick={logout}>🚪 Logout</button>
            </aside>

            {/* ─── Main Content ─── */}
            <main className="main-content">
                <div className="main-header">
                    <div>
                        <h1 className="page-title">
                            {sections.find(s => s.id === activeSection)?.icon}{" "}
                            {sections.find(s => s.id === activeSection)?.label}
                        </h1>
                        <p className="page-subtitle">Manage student records and academics</p>
                    </div>
                    <div className="header-actions">
                        <ThemeToggle />
                    </div>
                </div>

                {msg && (
                    <div className={`flash-msg ${msg.startsWith("❌") ? "flash-error" : "flash-success"}`}>
                        {msg}
                    </div>
                )}

                {/* Stats */}
                <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                    <div className="hero-stat">
                        <div className="hero-stat-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>📚</div>
                        <div className="hero-stat-value">{courses.length}</div>
                        <div className="hero-stat-label">Courses</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>👨‍🎓</div>
                        <div className="hero-stat-value">{students.length}</div>
                        <div className="hero-stat-label">Students</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>📝</div>
                        <div className="hero-stat-value">{marks.length}</div>
                        <div className="hero-stat-label">Marks</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>📋</div>
                        <div className="hero-stat-value">{assignmentsList.length}</div>
                        <div className="hero-stat-label">Assignments</div>
                    </div>
                </div>

                {/* ═══ COURSES & MARKS ═══ */}
                {activeSection === "courses" && (
                    <div className="animate-in">
                        <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
                            <div className="card glass-card">
                                <h3 className="section-title">➕ Add Course</h3>
                                <form onSubmit={addCourse}>
                                    <div className="form-group"><label className="label">Course Title</label>
                                        <input className="input-field" placeholder="e.g. Web Development" value={newCourse} onChange={e => setNewCourse(e.target.value)} required /></div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>{saving ? "Saving…" : "Add Course"}</button>
                                </form>
                            </div>
                            <div className="card glass-card">
                                <h3 className="section-title">📝 Assign Mark</h3>
                                <form onSubmit={assignMark}>
                                    <div className="form-group"><label className="label">Student</label>
                                        <StudentSelect value={markForm.studentId} onChange={e => setMarkForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                                    <div className="form-group"><label className="label">Course</label>
                                        <CourseSelect value={markForm.courseId} onChange={e => setMarkForm(p => ({ ...p, courseId: e.target.value }))} /></div>
                                    <div className="form-group"><label className="label">Score (0–100)</label>
                                        <input type="number" min="0" max="100" className="input-field" placeholder="85" value={markForm.score} onChange={e => setMarkForm(p => ({ ...p, score: e.target.value }))} required /></div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>{saving ? "Saving…" : "Assign Mark"}</button>
                                </form>
                            </div>
                        </div>
                        {marks.length > 0 && (
                            <div className="card glass-card">
                                <h3 className="section-title">📊 Performance</h3>
                                <div className="table-wrap"><table><thead><tr><th>Student</th><th>Course</th><th>Score</th><th>Grade</th></tr></thead><tbody>
                                    {marks.map(m => {
                                        const s = m.score; let g, c;
                                        if (s >= 90) { g = "A+"; c = "badge-success"; } else if (s >= 80) { g = "A"; c = "badge-success"; } else if (s >= 70) { g = "B"; c = "badge-purple"; } else if (s >= 60) { g = "C"; c = "badge-warning"; } else { g = "F"; c = "badge-danger"; }
                                        return (<tr key={m._id}><td style={{ fontWeight: 600 }}>{m.studentId?.name || "—"}</td><td>{m.courseId?.title || "—"}</td><td>{s}/100</td><td><span className={`badge ${c}`}>{g}</span></td></tr>);
                                    })}
                                </tbody></table></div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ ATTENDANCE ═══ */}
                {activeSection === "attendance" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">📋 Record Attendance</h3>
                        <form onSubmit={addAttendance}>
                            <div className="grid-2">
                                <div className="form-group"><label className="label">Student</label><StudentSelect value={attendForm.studentId} onChange={e => setAttendForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                                <div className="form-group"><label className="label">Course</label><CourseSelect value={attendForm.courseId} onChange={e => setAttendForm(p => ({ ...p, courseId: e.target.value }))} /></div>
                                <div className="form-group"><label className="label">Date</label><input type="date" className="input-field" value={attendForm.date} onChange={e => setAttendForm(p => ({ ...p, date: e.target.value }))} required /></div>
                                <div className="form-group"><label className="label">Status</label><select className="input-field" value={attendForm.status} onChange={e => setAttendForm(p => ({ ...p, status: e.target.value }))}>
                                    <option value="present">Present</option><option value="absent">Absent</option><option value="late">Late</option><option value="excused">Excused</option>
                                </select></div>
                            </div>
                            <div className="form-group"><label className="label">Remarks (optional)</label><input className="input-field" placeholder="Optional remarks" value={attendForm.remarks} onChange={e => setAttendForm(p => ({ ...p, remarks: e.target.value }))} /></div>
                            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>{saving ? "Saving…" : "Record Attendance"}</button>
                        </form>
                    </div></div>
                )}

                {/* ═══ ASSIGNMENTS ═══ */}
                {activeSection === "assignments" && (
                    <div className="animate-in">
                        <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
                            <div className="card glass-card">
                                <h3 className="section-title">📝 Create Assignment</h3>
                                <form onSubmit={addAssignment}>
                                    <div className="form-group"><label className="label">Title</label><input className="input-field" placeholder="e.g. Lab Report #3" value={assignForm.title} onChange={e => setAssignForm(p => ({ ...p, title: e.target.value }))} required /></div>
                                    <div className="form-group"><label className="label">Course</label><CourseSelect value={assignForm.courseId} onChange={e => setAssignForm(p => ({ ...p, courseId: e.target.value }))} /></div>
                                    <div className="grid-2">
                                        <div className="form-group"><label className="label">Due Date</label><input type="date" className="input-field" value={assignForm.dueDate} onChange={e => setAssignForm(p => ({ ...p, dueDate: e.target.value }))} required /></div>
                                        <div className="form-group"><label className="label">Total Marks</label><input type="number" className="input-field" value={assignForm.totalMarks} onChange={e => setAssignForm(p => ({ ...p, totalMarks: e.target.value }))} /></div>
                                    </div>
                                    <div className="form-group"><label className="label">Type</label><select className="input-field" value={assignForm.type} onChange={e => setAssignForm(p => ({ ...p, type: e.target.value }))}>
                                        <option value="homework">Homework</option><option value="lab">Lab</option><option value="quiz">Quiz</option><option value="midterm">Midterm</option><option value="final">Final</option><option value="project">Project</option><option value="presentation">Presentation</option>
                                    </select></div>
                                    <div className="form-group"><label className="label">Description</label><input className="input-field" placeholder="Description" value={assignForm.description} onChange={e => setAssignForm(p => ({ ...p, description: e.target.value }))} /></div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>{saving ? "Saving…" : "Create Assignment"}</button>
                                </form>
                            </div>
                            <div className="card glass-card">
                                <h3 className="section-title">📊 Grade Submission</h3>
                                <form onSubmit={gradeAssignment}>
                                    <div className="form-group"><label className="label">Assignment</label>
                                        <select className="input-field" value={gradeForm.assignmentId} onChange={e => setGradeForm(p => ({ ...p, assignmentId: e.target.value }))} required>
                                            <option value="">Select assignment…</option>
                                            {assignmentsList.map(a => <option key={a._id} value={a._id}>{a.title} ({a.courseId?.title})</option>)}
                                        </select></div>
                                    <div className="form-group"><label className="label">Student</label><StudentSelect value={gradeForm.studentId} onChange={e => setGradeForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                                    <div className="form-group"><label className="label">Score</label><input type="number" className="input-field" placeholder="Score" value={gradeForm.score} onChange={e => setGradeForm(p => ({ ...p, score: e.target.value }))} required /></div>
                                    <div className="form-group"><label className="label">Feedback</label><input className="input-field" placeholder="Great work!" value={gradeForm.feedback} onChange={e => setGradeForm(p => ({ ...p, feedback: e.target.value }))} /></div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>{saving ? "Saving…" : "Grade Submission"}</button>
                                </form>
                            </div>
                        </div>
                        <div className="card glass-card">
                            <h3 className="section-title">🤖 Generate AI Quiz</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1rem" }}>Use AI to generate MCQ questions for any topic. Preview and share with students.</p>
                            <div className="form-group"><label className="label">Topic</label>
                                <input className="input-field" placeholder="e.g. JavaScript Closures, OOP Concepts" value={aiQuizTopic}
                                    onChange={e => setAiQuizTopic(e.target.value)} />
                            </div>
                            <div className="grid-2">
                                <div className="form-group"><label className="label">Questions</label>
                                    <select className="input-field" value={aiQuizCount} onChange={e => setAiQuizCount(Number(e.target.value))}>
                                        <option value={5}>5 Questions</option><option value={10}>10 Questions</option><option value={15}>15 Questions</option>
                                    </select>
                                </div>
                                <div className="form-group"><label className="label">Difficulty</label>
                                    <select className="input-field" value={aiQuizDifficulty} onChange={e => setAiQuizDifficulty(e.target.value)}>
                                        <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <button className="btn btn-primary" onClick={generateTeacherQuiz}
                                disabled={aiQuizLoading || !aiQuizTopic.trim()} style={{ width: "100%" }}>
                                {aiQuizLoading ? "🔄 Generating…" : "✨ Generate Quiz"}
                            </button>
                            {aiQuizError && (
                                <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "var(--danger-bg)", color: "var(--danger)", borderRadius: "0.5rem", fontSize: "0.82rem" }}>
                                    ❌ {aiQuizError}
                                </div>
                            )}
                        </div>

                    {/* AI Quiz Preview */}
                    {aiQuizQuestions.length > 0 && (
                        <div className="card glass-card" style={{ marginTop: "1.5rem" }}>
                            <h3 className="section-title">📋 Generated Quiz Preview — {aiQuizTopic}
                                <span className={`badge ${aiQuizDifficulty === "easy" ? "badge-success" : aiQuizDifficulty === "medium" ? "badge-warning" : "badge-danger"}`}
                                    style={{ marginLeft: "0.75rem", fontSize: "0.7rem" }}>{aiQuizDifficulty}</span>
                            </h3>
                            {aiQuizQuestions.map((q, i) => (
                                <div key={q.id} style={{ marginBottom: "1.25rem", padding: "1rem", borderRadius: "0.75rem", background: "var(--card-nested)", border: "1px solid var(--border)" }}>
                                    <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}><span style={{ color: "var(--accent)" }}>Q{i + 1}.</span> {q.question}</p>
                                    <div style={{ display: "grid", gap: "0.35rem", marginLeft: "1.5rem" }}>
                                        {q.options.map((opt, oi) => (
                                            <div key={oi} style={{
                                                padding: "0.4rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.85rem",
                                                background: oi === q.correctAnswer ? "rgba(34, 197, 94, 0.1)" : "transparent",
                                                border: oi === q.correctAnswer ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid var(--border)",
                                                fontWeight: oi === q.correctAnswer ? 600 : 400,
                                            }}>
                                                {String.fromCharCode(65 + oi)}. {opt} {oi === q.correctAnswer && "✅"}
                                            </div>
                                        ))}
                                    </div>
                                    {q.explanation && (
                                        <p style={{ marginTop: "0.5rem", marginLeft: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                                            💡 {q.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

                {/* ═══ SPECIAL COURSES ═══ */}
                {activeSection === "special" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">⭐ Add Special Course</h3>
                        <form onSubmit={addSpecialCourse}><div className="grid-2">
                            <div className="form-group"><label className="label">Course Title</label><input className="input-field" placeholder="e.g. ML Workshop" value={scForm.title} onChange={e => setScForm(p => ({ ...p, title: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Student</label><StudentSelect value={scForm.studentId} onChange={e => setScForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Category</label><select className="input-field" value={scForm.category} onChange={e => setScForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="workshop">Workshop</option><option value="elective">Elective</option><option value="online">Online</option><option value="summer">Summer</option><option value="bridge">Bridge</option>
                            </select></div>
                            <div className="form-group"><label className="label">Status</label><select className="input-field" value={scForm.status} onChange={e => setScForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="enrolled">Enrolled</option><option value="in-progress">In Progress</option><option value="completed">Completed</option>
                            </select></div>
                            <div className="form-group"><label className="label">Platform</label><input className="input-field" placeholder="e.g. NPTEL" value={scForm.platform} onChange={e => setScForm(p => ({ ...p, platform: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Description</label><input className="input-field" placeholder="Brief description" value={scForm.description} onChange={e => setScForm(p => ({ ...p, description: e.target.value }))} /></div>
                        </div><button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>{saving ? "Saving…" : "Add Special Course"}</button></form>
                    </div></div>
                )}

                {/* ═══ CERTIFICATIONS ═══ */}
                {activeSection === "certs" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">🏅 Add Certification</h3>
                        <form onSubmit={addCert}><div className="grid-2">
                            <div className="form-group"><label className="label">Title</label><input className="input-field" placeholder="e.g. AWS Certified" value={certForm.title} onChange={e => setCertForm(p => ({ ...p, title: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Issued By</label><input className="input-field" placeholder="e.g. Amazon" value={certForm.issuedBy} onChange={e => setCertForm(p => ({ ...p, issuedBy: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Student</label><StudentSelect value={certForm.studentId} onChange={e => setCertForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Category</label><select className="input-field" value={certForm.category} onChange={e => setCertForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="technical">Technical</option><option value="language">Language</option><option value="soft-skills">Soft Skills</option><option value="domain">Domain</option><option value="other">Other</option>
                            </select></div>
                            <div className="form-group"><label className="label">Credential ID</label><input className="input-field" placeholder="ABC-12345" value={certForm.credentialId} onChange={e => setCertForm(p => ({ ...p, credentialId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Status</label><select className="input-field" value={certForm.status} onChange={e => setCertForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="active">Active</option><option value="expired">Expired</option><option value="in-progress">In Progress</option>
                            </select></div>
                        </div><button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>{saving ? "Saving…" : "Add Certification"}</button></form>
                    </div></div>
                )}

                {/* ═══ EVENTS ═══ */}
                {activeSection === "events" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">🎯 Add Event Participation</h3>
                        <form onSubmit={addEvent}><div className="grid-2">
                            <div className="form-group"><label className="label">Event Title</label><input className="input-field" placeholder="Hackathon 2026" value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Student</label><StudentSelect value={eventForm.studentId} onChange={e => setEventForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Date</label><input type="date" className="input-field" value={eventForm.eventDate} onChange={e => setEventForm(p => ({ ...p, eventDate: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Type</label><select className="input-field" value={eventForm.eventType} onChange={e => setEventForm(p => ({ ...p, eventType: e.target.value }))}>
                                <option value="hackathon">Hackathon</option><option value="seminar">Seminar</option><option value="workshop">Workshop</option><option value="sports">Sports</option><option value="cultural">Cultural</option><option value="conference">Conference</option><option value="other">Other</option>
                            </select></div>
                            <div className="form-group"><label className="label">Role</label><select className="input-field" value={eventForm.role} onChange={e => setEventForm(p => ({ ...p, role: e.target.value }))}>
                                <option value="participant">Participant</option><option value="organizer">Organizer</option><option value="volunteer">Volunteer</option><option value="speaker">Speaker</option><option value="winner">Winner</option>
                            </select></div>
                            <div className="form-group"><label className="label">Venue</label><input className="input-field" placeholder="Auditorium" value={eventForm.venue} onChange={e => setEventForm(p => ({ ...p, venue: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Achievement</label><input className="input-field" placeholder="1st Place" value={eventForm.achievement} onChange={e => setEventForm(p => ({ ...p, achievement: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Description</label><input className="input-field" placeholder="Description" value={eventForm.description} onChange={e => setEventForm(p => ({ ...p, description: e.target.value }))} /></div>
                        </div><button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>{saving ? "Saving…" : "Add Event"}</button></form>
                    </div></div>
                )}

                {/* ═══ PROJECTS ═══ */}
                {activeSection === "projects" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">💼 Add Student Project</h3>
                        <form onSubmit={addProject}><div className="grid-2">
                            <div className="form-group"><label className="label">Project Title</label><input className="input-field" placeholder="Smart Attendance System" value={projForm.title} onChange={e => setProjForm(p => ({ ...p, title: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Student</label><StudentSelect value={projForm.studentId} onChange={e => setProjForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Category</label><select className="input-field" value={projForm.category} onChange={e => setProjForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="web">Web</option><option value="mobile">Mobile</option><option value="ml-ai">ML/AI</option><option value="iot">IoT</option><option value="data-science">Data Science</option><option value="cybersecurity">Cybersecurity</option><option value="other">Other</option>
                            </select></div>
                            <div className="form-group"><label className="label">Status</label><select className="input-field" value={projForm.status} onChange={e => setProjForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="planning">Planning</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="presented">Presented</option>
                            </select></div>
                            <div className="form-group"><label className="label">Tech Stack (comma separated)</label><input className="input-field" placeholder="React, Node.js, MongoDB" value={projForm.techStack} onChange={e => setProjForm(p => ({ ...p, techStack: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Mentor</label><input className="input-field" placeholder="Prof. Name" value={projForm.mentor} onChange={e => setProjForm(p => ({ ...p, mentor: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Repo URL</label><input className="input-field" placeholder="https://github.com/..." value={projForm.repoUrl} onChange={e => setProjForm(p => ({ ...p, repoUrl: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Live URL</label><input className="input-field" placeholder="https://..." value={projForm.liveUrl} onChange={e => setProjForm(p => ({ ...p, liveUrl: e.target.value }))} /></div>
                        </div>
                        <div className="form-group"><label className="label">Description</label><input className="input-field" placeholder="Project description" value={projForm.description} onChange={e => setProjForm(p => ({ ...p, description: e.target.value }))} /></div>
                        <div className="form-group"><label className="label">Team Members (comma separated)</label><input className="input-field" placeholder="Alice, Bob" value={projForm.teamMembers} onChange={e => setProjForm(p => ({ ...p, teamMembers: e.target.value }))} /></div>
                        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>{saving ? "Saving…" : "Add Project"}</button></form>
                    </div></div>
                )}

                {/* ═══ SKILLS ═══ */}
                {activeSection === "skills" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">🧠 Add Student Skill</h3>
                        <form onSubmit={addSkill}><div className="grid-2">
                            <div className="form-group"><label className="label">Student</label><StudentSelect value={skillForm.studentId} onChange={e => setSkillForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Skill Name</label><input className="input-field" placeholder="e.g. Python" value={skillForm.name} onChange={e => setSkillForm(p => ({ ...p, name: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">Category</label><select className="input-field" value={skillForm.category} onChange={e => setSkillForm(p => ({ ...p, category: e.target.value }))}>
                                <option value="programming">Programming</option><option value="framework">Framework</option><option value="database">Database</option><option value="devops">DevOps</option><option value="soft-skill">Soft Skill</option><option value="language">Language</option><option value="tools">Tools</option><option value="other">Other</option>
                            </select></div>
                            <div className="form-group"><label className="label">Proficiency (1-5)</label><select className="input-field" value={skillForm.proficiency} onChange={e => setSkillForm(p => ({ ...p, proficiency: e.target.value }))}>
                                <option value="1">1 - Beginner</option><option value="2">2 - Elementary</option><option value="3">3 - Intermediate</option><option value="4">4 - Advanced</option><option value="5">5 - Expert</option>
                            </select></div>
                        </div><button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>{saving ? "Saving…" : "Add Skill"}</button></form>
                    </div></div>
                )}

                {/* ═══ SEMESTER RESULTS ═══ */}
                {activeSection === "results" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">📈 Add Semester Result</h3>
                        <form onSubmit={addSemResult}><div className="grid-2">
                            <div className="form-group"><label className="label">Student</label><StudentSelect value={semForm.studentId} onChange={e => setSemForm(p => ({ ...p, studentId: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Semester (1-8)</label><input type="number" min="1" max="8" className="input-field" value={semForm.semester} onChange={e => setSemForm(p => ({ ...p, semester: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">SGPA</label><input type="number" min="0" max="10" step="0.01" className="input-field" placeholder="8.5" value={semForm.sgpa} onChange={e => setSemForm(p => ({ ...p, sgpa: e.target.value }))} required /></div>
                            <div className="form-group"><label className="label">CGPA</label><input type="number" min="0" max="10" step="0.01" className="input-field" placeholder="8.2" value={semForm.cgpa} onChange={e => setSemForm(p => ({ ...p, cgpa: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Total Credits</label><input type="number" className="input-field" placeholder="24" value={semForm.totalCredits} onChange={e => setSemForm(p => ({ ...p, totalCredits: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Earned Credits</label><input type="number" className="input-field" placeholder="22" value={semForm.earnedCredits} onChange={e => setSemForm(p => ({ ...p, earnedCredits: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Backlogs</label><input type="number" className="input-field" value={semForm.backlogs} onChange={e => setSemForm(p => ({ ...p, backlogs: e.target.value }))} /></div>
                            <div className="form-group"><label className="label">Status</label><select className="input-field" value={semForm.status} onChange={e => setSemForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="pass">Pass</option><option value="fail">Fail</option><option value="withheld">Withheld</option><option value="pending">Pending</option>
                            </select></div>
                            <div className="form-group"><label className="label">Academic Year</label><input className="input-field" placeholder="2025-2026" value={semForm.academicYear} onChange={e => setSemForm(p => ({ ...p, academicYear: e.target.value }))} /></div>
                        </div><button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%", marginTop: "0.5rem" }}>{saving ? "Saving…" : "Add Result"}</button></form>
                    </div></div>
                )}

                {/* ═══ ANNOUNCEMENTS ═══ */}
                {activeSection === "announce" && (
                    <div className="animate-in"><div className="card glass-card">
                        <h3 className="section-title">📢 Post Announcement</h3>
                        <form onSubmit={addAnnouncement}>
                            <div className="grid-2">
                                <div className="form-group"><label className="label">Title</label><input className="input-field" placeholder="Important Notice" value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} required /></div>
                                <div className="form-group"><label className="label">Priority</label><select className="input-field" value={annForm.priority} onChange={e => setAnnForm(p => ({ ...p, priority: e.target.value }))}>
                                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                                </select></div>
                                <div className="form-group"><label className="label">Course (optional)</label>
                                    <select className="input-field" value={annForm.courseId} onChange={e => setAnnForm(p => ({ ...p, courseId: e.target.value }))}>
                                        <option value="">All Students</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                    </select></div>
                                <div className="form-group"><label className="label">Target</label><select className="input-field" value={annForm.targetAudience} onChange={e => setAnnForm(p => ({ ...p, targetAudience: e.target.value }))}>
                                    <option value="all">All Students</option><option value="course-specific">Course Specific</option>
                                </select></div>
                            </div>
                            <div className="form-group"><label className="label">Content</label><textarea className="input-field" rows="4" placeholder="Write your announcement..." value={annForm.content} onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))} required style={{ resize: "vertical", minHeight: "100px" }} /></div>
                            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>{saving ? "Posting…" : "Post Announcement"}</button>
                        </form>
                    </div></div>
                )}
            </main>
        </div>
    );
}
