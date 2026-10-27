
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getSubjects,
  createSubject,
  deleteSubject as deleteSubjectAPI,
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskAPI,
  getSessions,
  createSession,
  deleteSession as deleteSessionAPI,
} from "../api";
import "./Dashboard.css";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Dashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("eduPlannerUser") || "null");
    } catch {
      return null;
    }
  }, []);

  const token = localStorage.getItem("eduPlannerToken");

  const [activeTab, setActiveTab] = useState("Overview");
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskSubject, setTaskSubject] = useState("");
  const [taskDate, setTaskDate] = useState(today());
  const [taskPriority, setTaskPriority] = useState("Medium");

  const [subjectName, setSubjectName] = useState("");

  const [sessionSubject, setSessionSubject] = useState("");
  const [sessionDay, setSessionDay] = useState("Monday");
  const [sessionTime, setSessionTime] = useState("16:00");

  // Load the user's data from MongoDB
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const [subjectData, taskData, sessionData] = await Promise.all([
          getSubjects(),
          getTasks(),
          getSessions(),
        ]);

        if (cancelled) return;

        const formattedSubjects = subjectData.map((subject) => ({
          id: subject._id,
          name: subject.name,
          color: subject.color,
        }));

        const formattedTasks = taskData.map((task) => ({
          id: task._id,
          title: task.title,
          subject: task.subject?.name || "Unknown subject",
          subjectId: task.subject?._id,
          dueDate: task.dueDate,
          priority: task.priority,
          completed: task.completed,
        }));

        const formattedSessions = sessionData.map((session) => ({
          id: session._id,
          subject: session.subject?.name || "Unknown subject",
          subjectId: session.subject?._id,
          day: session.day,
          time: session.time,
        }));

        setSubjects(formattedSubjects);
        setTasks(formattedTasks);
        setSessions(formattedSessions);
      } catch (error) {
        if (!cancelled) {
          alert(
            `${error.message || "Could not load dashboard data."} Please check your login and backend.`
          );

          if (
            error.message?.toLowerCase().includes("token") ||
            error.message?.toLowerCase().includes("log in") ||
            error.message?.toLowerCase().includes("authentication")
          ) {
            localStorage.removeItem("eduPlannerToken");
            localStorage.removeItem("eduPlannerUser");
            navigate("/login", { replace: true });
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (user && token) {
      loadDashboard();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [user, token, navigate]);

  if (!user || !token) {
    return (
      <div className="dashboard-loading">
        Please log in to continue.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading your study planner...
      </div>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.filter((task) => !task.completed).length;

  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const upcomingTasks = [...tasks]
    .filter((task) => !task.completed)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  async function addTask(event) {
    event.preventDefault();

    if (!taskTitle.trim() || !taskDate || !taskSubject) return;

    try {
      const saved = await createTask({
        title: taskTitle.trim(),
        subjectId: taskSubject,
        dueDate: taskDate,
        priority: taskPriority,
      });

      setTasks((current) => [
        ...current,
        {
          id: saved._id,
          title: saved.title,
          subject: saved.subject?.name || "Unknown subject",
          subjectId: saved.subject?._id,
          dueDate: saved.dueDate,
          priority: saved.priority,
          completed: saved.completed,
        },
      ]);

      setTaskTitle("");
      setTaskSubject("");
      setTaskDate(today());
      setTaskPriority("Medium");
    } catch (error) {
      alert(error.message || "Failed to create task.");
    }
  }

  async function addSubject(event) {
    event.preventDefault();

    const name = subjectName.trim();
    if (!name) return;

    const colors = [
      "#8065E8",
      "#3D9BE9",
      "#E9A23B",
      "#35A889",
      "#E46F9B",
    ];

    try {
      const saved = await createSubject({
        name,
        color: colors[subjects.length % colors.length],
      });

      setSubjects((current) => [
        ...current,
        {
          id: saved._id,
          name: saved.name,
          color: saved.color,
        },
      ]);

      setSubjectName("");
    } catch (error) {
      alert(error.message || "Failed to create subject.");
    }
  }

  async function addSession(event) {
    event.preventDefault();

    if (!sessionSubject || !sessionDay || !sessionTime) return;

    try {
      const saved = await createSession({
        subjectId: sessionSubject,
        day: sessionDay,
        time: sessionTime,
      });

      setSessions((current) => [
        ...current,
        {
          id: saved._id,
          subject: saved.subject?.name || "Unknown subject",
          subjectId: saved.subject?._id,
          day: saved.day,
          time: saved.time,
        },
      ]);
    } catch (error) {
      alert(error.message || "Failed to create study session.");
    }
  }

  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    try {
      const saved = await updateTask(id, {
        completed: !task.completed,
      });

      setTasks((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, completed: saved.completed }
            : item
        )
      );
    } catch (error) {
      alert(error.message || "Failed to update task.");
    }
  }

  async function deleteTask(id) {
    try {
      await deleteTaskAPI(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (error) {
      alert(error.message || "Failed to delete task.");
    }
  }

  async function deleteSubject(id) {
    const subject = subjects.find((item) => item.id === id);
    if (!subject) return;

    const isUsed =
      tasks.some((task) => task.subjectId === id) ||
      sessions.some((session) => session.subjectId === id);

    if (isUsed) {
      alert(
        "This subject is used by a task or schedule. Remove those first."
      );
      return;
    }

    try {
      await deleteSubjectAPI(id);
      setSubjects((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (error) {
      alert(error.message || "Failed to delete subject.");
    }
  }

  async function deleteSession(id) {
    try {
      await deleteSessionAPI(id);
      setSessions((current) =>
        current.filter((session) => session.id !== id)
      );
    } catch (error) {
      alert(error.message || "Failed to delete study session.");
    }
  }

  function logout() {
    localStorage.removeItem("eduPlannerToken");
    localStorage.removeItem("eduPlannerUser");
    navigate("/login", { replace: true });
  }

  const heading = {
    Overview: "Your study space",
    Tasks: "Manage your tasks",
    Subjects: "Your subjects",
    Schedule: "Your weekly schedule",
  }[activeTab];

  return (
    <div className="ep-layout">
      <aside className="ep-sidebar">
        <div className="ep-brand">
          <div className="ep-brand-icon">E</div>
          <span>EduPlanner</span>
        </div>

        <p className="ep-nav-label">WORKSPACE</p>

        <nav className="ep-nav">
          {[
            { name: "Overview", icon: "⌂" },
            { name: "Tasks", icon: "✓" },
            { name: "Subjects", icon: "▤" },
            { name: "Schedule", icon: "▦" },
          ].map((item) => (
            <button
              key={item.name}
              className={`ep-nav-item ${
                activeTab === item.name ? "active" : ""
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <span className="ep-nav-icon">{item.icon}</span>
              {item.name}
              {item.name === "Tasks" && pendingTasks > 0 && (
                <span className="ep-nav-count">{pendingTasks}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ep-sidebar-bottom">
          <div className="ep-sidebar-note">
            <span>✦</span>
            <strong>Small steps, big goals.</strong>
            <p>Keep showing up for your future self.</p>
          </div>

          <button className="ep-logout" onClick={logout}>
            ↪ Log out
          </button>
        </div>
      </aside>

      <main className="ep-main">
        <header className="ep-topbar">
          <div>
            <p className="ep-breadcrumb">
              WORKSPACE / {activeTab.toUpperCase()}
            </p>
            <h1>{heading}</h1>
          </div>

          <div className="ep-profile">
            <div className="ep-avatar">
              {(user.name || "S").charAt(0).toUpperCase()}
            </div>
            <div className="ep-profile-text">
              <strong>{user.name || "Student"}</strong>
              <span>Student account</span>
            </div>
          </div>
        </header>

        {activeTab === "Overview" && (
          <>
            <section className="ep-welcome">
              <div>
                <p className="ep-welcome-tag">
                  YOUR PERSONAL STUDY PLANNER
                </p>
                <h2>Hey, {user.name?.split(" ")[0] || "Student"}! 👋</h2>
                <p>Make today count. One task at a time.</p>
                <button
                  className="ep-primary-button"
                  onClick={() => setActiveTab("Tasks")}
                >
                  + Add a study task
                </button>
              </div>

              <div className="ep-welcome-art" aria-hidden="true">
                <div className="ep-art-circle">✦</div>
                <div className="ep-art-card">
                  📚<br />
                  Focus<br />
                  &amp; grow
                </div>
              </div>
            </section>

            <section className="ep-stat-grid">
              <StatCard
                label="Total tasks"
                value={tasks.length}
                icon="▤"
                tone="purple"
                detail="All your assignments"
              />
              <StatCard
                label="Pending"
                value={pendingTasks}
                icon="◷"
                tone="blue"
                detail="Still to be completed"
              />
              <StatCard
                label="Completed"
                value={completedTasks}
                icon="✓"
                tone="green"
                detail="Tasks you've finished"
              />
              <StatCard
                label="Subjects"
                value={subjects.length}
                icon="▣"
                tone="orange"
                detail="Your learning areas"
              />
            </section>

            <div className="ep-content-grid">
              <section className="ep-panel">
                <div className="ep-panel-heading">
                  <div>
                    <h3>Upcoming tasks</h3>
                    <p>What needs your attention</p>
                  </div>
                  <button
                    className="ep-text-button"
                    onClick={() => setActiveTab("Tasks")}
                  >
                    View all →
                  </button>
                </div>

                {upcomingTasks.length === 0 ? (
                  <EmptyState text="You're all caught up! Add a task to get started." />
                ) : (
                  upcomingTasks.slice(0, 5).map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))
                )}
              </section>

              <section className="ep-panel">
                <div className="ep-panel-heading">
                  <div>
                    <h3>Your progress</h3>
                    <p>Every completed task counts</p>
                  </div>
                  <span className="ep-progress-icon">✦</span>
                </div>

                <div className="ep-progress-number">{progress}%</div>
                <div className="ep-progress-track">
                  <div
                    className="ep-progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="ep-muted">
                  {completedTasks} of {tasks.length} tasks completed
                </p>
                <div className="ep-mini-divider" />
                <h4>My subjects</h4>

                {subjects.length === 0 ? (
                  <EmptyState text="Add your first subject." />
                ) : (
                  subjects.slice(0, 4).map((subject) => (
                    <div className="ep-subject-mini" key={subject.id}>
                      <span
                        className="ep-subject-dot"
                        style={{ background: subject.color }}
                      />
                      <span>{subject.name}</span>
                    </div>
                  ))
                )}

                <button
                  className="ep-secondary-button ep-full-button"
                  onClick={() => setActiveTab("Subjects")}
                >
                  Manage subjects
                </button>
              </section>
            </div>
          </>
        )}

        {activeTab === "Tasks" && (
          <div className="ep-page-grid">
            <section className="ep-panel">
              <div className="ep-panel-heading">
                <div>
                  <h3>Add a new task</h3>
                  <p>Keep track of assignments and deadlines.</p>
                </div>
              </div>

              <form className="ep-form" onSubmit={addTask}>
                <label>Task title</label>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Complete DAA assignment"
                  required
                />

                <label>Subject</label>
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  required
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>

                <label>Due date</label>
                <input
                  type="date"
                  value={taskDate}
                  min={today()}
                  onChange={(e) => setTaskDate(e.target.value)}
                  required
                />

                <label>Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <button
                  className="ep-primary-button"
                  type="submit"
                  disabled={subjects.length === 0}
                >
                  + Create task
                </button>

                {subjects.length === 0 && (
                  <p className="ep-form-hint">
                    Add a subject first in the Subjects tab.
                  </p>
                )}
              </form>
            </section>

            <section className="ep-panel">
              <div className="ep-panel-heading">
                <div>
                  <h3>All tasks</h3>
                  <p>
                    {pendingTasks} pending · {completedTasks} completed
                  </p>
                </div>
              </div>

              {tasks.length === 0 ? (
                <EmptyState text="No tasks yet. Add your first task using the form." />
              ) : (
                [...tasks]
                  .sort(
                    (a, b) =>
                      Number(a.completed) - Number(b.completed) ||
                      a.dueDate.localeCompare(b.dueDate)
                  )
                  .map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onDelete={deleteTask}
                    />
                  ))
              )}
            </section>
          </div>
        )}

        {activeTab === "Subjects" && (
          <section className="ep-panel">
            <div className="ep-panel-heading">
              <div>
                <h3>Manage subjects</h3>
                <p>Add the subjects you are studying this semester.</p>
              </div>
            </div>

            <form className="ep-inline-form" onSubmit={addSubject}>
              <input
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject name"
                required
              />
              <button className="ep-primary-button" type="submit">
                + Add subject
              </button>
            </form>

            {subjects.length === 0 ? (
              <EmptyState text="No subjects yet. Add one above." />
            ) : (
              <div className="ep-subject-grid">
                {subjects.map((subject) => (
                  <article className="ep-subject-card" key={subject.id}>
                    <div
                      className="ep-subject-card-icon"
                      style={{
                        background: `${subject.color}18`,
                        color: subject.color,
                      }}
                    >
                      ▤
                    </div>
                    <h3>{subject.name}</h3>
                    <p>
                      {
                        tasks.filter(
                          (task) => task.subjectId === subject.id
                        ).length
                      }{" "}
                      task(s)
                    </p>
                    <button
                      className="ep-delete-button"
                      onClick={() => deleteSubject(subject.id)}
                    >
                      Remove subject
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "Schedule" && (
          <div className="ep-page-grid">
            <section className="ep-panel">
              <div className="ep-panel-heading">
                <div>
                  <h3>Add study session</h3>
                  <p>Plan when you will study.</p>
                </div>
              </div>

              <form className="ep-form" onSubmit={addSession}>
                <label>Subject</label>
                <select
                  value={sessionSubject}
                  onChange={(e) => setSessionSubject(e.target.value)}
                  required
                >
                  <option value="">Choose a subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>

                <label>Day</label>
                <select
                  value={sessionDay}
                  onChange={(e) => setSessionDay(e.target.value)}
                >
                  {weekdays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                <label>Start time</label>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  required
                />

                <button
                  className="ep-primary-button"
                  type="submit"
                  disabled={subjects.length === 0}
                >
                  + Add session
                </button>

                {subjects.length === 0 && (
                  <p className="ep-form-hint">
                    Add a subject first in the Subjects tab.
                  </p>
                )}
              </form>
            </section>

            <section className="ep-panel">
              <div className="ep-panel-heading">
                <div>
                  <h3>Weekly study plan</h3>
                  <p>Your planned study sessions</p>
                </div>
              </div>

              {sessions.length === 0 ? (
                <EmptyState text="Your schedule is empty. Add a study session." />
              ) : (
                weekdays.map((day) => {
                  const daySessions = sessions
                    .filter((session) => session.day === day)
                    .sort((a, b) => a.time.localeCompare(b.time));

                  if (daySessions.length === 0) return null;

                  return (
                    <div className="ep-day-group" key={day}>
                      <h4>{day}</h4>
                      {daySessions.map((session) => (
                        <div className="ep-session-row" key={session.id}>
                          <span className="ep-session-time">
                            {session.time}
                          </span>
                          <span className="ep-session-dot" />
                          <span className="ep-session-name">
                            {session.subject}
                          </span>
                          <button
                            className="ep-icon-button"
                            onClick={() => deleteSession(session.id)}
                            aria-label={`Remove ${session.subject} session`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </section>
          </div>
        )}

        <footer className="ep-footer">
          Made for your goals <span>✦</span> EduPlanner
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, tone, detail }) {
  return (
    <article className="ep-stat-card">
      <div className={`ep-stat-icon ${tone}`}>{icon}</div>
      <p className="ep-stat-label">{label}</p>
      <div className="ep-stat-value">{value}</div>
      <p className="ep-stat-detail">{detail}</p>
    </article>
  );
}

function EmptyState({ text }) {
  return (
    <div className="ep-empty">
      <span>✦</span>
      <p>{text}</p>
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const isOverdue = !task.completed && task.dueDate < today();

  return (
    <div className={`ep-task-row ${task.completed ? "is-complete" : ""}`}>
      <button
        className={`ep-task-check ${task.completed ? "checked" : ""}`}
        onClick={() => onToggle(task.id)}
        aria-label={
          task.completed ? "Mark task incomplete" : "Mark task complete"
        }
      >
        {task.completed ? "✓" : ""}
      </button>

      <div className="ep-task-info">
        <strong>{task.title}</strong>
        <span>
          {task.subject} · Due {task.dueDate}
        </span>
      </div>

      <div className="ep-task-actions">
        <span className={`ep-priority ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>

        {isOverdue && <span className="ep-overdue">Overdue</span>}

        <button
          className="ep-icon-button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          ×
        </button>
      </div>
    </div>
  );
}
