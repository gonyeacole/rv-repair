// Edit these once the real contact details exist.
const CONFIG = {
  phoneDisplay: "(000) 000-0000",
  phoneHref: "+10000000000",
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

// Service area map (Leaflet + OpenStreetMap tiles)
(function () {
  const el = document.getElementById("service-map");
  if (!el) return;
  if (typeof L === "undefined") {
    el.textContent = "Serving Menomonie, Eau Claire, Chippewa Falls, Rice Lake, River Falls, Hudson and nearby.";
    el.style.cssText = "display:grid;place-items:center;text-align:center;padding:24px;height:auto;min-height:160px";
    return;
  }
  const home = [44.8755, -91.9193];
  const towns = [
    { name: "Menomonie", at: home, home: true },
    { name: "Eau Claire", at: [44.8113, -91.4985] },
    { name: "Chippewa Falls", at: [44.9369, -91.3929] },
    { name: "Rice Lake", at: [45.5061, -91.7382] },
    { name: "River Falls", at: [44.8614, -92.6238] },
    { name: "Hudson", at: [44.9747, -92.7568] },
  ];
  const map = L.map(el, { scrollWheelZoom: false, attributionControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);
  // Approximate coverage radius around Menomonie; adjust to the real service radius.
  const area = L.circle(home, {
    radius: 80000, color: "#141414", weight: 2, dashArray: "6 6",
    fillColor: "#f7be1b", fillOpacity: 0.18,
  }).addTo(map);
  towns.forEach((t) => {
    const icon = L.divIcon({
      className: "", html: `<div class="pin${t.home ? " home" : ""}"></div>`,
      iconSize: t.home ? [24, 24] : [16, 16], iconAnchor: t.home ? [12, 12] : [8, 8],
    });
    L.marker(t.at, { icon, title: t.name, keyboard: false })
      .bindTooltip(t.name, { permanent: true, direction: "right", offset: [10, 0], className: "town" + (t.home ? " home" : "") })
      .addTo(map);
  });
  map.fitBounds(area.getBounds(), { padding: [10, 10] });
  el.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: true });
})();
