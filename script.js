// Edit these once the real contact details exist.
const CONFIG = {
  phoneDisplay: "(715) 308-1833",
  phoneHref: "+17153081833",
  email: "ottercreekrvservice@gmail.com",
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
  if (!d.first || !d.phone || !d.details) {
    msg.textContent = "Please fill in your first name, phone and a short message.";
    msg.className = "form-msg err";
    return;
  }
  const name = [d.first, d.last].filter(Boolean).join(" ");
  const body = [
    `Name: ${name}`, `Phone: ${d.phone}`, `Email: ${d.email || "-"}`, "", d.details,
  ].join("\n");
  location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Quote request from " + name)}&body=${encodeURIComponent(body)}`;
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

// Mobile menu toggle (bar under the header)
(function () {
  const nav = document.getElementById("menu");
  const btn = nav && nav.querySelector(".menu-toggle");
  if (!btn) return;
  const set = (open) => { nav.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open)); };
  btn.addEventListener("click", () => set(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => { if (e.target.closest(".menu-in a")) set(false); });
})();

// Price estimator: service + address -> drive distance from Otter Creek, WI -> typical price range.
// Everything you might want to change is in EST_CONFIG. Hour ranges are typical estimates, not quotes.
(function () {
  const EST_CONFIG = {
    origin: { label: "Otter Creek, WI", query: "Otter Creek, Wisconsin, USA", lat: 44.86, lon: -91.33 },
    visitFee: 120,          // includes travel and the first hour of labor
    hourlyRate: 120,        // each extra hour
    // Trip fee: no charge within freeMinutes of drive time; farther out, round-trip drive time x tripRate, never less than tripMinimum.
    // These three numbers are placeholders copied from an example. Set your real ones.
    freeMinutes: 30,
    tripRate: 100,          // dollars per hour of round-trip drive time
    tripMinimum: 50,
    callIfOverMiles: 75,    // beyond this, ask the visitor to call first
    roadFactor: 1.25,       // used only if the routing service is unavailable
    // typical EXTRA labor hours beyond the first hour: [low, high]
    services: {
      repair:     { name: "Repair & Diagnostics",  hours: [0, 2], note: "Most diagnostics finish within the first hour." },
      electrical: { name: "Appliance & Electrical", hours: [0, 2], note: "Fridges, furnaces, converters, batteries and wiring." },
      plumbing:   { name: "Plumbing",               hours: [0, 2], note: "Leaks, pumps and water heaters." },
      roof:       { name: "Roof & Structural",      hours: [1, 3], note: "Roof repairs, seals and structural fixes." },
      seasonal:   { name: "Seasonal Maintenance",   hours: [0, 1], note: "Winterizing, de-winterizing and inspections." },
      emergency:  { name: "Emergency Help",         hours: [0, 2], note: "Roadside help when feasible. Call us first." },
    },
  };

  const form = document.getElementById("est-form");
  const out = document.getElementById("est-out");
  if (!form || !out) return;
  const phone = (typeof CONFIG !== "undefined" && CONFIG.phoneDisplay) || "(715) 308-1833";
  const phoneHref = (typeof CONFIG !== "undefined" && CONFIG.phoneHref) || "+17153081833";
  const pol = document.getElementById("est-policy");
  if (pol) pol.textContent = `Within about ${EST_CONFIG.freeMinutes} minutes of ${EST_CONFIG.origin.label} there is no trip fee. Farther out, we still come to you. A trip fee applies based on drive time: $${EST_CONFIG.tripRate} an hour round trip, $${EST_CONFIG.tripMinimum} minimum.`;
  const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
  const miles = (m) => m / 1609.344;

  function timeoutFetch(url, ms) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), ms);
    return fetch(url, { signal: ctl.signal, headers: { Accept: "application/json" } }).finally(() => clearTimeout(t));
  }
  async function geocode(q) {
    const r = await timeoutFetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=" + encodeURIComponent(q), 9000);
    if (!r.ok) throw new Error("geocode");
    const j = await r.json();
    if (!j.length) return null;
    return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon), label: j[0].display_name };
  }
  function haversine(a, b) {
    const R = 6371000, rad = (d) => (d * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  async function drive(a, b) {
    try {
      const r = await timeoutFetch(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`, 9000);
      if (!r.ok) throw new Error("route");
      const j = await r.json();
      if (j.routes && j.routes[0]) return { meters: j.routes[0].distance, seconds: j.routes[0].duration, approx: false };
      throw new Error("route");
    } catch (e) {
      const m = haversine(a, b) * EST_CONFIG.roadFactor;
      return { meters: m, seconds: (m / 1609.344 / 45) * 3600, approx: true };
    }
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function show(html) { out.hidden = false; out.innerHTML = html; }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = form.service.value, address = form.address.value.trim();
    const svc = EST_CONFIG.services[key];
    if (!svc || address.length < 3) {
      show('<p class="est-msg err">Choose a service and enter the city or address where your RV is parked.</p>');
      return;
    }
    const btn = form.querySelector(".est-go");
    btn.disabled = true; btn.textContent = "Measuring the drive...";
    show('<p class="est-msg">Looking up your address...</p>');
    try {
      const dest = await geocode(/wisconsin|,\s*wi\b/i.test(address) ? address : address + ", Wisconsin");
      if (!dest) {
        show('<p class="est-msg err">We could not find that address. Try adding the city and state, like "Rice Lake, WI".</p>');
        return;
      }
      let origin = EST_CONFIG.origin;
      try { const o = await geocode(origin.query); if (o) origin = Object.assign({}, origin, o); } catch (err) { /* use built-in coordinates */ }
      const d = await drive(origin, dest);
      const mi = miles(d.meters), mins = Math.max(1, Math.round(d.seconds / 60));
      const far = mi > EST_CONFIG.callIfOverMiles;
      const roundTripHrs = (2 * d.seconds) / 3600;
      const travelFee = mins > EST_CONFIG.freeMinutes ? Math.max(EST_CONFIG.tripMinimum, roundTripHrs * EST_CONFIG.tripRate) : 0;
      const roundTripTxt = (Math.round(roundTripHrs * 10) / 10) + " hr round trip";
      const lo = EST_CONFIG.visitFee + EST_CONFIG.hourlyRate * svc.hours[0] + travelFee;
      const hi = EST_CONFIG.visitFee + EST_CONFIG.hourlyRate * svc.hours[1] + travelFee;
      const range = lo === hi ? money(lo) : money(lo) + " to " + money(hi);
      const time = mins >= 60 ? Math.floor(mins / 60) + " hr" + (mins % 60 ? " " + (mins % 60) + " min" : "") : mins + " min";
      const msg = `Estimate request: ${svc.name}. RV location: ${address} (about ${Math.round(mi)} miles from ${EST_CONFIG.origin.label}).`;
      show(`
        <div class="est-res">
          <div class="est-dist"><b>${Math.round(mi)} miles</b><span>about ${time} from ${esc(EST_CONFIG.origin.label)}${d.approx ? " (approximate)" : ""}</span></div>
          ${far ? `<p class="est-msg warn">That is farther than we usually travel. Please call or text <a href="tel:${phoneHref}">${phone}</a> and we will tell you if we can come.</p>` : ""}
          <div class="est-price"><span>${esc(svc.name)}, typical range</span><b>${range}</b><small>plus parts and materials</small></div>
          <ul class="est-lines">
            <li><span>Service visit (1st hour of labor included)</span><b>${money(EST_CONFIG.visitFee)}</b></li>
            <li><span>${travelFee > 0 ? "Trip fee (" + roundTripTxt + " at $" + EST_CONFIG.tripRate + "/hr)" : "Trip fee (within " + EST_CONFIG.freeMinutes + " min of " + esc(EST_CONFIG.origin.label) + ")"}</span><b>${travelFee > 0 ? money(travelFee) : "none"}</b></li>
            <li><span>Extra labor, if needed ($${EST_CONFIG.hourlyRate} an hour)</span><b>${svc.hours[1] === 0 ? "none" : svc.hours[0] === svc.hours[1] ? svc.hours[0] + " hr" : svc.hours[0] + " to " + svc.hours[1] + " hr"}</b></li>
            <li><span>Parts and materials</span><b>billed separately</b></li>
          </ul>
          <p class="est-fine">${esc(svc.note)} This is an estimate, not a quote. You get the final price after the diagnosis.</p>
          <div class="est-cta"><button type="button" class="est-req" data-msg="${esc(msg)}">Request this service</button><a class="est-call" href="tel:${phoneHref}">Call ${phone}</a></div>
        </div>`);
      out.querySelector(".est-req").addEventListener("click", (ev) => {
        const ta = document.querySelector('#quote textarea[name="details"]');
        if (ta) ta.value = ev.currentTarget.dataset.msg + "\n";
        const q = document.getElementById("quote");
        if (q) { q.scrollIntoView({ behavior: "smooth", block: "start" }); const f = q.querySelector('input[name="first"]'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 500); }
      });
    } catch (err) {
      show(`<p class="est-msg err">We could not measure the drive right now. Call or text <a href="tel:${phoneHref}">${phone}</a> and we will give you a price.</p>`);
    } finally {
      btn.disabled = false; btn.textContent = "Get my estimate";
    }
  });
})();
