"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "../../(frontend)/components/ThemeToggle";

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [msg, setMsg] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [saving, setSaving] = useState(false);

    // Specific user stats modal
    const [selectedUserStats, setSelectedUserStats] = useState(null);

    // New user form
    const [showNewUser, setShowNewUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "student" });

    const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3500); };

    const loadStats = useCallback(async () => {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
    }, []);

    const loadUsers = useCallback(async () => {
        const params = new URLSearchParams();
        if (roleFilter !== "all") params.set("role", roleFilter);
        if (search) params.set("search", search);
        const res = await fetch(`/api/admin/users?${params}`);
        if (res.ok) setUsers(await res.json());
    }, [roleFilter, search]);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { router.push("/"); return; }
        const u = JSON.parse(stored);
        if (u.role !== "admin") { router.push("/"); return; }
        setUser(u);
        Promise.all([loadStats(), loadUsers()]).finally(() => setLoading(false));
    }, [router, loadStats, loadUsers]);

    useEffect(() => {
        if (user) loadUsers();
    }, [roleFilter, search, user, loadUsers]);

    function logout() { localStorage.removeItem("user"); router.push("/"); }

    async function changeRole(userId, role) {
        setSaving(true);
        const res = await fetch("/api/admin/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, role }),
        });
        if (res.ok) { flash("✅ Role updated!"); loadUsers(); }
        else flash("❌ Failed to update role");
        setSaving(false);
    }

    async function deleteUser(userId, name) {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
        if (res.ok) { flash("✅ User deleted"); loadUsers(); loadStats(); }
        else flash("❌ Failed to delete user");
    }
    async function viewUserStats(userId) {
        setSelectedUserStats({ loading: true });
        const res = await fetch(`/api/admin/users/${userId}/stats`);
        if (res.ok) setSelectedUserStats(await res.json());
        else setSelectedUserStats({ error: "Could not load stats" });
    }

    async function createUser(e) {
        e.preventDefault();
        setSaving(true);
        const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
        });
        if (res.ok) {
            flash("✅ User created!");
            setNewUser({ name: "", email: "", password: "", role: "student" });
            setShowNewUser(false);
            loadUsers(); loadStats();
        } else {
            const d = await res.json();
            flash(`❌ ${d.error}`);
        }
        setSaving(false);
    }

    if (!user || loading) {
        return <div className="auth-container"><div className="loader-spinner"></div></div>;
    }

    const tabs = [
        { id: "overview", label: "Overview", icon: "📊" },
        { id: "users", label: "User Management", icon: "👥" },
        { id: "system", label: "System", icon: "⚙️" },
    ];

    const roleColor = { student: "badge-purple", teacher: "badge-success", admin: "badge-danger" };
    const roleIcon = { student: "🎓", teacher: "🧑‍🏫", admin: "🛡️" };

    return (
        <div className="dashboard-layout">
            {/* ─── Sidebar ─── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🛡️</div>
                    <span className="brand-text">AdminPanel</span>
                </div>
                <div className="sidebar-profile">
                    <div className="avatar" style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}>
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-role" style={{ color: "#ef4444" }}>Administrator</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {tabs.map((tab) => (
                        <button key={tab.id} id={`admin-nav-${tab.id}`}
                            className={`nav-item ${activeTab === tab.id ? "nav-active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <span className="nav-icon">{tab.icon}</span>
                            <span className="nav-label">{tab.label}</span>
                        </button>
                    ))}
                </nav>
                <div style={{ padding: "1rem", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.5rem", textAlign: "center" }}>
                        Full system access
                    </div>
                </div>
                <button className="btn btn-ghost sidebar-logout" onClick={logout}>🚪 Logout</button>
            </aside>

            {/* ─── Main ─── */}
            <main className="main-content">
                <div className="main-header">
                    <div>
                        <h1 className="page-title">
                            {tabs.find(t => t.id === activeTab)?.icon}{" "}
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h1>
                        <p className="page-subtitle">LearnTrack Admin — Full system control</p>
                    </div>
                    <div className="header-actions">
                        <ThemeToggle />
                        <span className="badge badge-danger" style={{ padding: "0.4rem 0.75rem" }}>🛡️ Admin</span>
                    </div>
                </div>

                {msg && (
                    <div className={`flash-msg ${msg.startsWith("❌") ? "flash-error" : "flash-success"}`}>
                        {msg}
                    </div>
                )}

                {/* ═══ OVERVIEW ═══ */}
                {activeTab === "overview" && stats && (
                    <div className="animate-in">
                        {/* User Stats */}
                        <div style={{ marginBottom: "0.5rem" }}>
                            <h3 className="section-title">👥 Users</h3>
                        </div>
                        <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>👤</div>
                                <div className="hero-stat-value">{stats.users.total}</div>
                                <div className="hero-stat-label">Total Users</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>🎓</div>
                                <div className="hero-stat-value">{stats.users.students}</div>
                                <div className="hero-stat-label">Students</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>🧑‍🏫</div>
                                <div className="hero-stat-value">{stats.users.teachers}</div>
                                <div className="hero-stat-label">Teachers</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>🛡️</div>
                                <div className="hero-stat-value">{stats.users.admins}</div>
                                <div className="hero-stat-label">Admins</div>
                            </div>
                        </div>

                        {/* Academic Stats */}
                        <div style={{ marginBottom: "0.5rem" }}>
                            <h3 className="section-title">📚 Academics</h3>
                        </div>
                        <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>📚</div>
                                <div className="hero-stat-value">{stats.academics.totalCourses}</div>
                                <div className="hero-stat-label">Courses</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>📝</div>
                                <div className="hero-stat-value">{stats.academics.totalMarks}</div>
                                <div className="hero-stat-label">Grades</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>📊</div>
                                <div className="hero-stat-value">{stats.academics.avgScore}%</div>
                                <div className="hero-stat-label">Avg Score</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--teal-bg)", color: "var(--teal)" }}>📈</div>
                                <div className="hero-stat-value">{stats.academics.totalSemResults}</div>
                                <div className="hero-stat-label">Sem Results</div>
                            </div>
                        </div>

                        {/* Activity Stats */}
                        <div style={{ marginBottom: "0.5rem" }}>
                            <h3 className="section-title">⚡ Activity</h3>
                        </div>
                        <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--purple-bg)", color: "var(--purple)" }}>📋</div>
                                <div className="hero-stat-value">{stats.activity.totalAttendance}</div>
                                <div className="hero-stat-label">Attendance Records</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: stats.activity.attendanceRate >= 75 ? "var(--success-bg)" : "var(--danger-bg)", color: stats.activity.attendanceRate >= 75 ? "var(--success)" : "var(--danger)" }}>✅</div>
                                <div className="hero-stat-value">{stats.activity.attendanceRate}%</div>
                                <div className="hero-stat-label">Attendance Rate</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--warning-bg)", color: "var(--warning)" }}>📋</div>
                                <div className="hero-stat-value">{stats.activity.totalAssignments}</div>
                                <div className="hero-stat-label">Assignments</div>
                            </div>
                            <div className="hero-stat">
                                <div className="hero-stat-icon" style={{ background: "var(--pink-bg)", color: "var(--pink)" }}>💼</div>
                                <div className="hero-stat-value">{stats.activity.totalProjects}</div>
                                <div className="hero-stat-label">Projects</div>
                            </div>
                        </div>

                        {/* Content Stats */}
                        <div className="grid-2">
                            <div className="card glass-card">
                                <h3 className="section-title">🏅 Content</h3>
                                <div className="quick-stats-list">
                                    <div className="quick-stat-row">
                                        <span>🏅 Certifications</span>
                                        <span className="badge badge-warning">{stats.content.totalCertifications}</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>📢 Announcements</span>
                                        <span className="badge badge-purple">{stats.content.totalAnnouncements}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card glass-card">
                                <h3 className="section-title">📈 User Distribution</h3>
                                {stats.users.total > 0 && (
                                    <div>
                                        {[
                                            { label: "Students", count: stats.users.students, color: "var(--accent)" },
                                            { label: "Teachers", count: stats.users.teachers, color: "var(--success)" },
                                            { label: "Admins", count: stats.users.admins, color: "var(--danger)" },
                                        ].map(item => (
                                            <div key={item.label} style={{ marginBottom: "0.75rem" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                                    <span style={{ fontSize: "0.85rem" }}>{item.label}</span>
                                                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                                                        {Math.round((item.count / stats.users.total) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{
                                                        width: `${(item.count / stats.users.total) * 100}%`,
                                                        background: item.color,
                                                    }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ USER MANAGEMENT ═══ */}
                {activeTab === "users" && (
                    <div className="animate-in">
                        {/* Controls */}
                        <div className="card glass-card" style={{ marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                                <input
                                    className="input-field"
                                    style={{ flex: 1, minWidth: "200px" }}
                                    placeholder="🔍 Search by name or email…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                                <select className="input-field" style={{ width: "160px" }}
                                    value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                                    <option value="all">All Roles</option>
                                    <option value="student">Students</option>
                                    <option value="teacher">Teachers</option>
                                    <option value="admin">Admins</option>
                                </select>
                                <button className="btn btn-primary" onClick={() => setShowNewUser(!showNewUser)}
                                    style={{ whiteSpace: "nowrap" }}>
                                    {showNewUser ? "✕ Cancel" : "＋ New User"}
                                </button>
                            </div>

                            {showNewUser && (
                                <form onSubmit={createUser} className="animate-in" style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                                    <h4 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700 }}>Create New User</h4>
                                    <div className="grid-2">
                                        <div className="form-group">
                                            <label className="label">Full Name</label>
                                            <input className="input-field" placeholder="Dinesh Kumar"
                                                value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Email</label>
                                            <input type="email" className="input-field" placeholder="user@example.com"
                                                value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Password</label>
                                            <input type="password" className="input-field" placeholder="••••••••"
                                                value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="label">Role</label>
                                            <select className="input-field" value={newUser.role}
                                                onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                                                <option value="student">🎓 Student</option>
                                                <option value="teacher">🧑‍🏫 Teacher</option>
                                                <option value="admin">🛡️ Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "100%" }}>
                                        {saving ? "Creating…" : "Create User →"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Users Table */}
                        <div className="card glass-card">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 className="section-title" style={{ marginBottom: 0 }}>
                                    👥 Users <span className="badge badge-purple" style={{ marginLeft: "0.5rem" }}>{users.length}</span>
                                </h3>
                            </div>
                            {users.length === 0 ? (
                                <div className="empty-state"><span className="empty-icon">👤</span><p>No users found.</p></div>
                            ) : (
                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Change Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u._id}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: "50%",
                                                                background: "linear-gradient(135deg, var(--gradient-start), var(--gradient-end))",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontWeight: 700, fontSize: "0.85rem",
                                                            }}>
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                                            {u._id === user._id && (
                                                                <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>You</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{u.email}</td>
                                                    <td>
                                                        <span className={`badge ${roleColor[u.role] || "badge-purple"}`}>
                                                            {roleIcon[u.role]} {u.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <select
                                                            className="input-field"
                                                            style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", width: "130px" }}
                                                            value={u.role}
                                                            disabled={u._id === user._id || saving}
                                                            onChange={e => changeRole(u._id, e.target.value)}
                                                        >
                                                            <option value="student">🎓 Student</option>
                                                            <option value="teacher">🧑‍🏫 Teacher</option>
                                                            <option value="admin">🛡️ Admin</option>
                                                        </select>
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => viewUserStats(u._id)}
                                                            style={{
                                                                background: "var(--purple-bg)", color: "var(--purple)",
                                                                border: "1px solid rgba(139,92,246,0.3)", borderRadius: "0.4rem",
                                                                padding: "0.3rem 0.6rem", fontSize: "0.75rem", cursor: "pointer",
                                                                marginRight: "0.5rem"
                                                            }}
                                                        >
                                                            📊 Analytics
                                                        </button>
                                                        {u._id !== user._id && (
                                                            <button
                                                                onClick={() => deleteUser(u._id, u.name)}
                                                                style={{
                                                                    background: "var(--danger-bg)", color: "var(--danger)",
                                                                    border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.4rem",
                                                                    padding: "0.3rem 0.6rem", fontSize: "0.75rem", cursor: "pointer",
                                                                }}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Stats Modal */}
                        {selectedUserStats && (
                            <div className="modal-backdrop" style={{
                                position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                                background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
                                display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
                            }}>
                                <div className="card glass-card animate-in" style={{ width: "90%", maxWidth: "400px", position: "relative", zIndex: 1000 }}>
                                    <button onClick={() => setSelectedUserStats(null)} style={{
                                        position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem"
                                    }}>✕</button>

                                    {selectedUserStats.loading ? (
                                        <div style={{ padding: "2rem", textAlign: "center" }}>Loading analytics...</div>
                                    ) : selectedUserStats.error ? (
                                        <div style={{ color: "var(--danger)", padding: "2rem", textAlign: "center" }}>{selectedUserStats.error}</div>
                                    ) : (
                                        <>
                                            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.2rem", fontWeight: 700 }}>
                                                {selectedUserStats.role === "student" ? "🎓" : "🧑‍🏫"} {selectedUserStats.name}
                                            </h3>
                                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem", textTransform: "capitalize" }}>{selectedUserStats.role} Analytics</p>
                                            
                                            <div className="quick-stats-list">
                                                {Object.entries(selectedUserStats.metrics).map(([key, value]) => (
                                                    <div className="quick-stat-row" key={key}>
                                                        <span style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                        <span className="badge badge-purple" style={{ fontSize: "0.85rem" }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ SYSTEM ═══ */}
                {activeTab === "system" && (
                    <div className="animate-in">
                        <div className="grid-2">
                            <div className="card glass-card">
                                <h3 className="section-title">🔗 API Endpoints</h3>
                                <div style={{ fontSize: "0.82rem", lineHeight: 2 }}>
                                    {[
                                        ["GET", "/api/admin/stats", "System statistics"],
                                        ["GET/POST/PUT/DELETE", "/api/admin/users", "User management"],
                                        ["GET/POST", "/api/courses", "Courses"],
                                        ["GET/POST", "/api/marks", "Grades"],
                                        ["GET/POST", "/api/attendance", "Attendance"],
                                        ["GET/POST", "/api/assignments", "Assignments"],
                                        ["GET/POST", "/api/projects", "Projects"],
                                        ["GET/POST", "/api/certifications", "Certifications"],
                                        ["GET/POST", "/api/announcements", "Announcements"],
                                        ["GET/POST", "/api/events", "Events"],
                                        ["GET/POST", "/api/skills", "Skills"],
                                        ["GET/POST/PUT", "/api/goals", "Goals"],
                                        ["GET/POST", "/api/semester-results", "Semester Results"],
                                        ["GET", "/api/leaderboard", "Leaderboard"],
                                        ["POST", "/api/generate-mcq", "AI Quiz Generator"],
                                    ].map(([method, path, desc]) => (
                                        <div key={path} style={{ display: "flex", gap: "0.5rem", alignItems: "baseline", padding: "0.2rem 0", borderBottom: "1px solid var(--border)" }}>
                                            <span style={{ background: "var(--accent-glow)", color: "var(--accent)", borderRadius: "0.3rem", padding: "0 0.4rem", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                                                {method.split("/")[0]}
                                            </span>
                                            <code style={{ fontSize: "0.75rem", color: "var(--text-muted)", flex: 1 }}>{path}</code>
                                            <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="card glass-card">
                                <h3 className="section-title">⚙️ System Info</h3>
                                <div className="quick-stats-list">
                                    <div className="quick-stat-row">
                                        <span>Framework</span>
                                        <span className="badge badge-success">Next.js 16</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>Database</span>
                                        <span className="badge badge-success">MongoDB</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>ORM</span>
                                        <span className="badge badge-purple">Mongoose</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>Auth</span>
                                        <span className="badge badge-warning">bcryptjs</span>
                                    </div>
                                    <div className="quick-stat-row">
                                        <span>Admin Role</span>
                                        <span className="badge badge-danger">🛡️ Active</span>
                                    </div>
                                </div>
                                <div style={{ marginTop: "1.5rem" }}>
                                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.75rem" }}>Project Structure</h4>
                                    <pre style={{
                                        background: "var(--card-nested)", borderRadius: "0.75rem",
                                        padding: "1rem", fontSize: "0.72rem", color: "var(--text-muted)",
                                        lineHeight: 1.8, overflow: "auto",
                                    }}>
{`app/
  (frontend)/          ← UI pages
    page.js            ← Login
    student/           ← Student dashboard
    teacher/           ← Teacher dashboard
    admin/             ← Admin dashboard
    components/        ← Shared UI
  api/                 ← Backend routes
    admin/
      stats/           ← System stats
      users/           ← User CRUD
    login/  register/
    courses/ marks/
    attendance/ ...
lib/db.js              ← DB connection
models/                ← Mongoose schemas`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
