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
        const response = await fetch("http://localhost:3000/chat", {
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
    const response = await fetch("http://localhost:3000/chat", {
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
    const response = await fetch("http://localhost:3000/api/season-explanation", {
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
