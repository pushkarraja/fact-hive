// CATEGORIES :
const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

// Importing Elements
const share_btn = document.querySelector(".btn-open");
const form = document.querySelector(".fact-form");
const facts_list = document.querySelector(".facts-list");

// Create DOM elements: Render facts in list
facts_list.innerHTML = "";

// Load data from Supabase
async function loadFacts() {
  const res = await fetch(
    "https://lyrtfcxcalfxjhwemhpk.supabase.co/rest/v1/FactHiveFacts",
    {
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnRmY3hjYWxmeGpod2VtaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI2ODYxODUsImV4cCI6MTk4ODI2MjE4NX0.azockTYpir8R0Njy2-JXVPQPIoeY0ekjsrDIkaer28Q",
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5cnRmY3hjYWxmeGpod2VtaHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI2ODYxODUsImV4cCI6MTk4ODI2MjE4NX0.azockTYpir8R0Njy2-JXVPQPIoeY0ekjsrDIkaer28Q",
      },
    }
  );

  const data = await res.json();
  createFactsList(data);
}

loadFacts();

// create facts list
function createFactsList(dataArray) {
  const htmlArray = dataArray.map(
    (fact) => `<li class="fact">
    <p>
    ${fact.fact_text}
    <a
      class="source"
      href="${fact.source}"
      target="_blank"
      >(Source)</a
    >
    </p>
    <span class="tag" style="background-color: ${
      CATEGORIES.find((cat) => cat.name === fact.category).color
    }"
    >${fact.category}</span
    >
    </li>`
  );

  const html = htmlArray.join("");
  facts_list.insertAdjacentHTML("afterbegin", html);
}

// Toggle Form Visibility
share_btn.addEventListener("click", function () {
  if (form.classList.contains("hidden")) {
    form.classList.remove("hidden");
    share_btn.textContent = "Close";
  } else {
    form.classList.add("hidden");
    share_btn.textContent = "Share a fact";
  }
});
