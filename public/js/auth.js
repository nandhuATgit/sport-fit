const API = "http://localhost:3000";
async function register() {
  const userData = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    weight: document.getElementById("weight").value,
    goal: document.getElementById("goal").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (res.ok) {
    alert("Registration successful!");
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html"; // ✅ redirect
  } else {
    alert(data.message);
  }
}
async function login() {
  const loginData = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html"; // ✅ redirect
  } else {
    alert(data.message);
  }
}
