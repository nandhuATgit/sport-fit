const API = "http://localhost:3000";
const token = localStorage.getItem("token");
console.log("TOKEN:", token);

if (!token) window.location.href = "login.html";


 

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

function showSection(section) {
  const sections = ["chat", "history", "profile", "sports", "diet"];
  sections.forEach((s) => {
    document.getElementById(s + "Section").style.display =
      s === section ? "block" : "none";
  });

  if (section === "history") loadHistory();
  if (section === "profile") loadProfile();
  if (section === "sports") loadSports();
  if (section === "diet") loadDiet();
}

async function sendMessage() {
  const input = document.getElementById("userInput");


  const message = input.value.trim();
  if (!message) return;

  input.value = "";

  const chatBox = document.getElementById("chatBox");

 // user message
chatBox.innerHTML += `<div class="chat-message user-msg">${message}</div>`;

// AI message container
const aiDiv = document.createElement("div");
aiDiv.className = "chat-message ai-msg ai-message";
aiDiv.innerHTML = "Typing...";
chatBox.appendChild(aiDiv);

  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch(API + "/api/ai/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ message }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let fullText = ""; // ✅ IMPORTANT — accumulate markdown

    aiDiv.innerHTML = ""; // clear "Typing..."

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      fullText += chunk; // ✅ accumulate FIRST

      // ✅ then render markdown
      aiDiv.innerHTML = marked.parse(fullText);

      chatBox.scrollTop = chatBox.scrollHeight;
    }
  } catch (err) {
    aiDiv.innerHTML = "⚠️ Server error";
    console.error(err);
  }
}
async function loadHistory() {
  try {
    const res = await fetch(API + "/api/ai/history", {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();
    const historyBox = document.getElementById("historyBox");
    historyBox.innerHTML = "";
    

    data.reverse().forEach((chat, index) => {
      // 🔥 create SHORT smart summary
      const short =
        chat.message.length > 40
          ? chat.message.substring(0, 40) + "..."
          : chat.message;

      historyBox.innerHTML += `
        <div class="recent-item" onclick="openFullChat(${index})">
          • ${short}
        </div>
      `;
    });

    // store globally for modal
    window.fullHistory = data;
  } catch (err) {
    console.error("History load error:", err);
  }
}

async function loadProfile() {
  try {
    const res = await fetch(API + "/api/user/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const user = await res.json();

    // ✅ Insert values into spans
    document.getElementById("name").innerText = user.name || "";
    document.getElementById("age").innerText = user.age || "";
    document.getElementById("weight").innerText = user.weight || "";
    
    // If you also want goal (add span first, see below)
    if (document.getElementById("goal")) {
      document.getElementById("goal").innerText = user.goal || "";
    }

  } catch (err) {
    console.error("Profile load error:", err);
  }
}

async function loadSports() {
  const res = await fetch(API + "/api/sports");
  const data = await res.json();

    const box = document.getElementById("sportsBox");

  box.innerHTML = "";

  data.forEach(sport => {

    const card = document.createElement("div");
    card.className = "sport-item glass";

    card.innerHTML = `
      <h3>${sport.name}</h3>
    `;

    card.onclick = () => openSport(sport.name);

    box.appendChild(card);
  });
}

async function loadDiet() {
  const res = await fetch(API + "/api/diet");
  const data = await res.json();

  const dietBox = document.getElementById("dietBox");
  dietBox.innerHTML = "";

  data.forEach((item) => {
    dietBox.innerHTML += `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <hr>
    `;
  });
}




window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
});

/* ================= WELCOME FLOW ================= */

function enterDashboard() {
  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("featureScreen").style.display = "flex";
}



/* ================= USERNAME IN WELCOME ================= */

async function loadUser() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(API + "/api/user/me", {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();

    // sidebar name
    document.getElementById("username").innerText =
      data.name || data.email || "User";

    // welcome name
    document.getElementById("welcomeUsername").innerText =
      data.name || data.email || "User";

  } catch (err) {
    console.error("LOAD USER ERROR:", err);
  }
}

function openFeature(section) {
  document.getElementById("featureScreen").style.display = "none";

  const sections = ["profile", "chat", "sports", "diet"];

  sections.forEach((s) => {
    document.getElementById(s + "Section").style.display =
      s === section ? "block" : "none";

      if(section === "sports"){
  loadSports();
}
  });

  // load data when opened
  if (section === "profile") loadProfile();
  if (section === "sports") loadSports();
  if (section === "diet") loadDiet();
  if (section === "chat") loadHistory();
}

function goBack() {
  const sections = ["profile", "chat", "sports", "diet"];

  sections.forEach((s) => {
    document.getElementById(s + "Section").style.display = "none";
  });

  document.getElementById("featureScreen").style.display = "flex";
}
function openFullChat(index) {
  const chat = window.fullHistory[index];
  const view = document.getElementById("fullChatView");

  view.innerHTML = `
    <h3>You:</h3>
    <p>${chat.message}</p>
    <hr>
    <h3>AI:</h3>
    <div class="ai-message">${marked.parse(chat.reply)}</div>
  `;

  document.getElementById("chatModal").style.display = "flex";
}

function closeChatModal() {
  document.getElementById("chatModal").style.display = "none";
}




async function openSport(name){

  const res = await fetch(`${API}/api/sports/data/${name}`);
  const sport = await res.json();

  const box = document.getElementById("sportsBox");

  box.innerHTML = `
  <h2>${sport.name}</h2>

  <h3>Rules</h3>
  <ul>${sport.rules.map(r => `<li>${r}</li>`).join("")}</ul>

  <h3>Workouts</h3>
  <ul>${sport.workouts.map(w => `<li>${w}</li>`).join("")}</ul>

  <h3>Diet</h3>
  <p>${sport.diet}</p>

  <h3>Protein Intake</h3>
  <p>${sport.protein}</p>

  <h3>Nutrition</h3>
  <ul>${sport.nutrition.map(n => `<li>${n}</li>`).join("")}</ul>

  <h3>Injury Prevention</h3>
  <ul>${sport.injuryPrevention.map(i => `<li>${i}</li>`).join("")}</ul>

  <button onclick="generatePlan('${sport.name}')">
    Create My Training Plan
  </button>
  `;
}



function showCategory(type) {
  document.getElementById("teamSports").style.display =
    type === "team" ? "grid" : "none";

  document.getElementById("individualSports").style.display =
    type === "individual" ? "grid" : "none";

  document.getElementById("combatSports").style.display =
    type === "combat" ? "grid" : "none";

  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
}

function openSport(key) {
  const sport = sportsData[key];

  document.getElementById("sportTitle").innerText = sport.name;
  document.getElementById("sportRules").innerHTML = makeList(sport.rules);
  document.getElementById("sportTraining").innerHTML = makeList(sport.training);
  document.getElementById("sportDiet").innerHTML = makeList(sport.diet);

  document.getElementById("sportDetails").classList.add("active");
}

function closeSport() {
  document.getElementById("sportDetails").classList.remove("active");
}

function makeList(arr) {
  return "<ul>" + arr.map(i => `<li>${i}</li>`).join("") + "</ul>";
}


const sportsData = {

football: {
  name: "Football",
  rules: [
    "11 players per team",
    "Match duration: 90 minutes (2 halves)",
    "No hands except goalkeeper",
    "Offside rule applies",
    "Fouls result in free kicks or penalties"
  ],
  training: [
    "Sprint interval training",
    "Ball control drills",
    "Passing accuracy routines",
    "Agility ladder footwork",
    "Strength & conditioning"
  ],
  diet: [
    "High-carb meals for stamina",
    "Lean protein for muscle recovery",
    "Electrolytes for hydration",
    "Pre-match light meals",
    "Post-match protein + carbs"
  ]
},

cricket: {
  name: "Cricket",
  rules: [
    "11 players per team",
    "Batting and bowling innings",
    "Runs scored between wickets",
    "Over = 6 legal deliveries",
    "LBW and catch dismissals"
  ],
  training: [
    "Net practice batting",
    "Bowling line & length drills",
    "Fielding reflex training",
    "Core strength workouts",
    "Endurance running"
  ],
  diet: [
    "Balanced carb-protein meals",
    "Hydration during long matches",
    "Slow-release energy foods",
    "Muscle recovery nutrition"
  ]
},


};