const USER_STORAGE_KEY = "maharashtraTourUsers";
const SESSION_STORAGE_KEY = "maharashtraTourCurrentUser";
const API_BASE_URL = "http://localhost:3000";

function getUsers() {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  const email = localStorage.getItem(SESSION_STORAGE_KEY);
  return getUsers().find(user => user.email === email) || null;
}

function toggleGuideFields() {
  const roleInput = document.getElementById("registerRole");
  const guideFields = document.getElementById("guideRegisterFields");

  if (!roleInput || !guideFields) return;
  guideFields.style.display = roleInput.value === "guide" ? "block" : "none";
}

function registerUser() {
  const name = document.getElementById("registerName")?.value.trim();
  const email = document.getElementById("registerEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("registerPassword")?.value.trim();
  const role = document.getElementById("registerRole")?.value;
  const city = document.getElementById("guideCity")?.value.trim();
  const phone = document.getElementById("guidePhone")?.value.trim();
  const bio = document.getElementById("guideBio")?.value.trim();
  const message = document.getElementById("registerMessage");

  if (!name || !email || !password) {
    message.innerText = "Please fill name, email, and password.";
    return;
  }

  if (role === "guide" && (!city || !phone || !bio)) {
    message.innerText = "Tour guides must add city, phone number, and bio.";
    return;
  }

  const users = getUsers();
  if (users.some(user => user.email === email)) {
    message.innerText = "An account with this email already exists.";
    return;
  }

  users.push({ name, email, password, role, city, phone, bio });
  saveUsers(users);
  localStorage.setItem(SESSION_STORAGE_KEY, email);

  message.innerText = role === "guide"
    ? "Registered successfully. Your name is now added to the hire guide list."
    : "Registered successfully. You are signed in as a tourist.";

  updateCurrentUserBox();
  updateAuthNav();
  closeRegistrationSuggestion();
}

function loginUser() {
  const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
  const password = document.getElementById("loginPassword")?.value.trim();
  const message = document.getElementById("loginMessage");
  const user = getUsers().find(item => item.email === email && item.password === password);

  if (!user) {
    message.innerText = "Invalid email or password.";
    return;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, user.email);
  message.innerText = `Welcome back, ${user.name}.`;
  updateCurrentUserBox();
  updateAuthNav();
  closeRegistrationSuggestion();
}

function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  const message = document.getElementById("loginMessage");
  if (message) message.innerText = "You are logged out.";
  updateCurrentUserBox();
  updateAuthNav();
  showRegistrationSuggestion();
}

function deleteAccount(event) {
  event.preventDefault();
  event.stopPropagation();

  const user = getCurrentUser();
  if (!user) return;

  const confirmed = confirm("Are you sure you want to delete your account? This cannot be undone.");
  if (!confirmed) return;

  const users = getUsers().filter(item => item.email !== user.email);
  saveUsers(users);
  localStorage.removeItem(SESSION_STORAGE_KEY);

  updateCurrentUserBox();
  updateAuthNav();
  renderRegisteredGuides();
  showRegistrationSuggestion();

  const loginMessage = document.getElementById("loginMessage");
  const registerMessage = document.getElementById("registerMessage");
  if (loginMessage) loginMessage.innerText = "Your account has been deleted.";
  if (registerMessage) registerMessage.innerText = "";
}

function updateCurrentUserBox() {
  const box = document.getElementById("currentUserBox");
  if (!box) return;

  const user = getCurrentUser();
  box.innerText = user
    ? `${user.name} is signed in as ${user.role === "guide" ? "Tour Guide" : "Tourist"}.`
    : "No one is signed in.";
}

function updateAuthNav() {
  const link = document.getElementById("navbar-auth-link");
  if (!link) return;

  const user = getCurrentUser();
  link.onclick = null;

  if (!user) {
    link.classList.remove("account-nav-link");
    link.innerText = "Login / Register";
    link.href = "auth.html";
    return;
  }

  link.classList.add("account-nav-link");
  link.href = "#";
  link.setAttribute("aria-label", "Account details");
  link.onclick = toggleAccountMenu;
  link.innerHTML = `
    <span class="account-icon" aria-hidden="true"></span>
    <div class="account-dropdown" id="accountDropdown">
      ${getAccountDetailsHtml(user)}
    </div>
  `;
}

function getAccountDetailsHtml(user) {
  const guideDetails = user.role === "guide"
    ? `
      <p><b>Area:</b> ${escapeHtml(user.city)}</p>
      <p><b>Phone:</b> ${escapeHtml(user.phone)}</p>
      <p><b>Bio:</b> ${escapeHtml(user.bio)}</p>
    `
    : "";

  return `
    <h3>Account Details</h3>
    <p><b>Name:</b> ${escapeHtml(user.name)}</p>
    <p><b>Email:</b> ${escapeHtml(user.email)}</p>
    <p><b>Role:</b> ${user.role === "guide" ? "Tour Guide" : "Tourist"}</p>
    ${guideDetails}
    <button class="account-delete-button" onclick="deleteAccount(event)">Delete my account</button>
  `;
}

function toggleAccountMenu(event) {
  event.preventDefault();
  event.stopPropagation();

  const dropdown = document.getElementById("accountDropdown");
  if (!dropdown) return;

  dropdown.classList.toggle("show-account-dropdown");
}

function showRegistrationSuggestion() {
  if (getCurrentUser() || document.getElementById("registrationSuggestionPopup")) return;
  if (window.location.pathname.toLowerCase().endsWith("auth.html")) return;

  const popup = document.createElement("div");
  popup.id = "registrationSuggestionPopup";
  popup.className = "registration-popup-overlay";
  popup.innerHTML = `
    <div class="registration-popup-box">
      <button class="registration-popup-close" onclick="closeRegistrationSuggestion()" aria-label="Close">x</button>
      <h2>Create your account</h2>
      <p>Register as a tourist or tour guide to save your details and unlock your account profile.</p>
      <div class="registration-popup-actions">
        <a class="registration-popup-button" href="auth.html">Register Now</a>
        <button class="registration-popup-secondary" onclick="closeRegistrationSuggestion()">Maybe Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
}

function closeRegistrationSuggestion() {
  const popup = document.getElementById("registrationSuggestionPopup");
  if (popup) popup.remove();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRegisteredGuides() {
  const list = document.getElementById("registeredGuidesList");
  if (!list) return;

  const guides = getUsers().filter(user => user.role === "guide");

  if (guides.length === 0) {
    list.innerHTML = `
      <div class="col-12">
        <p class="ai-chatbot-subtext">No registered tour guides yet.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = guides.map(guide => `
    <div class="col-12 col-md-4">
      <div class="shadow Tour-Guide-card mb-5">
        <img src="https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1743931895~exp=1743935495~hmac=93961ec3996d2b8cfb21c41f81b44ce9cbd5f325443f45956c13a3572e122dcc&w=900" class="Tour-Guide-card-image" />
        <h1 class="Tour-Guide-card-heading">${escapeHtml(guide.name)}</h1>
        <p class="Tour-Guide-card-paragraph"><b>Area:</b> ${escapeHtml(guide.city)}</p>
        <p class="Tour-Guide-card-paragraph" style="text-align: start;">${escapeHtml(guide.bio)}</p>
        <p class="more-details"><b>Contact:</b> ${escapeHtml(guide.phone)}</p>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  toggleGuideFields();
  updateCurrentUserBox();
  updateAuthNav();
  renderRegisteredGuides();
  showRegistrationSuggestion();
});

document.addEventListener("click", () => {
  const dropdown = document.getElementById("accountDropdown");
  if (dropdown) dropdown.classList.remove("show-account-dropdown");
});

async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (message === "") return;

    const chatBox = document.getElementById("chatMessages");

    // Show user message
    const userMsg = document.createElement("p");
    userMsg.className = "user-message";
    userMsg.innerText = message;
    chatBox.appendChild(userMsg);

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    // Show typing indicator
    const botMsg = document.createElement("p");
    botMsg.className = "bot-message";
    botMsg.innerText = "Typing...";
    chatBox.appendChild(botMsg);

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        botMsg.innerText = data.reply;
    } catch (error) {
        botMsg.innerText = "Sorry, something went wrong.";
        console.error(error);
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}

// ===== AI ITINERARY GENERATOR =====

async function generateItinerary() {
  const city = document.getElementById("cityInput").value;
  const days = parseInt(document.getElementById("daysInput").value);
  const season = document.getElementById("seasonInput").value;
  const language = document.getElementById("languageInput").value;
  const resultDiv = document.getElementById("itineraryResult");

  if (!city) {
    alert("Please enter a destination city");
    return;
  }

  resultDiv.style.display = "block";
  resultDiv.innerHTML = "<p>Generating itinerary using AI...</p>";

  // Strong language enforcement
  const languageHint =
    language === "Hindi"
      ? "उत्तर पूरी तरह से हिंदी भाषा में दें। अंग्रेज़ी शब्दों का प्रयोग न करें।"
      : language === "Marathi"
      ? "उत्तर पूर्णपणे मराठी भाषेत द्या. हिंदी किंवा इंग्रजी वापरू नका."
      : "Respond only in English.";

  // STRICT prompt to control LLM behavior
  const prompt = `
${languageHint}

Create a travel itinerary for EXACTLY ${days} days for ${city}, Maharashtra during the ${season} season.

STRICT RULES (VERY IMPORTANT):
- Generate ONLY ${days} days. Do NOT add extra days.
- Do NOT skip any day.
- Clearly label each day as:
  Day 1:
  Day 2:
  Day 3: (only if ${days} is 3)
- STOP after Day ${days}. Do not continue further.

For EACH day include:
- Places to visit
- Local food suggestions
- Travel tips suitable for ${season}

Keep the content simple, realistic, and tourist-friendly.
`;

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: prompt }),
    });

    const data = await response.json();
    const text = data.reply;

    // ===== SAFE UI RENDERING (NO REGEX) =====
    resultDiv.innerHTML = "";

    for (let i = 1; i <= days; i++) {
      resultDiv.innerHTML += `
        <div class="card mb-3 shadow">
          <div class="card-body">
            <h5 class="card-title">Day ${i}</h5>
            <pre class="card-text" style="white-space: pre-wrap; font-family: Roboto;">
${text}
            </pre>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = "Failed to generate itinerary.";
  }
}

const trips = [
  {
    title: "Beach & Coastal Getaway",
    link: "beachsection.html",
    good: ["summer", "winter"],
    avoid: ["monsoon"]
  },
  {
    title: "Spiritual & Temple Tour",
    link: "spiritualsection.html",
    good: ["summer", "winter"],
    avoid: []
  },
  {
    title: "Hill Stations & Monsoon Trips",
    link: "hillstationsection.html",
    good: ["monsoon"],
    avoid: ["summer"]
  },
  {
    title: "Trekking & Adventure Tour",
    link: "trekkingsection.html",
    good: ["monsoon", "winter"],
    avoid: ["summer"]
  },
  {
    title: "Wildlife & Nature Trails",
    link: "wildlifesection.html",
    good: ["winter"],
    avoid: ["summer", "monsoon"]
  },
  {
    title: "Heritage & Historical Tour",
    link: "heritagesection.html",
    good: ["winter"],
    avoid: ["monsoon"]
  }
];

function filterSeason() {
  const seasonSelect = document.getElementById("seasonSelect");
  const recommended = document.getElementById("recommendedTrips");
  const notRecommended = document.getElementById("notRecommendedTrips");

  if (!seasonSelect || !recommended || !notRecommended) return;

  const season = seasonSelect.value;

  recommended.innerHTML = "";
  notRecommended.innerHTML = "";

  trips.forEach(trip => {
    const card = `
      <div class="col-md-4">
        <a href="${trip.link}" class="text-dark text-decoration-none">
          <div class="destination-card shadow mb-4">
            <h1 class="destination-card-heading">${trip.title}</h1>
            <span class="badge badge-success mb-2">
              Best in ${season.charAt(0).toUpperCase() + season.slice(1)}
            </span>
            <p class="destination-card-paragraph">
              Ideal choice for ${season} travel in Maharashtra.
            </p>
          </div>
        </a>
      </div>
    `;

    if (trip.good.includes(season)) {
      recommended.innerHTML += card;
    } else if (trip.avoid.includes(season)) {
      notRecommended.innerHTML += card;
    }
  });
}


async function explainSeason() {
  const season = document.getElementById("seasonSelect").value;
  const box = document.getElementById("aiExplanation");

  box.classList.remove("d-none");
  box.innerHTML = "🤖 Generating explanation...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/season-explanation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ season })
    });

    const data = await response.json();
    box.innerHTML = `<b>AI Insight:</b><br>${data.explanation}`;

  } catch (error) {
    box.innerHTML =
      "⚠️ Unable to fetch AI explanation at the moment.";
  }
}


// Load default
filterSeason();
