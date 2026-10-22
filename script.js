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

