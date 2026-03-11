const API = "http://192.168.1.72:3000";
const token = localStorage.getItem("token");
console.log("TOKEN:", token);

if (!token) window.location.href = "login.html";

let currentSport = "";
 

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

function showDiet(type){

document.querySelectorAll(".diet-panel").forEach(panel=>{
panel.style.display="none";
});

document.getElementById(type+"Diet").style.display="block";


document.querySelectorAll(".diet-btn").forEach(btn=>{
btn.classList.remove("active");
});

event.target.classList.add("active");

}

function showDietType(category, type){

const veg = document.getElementById(category + "-veg");
const nonveg = document.getElementById(category + "-nonveg");

veg.style.display = "none";
nonveg.style.display = "none";

document.getElementById(category + "-" + type).style.display = "block";

/* UPDATE ACTIVE BUTTON */

const buttons = document.querySelectorAll(".type-btn");

buttons.forEach(btn => {
btn.classList.remove("active");
});

event.target.classList.add("active");

}



// ================= LOAD DIET FROM API =================

async function loadDiet() {

  try {

    const dietBox = document.getElementById("dietBox");

    // stop if dietBox does not exist
    if (!dietBox) return;

    const res = await fetch(API + "/api/diet");
    const data = await res.json();

    dietBox.innerHTML = "";

    data.forEach((item) => {

      dietBox.innerHTML += `
        <div class="diet-plan">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>
      `;

    });

  } catch (error) {
    console.error("Diet loading error:", error);
  }

}


// ================= DIET SECTION ANIMATION =================

document.addEventListener("DOMContentLoaded", () => {

  const headers = document.querySelectorAll(".diet-header");

  headers.forEach(header => {

    header.addEventListener("click", () => {

      const content = header.nextElementSibling;

      if (!content) return;

      content.classList.toggle("open");

      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }

    });

  });

});


// ================= PAGE LOAD =================

window.addEventListener("DOMContentLoaded", () => {

  if (typeof loadProfile === "function") {
    loadProfile();
  }

  loadDiet();

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

function openFeature(section){

  const sections = ["profile","chat","sports","diet"];

  sections.forEach(function(s){

    const el = document.getElementById(s + "Section");
    if(!el) return;

    if(s === section){

      if(s === "profile"){
        el.style.display = "flex";   // needed for overlay center layout
      }else{
        el.style.display = "block";
      }

    }else{
      el.style.display = "none";
    }

  });

  // keep dashboard visible for blur
  if(section !== "profile"){
    document.getElementById("featureScreen").style.display = "none";
  }

  // load data
  if(section === "profile") loadProfile();
  if(section === "sports") loadSports();
  if(section === "diet") loadDiet();
  if(section === "chat") loadHistory();

}

function showFeatureScreen(){
  const screen = document.getElementById("featureScreen");
  screen.classList.add("show");
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




async function openSportFromAPI(name){

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

  <button onclick="generatePlan(currentSport)">
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



async function generatePlan(sport){

  console.log("SPORT:", sport);

const modal = document.getElementById("sfAiWindow");
const result = document.getElementById("sfAiResult");

/* OPEN AI WINDOW */

if(modal){
modal.classList.add("show");
}

/* SHOW LOADING MESSAGE */


result.innerHTML = `
<div style="text-align:center">
🤖 Generating AI Training Plan...
<br><br>
⏳ Please wait
</div>
`;

try{

const token = localStorage.getItem("token");

/* CALL BACKEND AI API */

const res = await fetch(API +"/api/ai/training-plan",{
method:"POST",
headers:{
"Content-Type":"application/json",
"Authorization":"Bearer " + token
},
body: JSON.stringify({ sport })
});

/* PARSE RESPONSE */

const data = await res.json();

/* DISPLAY AI RESULT */

if(result){
result.innerHTML = `
<h3>🏋 Training Plan for ${data.sport}</h3>

<pre>${data.plan}</pre>
`;
}

}catch(err){

console.error("AI PLAN ERROR:", err);

if(result){
result.innerHTML = "❌ Failed to generate AI training plan. Please try again.";
}

}

}

function closeSfAiWindow(){

document.getElementById("sfAiWindow").classList.remove("show");

}





function openSport(key){

  currentSport = key;

const sport = sportsData[key];

document.getElementById("sportTitle").innerText = sport.name;

document.querySelector(".ai-btn").setAttribute(
  "onclick",
  `generatePlan('${sport.name}')`
);

document.getElementById("sportRules").innerHTML = makeList(sport.rules);

document.getElementById("sportTraining").innerHTML = makeList(sport.training);

document.getElementById("sportDiet").innerHTML = makeList(sport.diet);

document.getElementById("sportExercises").innerHTML =
sport.exercises.map(e=>`
<div class="exercise-card">
<h4>${e.name}</h4>
<img src="${e.gif}">
</div>
`).join("");

document.getElementById("sportInjury").innerHTML = makeList(sport.injury);

document.getElementById("sportDetails").style.backgroundImage =
`url(${sport.image})`;

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

image: "",

rules: [
"11 players per team",
"90 minutes match",
"Offside rule applies"
],

training: [
"Sprint interval training",
"Ball control drills",
"Agility ladder"
],

diet: [
"High carbohydrate meals",
"Lean protein",
"Electrolytes"
],

exercises: [
{
name:"Dribbling Drill",
gif:"/gifs/Warm Up Football GIF by VfL Wolfsburg.gif"
},
{
name:"Sprint Training",
gif:"/gifs/GIF by NYCFC.gif"
}
],

injury:[
"Wear shin guards",
"Warm up before play",
"Stretch hamstrings"
]

},

cricket:{
name:"Cricket",

image:"images/cricket-bg.jpg",

rules:[
"11 players per team",
"Over = 6 balls",
"Runs scored between wickets"
],

training:[
"Batting net practice",
"Bowling drills",
"Fielding reflex training"
],

diet:[
"Balanced carb-protein meals",
"Hydration during long matches"
],

exercises:[
{
name:"Batting Drill",
gif:"/gifs/gif.gif"
},
{
name:"Bowling Drill",
gif:"/gifs/cricket GIF.gif"
}
],

injury:[
"Shoulder mobility training",
"Stretch hamstrings",
"Use proper protective gear"
]

},

basketball: {
name: "Basketball",

image: "",

rules: [
"5 players per team",
"4 quarters (10–12 minutes each)",
"No double dribbling"
],

training: [
"Shooting practice",
"Dribbling drills",
"Defensive footwork"
],

diet: [
"High energy carbohydrates",
"Lean protein for muscle recovery",
"Plenty of hydration"
],

exercises: [
{
name:"Dribbling Drill",
gif:"/gifs/getting ready oklahoma city thunder GIF by NBA.gif"
},
{
name:"Jump Shot Practice",
gif:"/gifs/Swag Jackson GIF by CyclonesTV.gif"
}
],

injury:[
"Wear ankle support",
"Warm up before games",
"Strengthen knees and ankles"
]
},



volleyball: {
name: "Volleyball",

image: "",

rules: [
"6 players per team",
"Best of 5 sets",
"Each team allowed 3 touches"
],

training: [
"Spike training",
"Serve practice",
"Jump training"
],

diet: [
"Balanced carbs and protein",
"Hydration with electrolytes",
"Light pre-match meals"
],

exercises: [
{
name:"Spike Drill",
gif:"/gifs/volleyball spike GIF by Black Hills State University.gif"
},
{
name:"Jump Training",
gif:"/gifs/training jumping GIF by PUMA.gif"
}
],

injury:[
"Wear knee pads",
"Proper landing technique",
"Stretch shoulders and legs"
]
},



hockey: {
name: "Hockey",

image: "",

rules: [
"11 players per team",
"4 quarters of 15 minutes",
"Use of stick only to hit ball"
],

training: [
"Stick handling drills",
"Passing drills",
"Speed skating or running"
],

diet: [
"High carbohydrate meals",
"Lean proteins",
"Electrolyte drinks"
],

exercises: [
{
name:"Stick Control Drill",
gif:"/gifs/Field Hockey GIF by ONE Sports Warehouse.gif"
},
{
name:"Sprint Training",
gif:"/gifs/GIF by Hockey Training.gif"
}
],

injury:[
"Wear mouthguard and shin guards",
"Proper warm-up",
"Strengthen lower body"
]
},



rugby: {
name: "Rugby",

image: "",

rules: [
"15 players per team",
"Two halves of 40 minutes",
"Forward passes not allowed"
],

training: [
"Tackle drills",
"Strength training",
"Endurance running"
],

diet: [
"High protein diet",
"Complex carbohydrates",
"Hydration and electrolytes"
],

exercises: [
{
name:"Tackle Drill",
gif:"/gifs/GIF by UFC.gif"
},
{
name:"Strength Training",
gif:"/gifs/World Rugby Sport GIF by Rugby World Cup.gif"
}
],

injury:[
"Wear mouthguard",
"Proper tackling technique",
"Neck and shoulder strengthening"
]
},



athletics: {
name: "Athletics (Running)",

image: "",

rules: [
"Individual or relay races",
"Stay within assigned lane",
"False start leads to disqualification"
],

training: [
"Sprint interval training",
"Endurance running",
"Stride technique drills"
],

diet: [
"High carbohydrate meals",
"Lean protein for muscle repair",
"Hydration with electrolytes"
],

exercises: [
{
name:"Sprint Drill",
gif:"/gifs/Student Go GIF by Deutsche Sporthochschule Köln  German Sport University Cologne.gif"
},
{
name:"Interval Training",
gif:"/gifs/Workout Running GIF by Vondelgym.gif"
}
],

injury:[
"Warm up before running",
"Stretch hamstrings and calves",
"Use proper running shoes"
]
},



swimming: {
name: "Swimming",

image: "",

rules: [
"Different strokes (freestyle, breaststroke, butterfly, backstroke)",
"Start from block or pool edge",
"Touch wall at each turn"
],

training: [
"Lap swimming",
"Breathing technique practice",
"Kickboard drills"
],

diet: [
"High energy carbohydrates",
"Lean protein for recovery",
"Hydration before and after training"
],

exercises: [
{
name:"Freestyle Drill",
gif:"/gifs/Iwutitans Tgoe GIF by iwusports.gif"
},
{
name:"Kickboard Training",
gif:"/gifs/One-Breath.gif"
}
],

injury:[
"Warm up shoulders",
"Stretch arms and legs",
"Avoid overtraining shoulders"
]
},



gymnastics: {
name: "Gymnastics",

image: "",

rules: [
"Performance judged on technique and difficulty",
"Routine must follow competition guidelines",
"Use of approved apparatus"
],

training: [
"Flexibility training",
"Balance practice",
"Strength conditioning"
],

diet: [
"Balanced diet with carbs and protein",
"Calcium-rich foods",
"Hydration throughout training"
],

exercises: [
{
name:"Balance Beam Practice",
gif:"/gifs/v4-460px-Walk-on-a-Gymnastics-Balance-Beam-Step-17.jpg"
},
{
name:"Stretching Routine",
gif:"/gifs/how-a-former-rhythmic-gymnast-created-a-stretching-2.jpg"
}
],

injury:[
"Proper warm-up and stretching",
"Use safety mats",
"Strengthen wrists and ankles"
]
},



badminton: {
name: "Badminton",

image: "",

rules: [
"Played as singles or doubles",
"Best of 3 games (21 points)",
"Shuttlecock must pass over net"
],

training: [
"Footwork drills",
"Smash practice",
"Reaction speed training"
],

diet: [
"Light high-energy meals",
"Lean protein",
"Electrolytes and hydration"
],

exercises: [
{
name:"Footwork Drill",
gif:"/gifs/HdK6e_.gif"
},
{
name:"Smash Practice",
gif:"/gifs/03-forehand-clear-backcourt.gif"
}
],

injury:[
"Wear proper badminton shoes",
"Warm up wrists and shoulders",
"Stretch leg muscles"
]
},



tennis: {
name: "Tennis",

image: "",

rules: [
"Played as singles or doubles",
"Points scored as 15, 30, 40, game",
"Ball must land inside court boundaries"
],

training: [
"Serve practice",
"Forehand and backhand drills",
"Agility and footwork training"
],

diet: [
"Carbohydrate-rich meals",
"Lean proteins",
"Hydration with electrolytes"
],

exercises: [
{
name:"Serve Practice",
gif:"/gifs/tursunov1.gif"
},
{
name:"Footwork Drill",
gif:"/gifs/62fcb4e6ddfd4888a0076e7c4ed4995b_288x.webp"
}
],

injury:[
"Wear elbow and wrist support",
"Proper warm-up",
"Stretch shoulders and legs"
]
},




boxing: {
name: "Boxing",

image: "",

rules: [
"Two fighters compete in a ring",
"Match divided into rounds (usually 3 minutes)",
"Only punches above the waist allowed"
],

training: [
"Shadow boxing",
"Heavy bag training",
"Footwork drills"
],

diet: [
"High protein for muscle recovery",
"Complex carbohydrates",
"Hydration and electrolytes"
],

exercises: [
{
name:"Shadow Boxing",
gif:"/gifs/1b533c_5218471cf9b840249a9d0da3ff637b60~mv2.gif"
},
{
name:"Heavy Bag Training",
gif:"/gifs/tumblr_ndyb4rjnnp1tcnpw9o1_500.gif"
}
],

injury:[
"Wear protective gloves and mouthguard",
"Wrap hands properly",
"Warm up shoulders and wrists"
]
},



kickboxing: {
name: "Kickboxing",

image: "",

rules: [
"Fighters use punches and kicks",
"Matches divided into timed rounds",
"Strikes below the belt are illegal"
],

training: [
"Pad work training",
"Kick drills",
"Cardio endurance training"
],

diet: [
"High protein meals",
"Balanced carbohydrates",
"Electrolyte hydration"
],

exercises: [
{
name:"Kick Drill",
gif:"/gifs/side-kick-press-overhead.gif"
},
{
name:"Pad Work",
gif:"/gifs/mW6LfH.gif"
}
],

injury:[
"Wear shin guards and mouthguard",
"Stretch hips and legs",
"Practice controlled sparring"
]
},



judo: {
name: "Judo",

image: "",

rules: [
"Goal is to throw opponent or control on ground",
"No striking allowed",
"Points scored with throws and holds"
],

training: [
"Throw practice",
"Grip strength training",
"Balance drills"
],

diet: [
"Balanced carbs and protein",
"Lean protein for muscle repair",
"Hydration before and after practice"
],

exercises: [
{
name:"Throw Drill",
gif:"/gifs/QoziOQ.gif"
},
{
name:"Grip Strength Training",
gif:"/gifs/GRIPS-07.gif"
}
],

injury:[
"Wear proper judo gi",
"Practice safe falling techniques",
"Warm up joints before training"
]
},



karate: {
name: "Karate",

image: "",

rules: [
"Points scored with punches and kicks",
"Matches judged by referees",
"Illegal strikes are penalized"
],

training: [
"Kata practice",
"Punch and kick drills",
"Sparring practice"
],

diet: [
"Balanced nutrition",
"Lean proteins",
"Hydration and light meals before training"
],

exercises: [
{
name:"Kata Practice",
gif:"/gifs/a6c3cb_9721ae83ac6644c4b929518373b15728~mv2.gif"
},
{
name:"Kick Drill",
gif:"/gifs/kyokushin-karate-kid.gif"
}
],

injury:[
"Wear mouthguard and protective gear",
"Warm up legs and arms",
"Practice controlled sparring"
]
},



wrestling: {
name: "Wrestling",

image: "",

rules: [
"Two wrestlers compete on a mat",
"Goal is to pin opponent's shoulders",
"No striking allowed"
],

training: [
"Takedown drills",
"Strength training",
"Endurance conditioning"
],

diet: [
"High protein meals",
"Complex carbohydrates",
"Hydration for endurance"
],

exercises: [
{
name:"Takedown Drill",
gif:"/gifs/Bo+Jordan+Armpit+Trip+Finish+(GIF).gif"
},
{
name:"Strength Conditioning",
gif:"/gifs/342e1f_74f3ddee3bff44bdbb3ca17016b78a82~mv2.gif"
}
],

injury:[
"Wear proper wrestling shoes",
"Stretch neck and shoulders",
"Practice safe falling techniques"
]
}


};




