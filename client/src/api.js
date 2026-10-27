
const API_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("eduPlannerToken");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

export function signupUser(formData) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

export function loginUser(formData) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(formData),
  });
}

// Subjects
export function getSubjects() {
  return request("/subjects");
}

export function createSubject(subjectData) {
  return request("/subjects", {
    method: "POST",
    body: JSON.stringify(subjectData),
  });
}

export function deleteSubject(subjectId) {
  return request(`/subjects/${subjectId}`, {
    method: "DELETE",
  });
}

// Tasks
export function getTasks() {
  return request("/tasks");
}

export function createTask(taskData) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export function updateTask(taskId, updates) {
  return request(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// Study sessions
export function getSessions() {
  return request("/sessions");
}

export function createSession(sessionData) {
  return request("/sessions", {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
}

export function deleteSession(sessionId) {
  return request(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
}
