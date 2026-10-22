// Edit these once the real contact details exist.
const CONFIG = {
  phoneDisplay: "(715) 308-1833",
  phoneHref: "+17153081833",
  email: "info@example.com",
};

document.querySelectorAll("[data-phone]").forEach((a) => (a.href = "tel:" + CONFIG.phoneHref));
document.querySelectorAll("[data-phone-text]").forEach((s) => (s.textContent = CONFIG.phoneDisplay));
document.querySelectorAll("[data-email]").forEach((a) => {
  a.href = "mailto:" + CONFIG.email;
  a.textContent = CONFIG.email;
});
document.getElementById("year").textContent = new Date().getFullYear();

const burger = document.querySelector(".burger");
const menu = document.getElementById("menu");
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", false);
  }
});

// Quote form: opens the visitor's email app with the request pre-filled.
// Swap for a form service (Formspree, Netlify Forms, etc.) to receive submissions directly.
const form = document.getElementById("quote");
const msg = form.querySelector(".form-msg");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (!d.name || !d.phone || !d.location || !d.service) {
    msg.textContent = "Please fill in your name, phone, location and the service needed.";
    msg.className = "form-msg err";
    return;
  }
  const body = [
    `Name: ${d.name}`, `Phone: ${d.phone}`, `Email: ${d.email || "-"}`,
    `RV location: ${d.location}`, `Service: ${d.service}`, "", d.details || "",
  ].join("\n");
  location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Quote request: " + d.service)}&body=${encodeURIComponent(body)}`;
  msg.textContent = "Thanks! Your email app should open with your request. You can also call us.";
  msg.className = "form-msg ok";
});


// Town checker: towns grouped by the 14 counties served. Not every town is listed.
(function () {
  const COUNTIES = {
    "Dunn": ["Menomonie", "Colfax", "Boyceville", "Elk Mound", "Downing", "Knapp", "Ridgeland", "Wheeler", "Sand Creek"],
    "Eau Claire": ["Eau Claire", "Altoona", "Augusta", "Fall Creek", "Fairchild", "Eleva Junction"],
    "Chippewa": ["Chippewa Falls", "Lake Hallie", "Bloomer", "Cadott", "Stanley", "Cornell", "Boyd", "New Auburn", "Jim Falls", "Holcombe"],
    "Barron": ["Barron", "Rice Lake", "Cumberland", "Chetek", "Turtle Lake", "Cameron", "Prairie Farm", "Almena", "Dallas", "Haugen"],
    "Polk": ["Balsam Lake", "Amery", "Osceola", "St. Croix Falls", "Luck", "Frederic", "Clear Lake", "Centuria", "Dresser", "Milltown", "Star Prairie"],
    "St. Croix": ["Hudson", "New Richmond", "Baldwin", "Hammond", "Glenwood City", "Roberts", "Somerset", "Woodville", "Deer Park"],
    "Pierce": ["River Falls", "Ellsworth", "Prescott", "Spring Valley", "Plum City", "Elmwood", "Bay City", "Maiden Rock"],
    "Pepin": ["Durand", "Pepin", "Arkansaw", "Stockholm"],
    "Buffalo": ["Mondovi", "Alma", "Fountain City", "Cochrane", "Gilmanton", "Nelson"],
    "Trempealeau": ["Arcadia", "Whitehall", "Blair", "Independence", "Galesville", "Trempealeau", "Osseo", "Eleva", "Strum"],
    "Clark": ["Neillsville", "Thorp", "Greenwood", "Abbotsford", "Colby", "Loyal", "Owen", "Withee", "Dorchester"],
    "Jackson": ["Black River Falls", "Hixton", "Merrillan", "Alma Center", "Taylor", "Melrose", "Northfield"],
    "La Crosse": ["La Crosse", "Onalaska", "Holmen", "West Salem", "Bangor", "Mindoro"],
    "Rusk": ["Ladysmith", "Bruce", "Hawkins", "Tony", "Weyerhaeuser", "Sheldon", "Glen Flora", "Exeland", "Conrath", "Ingram"],
  };
  const input = document.getElementById("town-in");
  const res = document.getElementById("town-res");
  if (!input || !res) return;
  const towns = [];
  Object.keys(COUNTIES).forEach((c) => COUNTIES[c].forEach((t) => towns.push({ town: t, county: c })));
  towns.sort((a, b) => a.town.localeCompare(b.town));
  const norm = (s) => s.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();
  const base = "Type a town to check. Not listed? Call or text us, we may still come to you.";
  function check() {
    const q = norm(input.value);
    res.className = "tc-res";
    if (!q) { res.textContent = base; return; }
    const exact = towns.find((t) => norm(t.town) === q);
    const county = Object.keys(COUNTIES).find((c) => norm(c) === q || norm(c + " county") === q);
    const part = towns.filter((t) => norm(t.town).startsWith(q));
    if (exact) { res.className = "tc-res yes"; res.textContent = "Yes, we serve " + exact.town + " (" + exact.county + " County)."; }
    else if (county) { res.className = "tc-res yes"; res.textContent = "Yes, we serve " + county + " County."; }
    else if (part.length === 1 && q.length >= 3) { res.className = "tc-res yes"; res.textContent = "Yes, we serve " + part[0].town + " (" + part[0].county + " County)."; }
    else if (part.length > 1) { res.textContent = "Keep typing, or pick a town from the list."; }
    else { res.className = "tc-res maybe"; res.textContent = "We don't have that town listed. Call or text us at " + CONFIG.phoneDisplay + ", we may still come to you."; }
  }
  input.addEventListener("input", check);
})();
