"use strict";

/* =====================================
CediYuan — App Logic
===================================== */

const CONFIG = {
yuanPerCedi: 0.50,
whatsappNumber: "233247583711",
version: "1.0.0"
};

/** @param {string} id */
const $ = (id) => document.getElementById(id);

const screens = {
home: $("homeScreen"),
convert: $("convertScreen"),
rates: $("ratesScreen"),
moreScreen: $("moreScreen"),
howItWorksScreen: $("howItWorksScreen"),
helpScreen: $("helpScreen"),
contactScreen: $("contactScreen"),
privacyScreen: $("privacyScreen"),
aboutScreen: $("aboutScreen"),
settingsScreen: $("settingsScreen")
};

const elements = {
homeAmount: $("homeAmount"),
homeResult: $("homeResult"),
homeRate: $("homeRate"),
convertAmount: $("convertAmount"),
convertResult: $("convertResult"),
convertInputSymbol: $("convertInputSymbol"),
convertInputCode: $("convertInputCode"),
convertResultCode: $("convertResultCode"),
convertRate: $("convertRate"),
forwardRate: $("forwardRate"),
reverseRate: $("reverseRate"),
swapCurrencies: $("swapCurrencies"),
convertWhatsApp: $("convertWhatsApp"),
clearConverter: $("clearConverter"),
themeToggle: $("themeToggle"),
darkModeSetting: $("darkModeSetting"),
defaultDirection: $("defaultDirection"),
decimalPlaces: $("decimalPlaces"),
resetSettings: $("resetSettings"),
currentYear: $("currentYear"),
appVersion: $("appVersion")
};

const navButtons = document.querySelectorAll(".nav-item");
const screenButtons = document.querySelectorAll("[data-screen]");
const contactButtons = document.querySelectorAll("[data-contact]");
const quickAmountButtons = document.querySelectorAll("[data-amount]");

let direction = "GHS";
let decimalCount = 2;

const DEFAULT_PREFERENCES = {
darkMode: false,
direction: "GHS",
decimals: 2
};

/* Preferences */

function loadPreferences() {
let saved = {};

try {
saved = JSON.parse(
localStorage.getItem("cediyuanPreferences") || "{}"
);
} catch (error) {
console.warn("Could not load preferences.", error);
}

direction =
saved.direction === "CNY" || saved.direction === "GHS"
? saved.direction
: DEFAULT_PREFERENCES.direction;

decimalCount = [2, 3, 4].includes(Number(saved.decimals))
? Number(saved.decimals)
: DEFAULT_PREFERENCES.decimals;

document.body.classList.toggle(
"dark-mode",
saved.darkMode === true
);

elements.darkModeSetting.checked =
document.body.classList.contains("dark-mode");

elements.defaultDirection.value = direction;
elements.decimalPlaces.value = String(decimalCount);
}

function savePreferences() {
try {
localStorage.setItem(
"cediyuanPreferences",
JSON.stringify({
darkMode: document.body.classList.contains("dark-mode"),
direction: direction,
decimals: decimalCount
})
);
} catch (error) {
console.warn("Could not save preferences.", error);
}
}

/* Formatting */

/**

* @param {number} value
* @param {string} currency
  */
  function formatMoney(value, currency) {
  const amount = Number(value);

if (!Number.isFinite(amount)) {
return currency + "0";
}

return currency + amount.toLocaleString("en-US", {
minimumFractionDigits: decimalCount,
maximumFractionDigits: decimalCount
});
}

/** @param {number} value */
function formatCedis(value) {
return formatMoney(value, "GH₵");
}

/** @param {number} value */
function formatYuan(value) {
return formatMoney(value, "¥");
}

/** @param {number} value */
function formatRate(value) {
return Number(value).toLocaleString("en-US", {
minimumFractionDigits: 2,
maximumFractionDigits: 4
});
}

function getRateText() {
return "GH₵1 = ¥" + formatRate(CONFIG.yuanPerCedi);
}

/* Rate displays */

function updateRateDisplays() {
elements.homeRate.textContent = getRateText();
elements.forwardRate.textContent = getRateText();

elements.reverseRate.textContent =
"¥1 = GH₵" + formatRate(1 / CONFIG.yuanPerCedi);
}

/* Screen navigation */

/** @param {string} name */
function showScreen(name) {
if (!screens[name]) {
return;
}

Object.keys(screens).forEach(function (key) {
const active = key === name;

screens[key].hidden = !active;
screens[key].classList.toggle("active", active);

});

navButtons.forEach(function (button) {
const active = button.dataset.screen === name;

button.classList.toggle("active", active);

if (active) {
  button.setAttribute("aria-current", "page");
} else {
  button.removeAttribute("aria-current");
}

});

window.scrollTo({
top: 0,
behavior: "smooth"
});
}

screenButtons.forEach(function (button) {
button.addEventListener("click", function (event) {
event.preventDefault();
showScreen(button.dataset.screen);
});
});

/* Home calculator: GHS to CNY */

function updateHomeEstimate() {
const rawAmount = elements.homeAmount.value;
const amount = Number(rawAmount);

if (
rawAmount.trim() === "" ||
!Number.isFinite(amount) ||
amount < 0
) {
elements.homeResult.textContent = "—";
return;
}

elements.homeResult.textContent =
formatYuan(amount * CONFIG.yuanPerCedi);
}

/* Main converter */

function updateConverter() {
const rawAmount = elements.convertAmount.value;
const amount = Number(rawAmount);

const valid =
rawAmount.trim() !== "" &&
Number.isFinite(amount) &&
amount >= 0;

if (direction === "GHS") {
elements.convertInputSymbol.textContent = "GH₵";
elements.convertInputCode.textContent = "GHS";
elements.convertResultCode.textContent = "Chinese yuan (CNY)";
elements.convertRate.textContent = getRateText();

elements.convertResult.textContent = valid
  ? formatYuan(amount * CONFIG.yuanPerCedi)
  : "—";

} else {
elements.convertInputSymbol.textContent = "¥";
elements.convertInputCode.textContent = "CNY";
elements.convertResultCode.textContent = "Ghana cedis (GHS)";

elements.convertRate.textContent =
  "¥1 = GH₵" + formatRate(1 / CONFIG.yuanPerCedi);

elements.convertResult.textContent = valid
  ? formatCedis(amount / CONFIG.yuanPerCedi)
  : "—";

}
}

function updateAllEstimates() {
updateHomeEstimate();
updateConverter();
updateRateDisplays();
}

/* Change conversion direction */

function toggleDirection() {
direction = direction === "GHS" ? "CNY" : "GHS";

elements.defaultDirection.value = direction;
updateConverter();
savePreferences();
}

/* Connect the swap button to the direction function */

elements.swapCurrencies.addEventListener("click", toggleDirection);

/* Update estimates when the home amount changes */

elements.homeAmount.addEventListener("input", updateHomeEstimate);

/* Update the main converter when the amount changes */

elements.convertAmount.addEventListener("input", updateConverter);

/* Quick amount buttons */

quickAmountButtons.forEach(function (button) {
button.addEventListener("click", function () {
elements.convertAmount.value = button.dataset.amount;
updateConverter();
});
});

/* Clear converter */

elements.clearConverter.addEventListener("click", function () {
elements.convertAmount.value = "";
updateConverter();
elements.convertAmount.focus();
});

/* Dark mode */

/** @param {boolean} enabled */
function applyDarkMode(enabled) {
document.body.classList.toggle("dark-mode", enabled);
elements.darkModeSetting.checked = enabled;
savePreferences();
}

elements.themeToggle.addEventListener("click", function () {
applyDarkMode(!document.body.classList.contains("dark-mode"));
});

elements.darkModeSetting.addEventListener("change", function () {
applyDarkMode(elements.darkModeSetting.checked);
});

/* Settings */

elements.defaultDirection.addEventListener("change", function () {
direction = elements.defaultDirection.value;
updateConverter();
savePreferences();
});

elements.decimalPlaces.addEventListener("change", function () {
decimalCount = Number(elements.decimalPlaces.value);
updateAllEstimates();
savePreferences();
});

elements.resetSettings.addEventListener("click", function () {
const confirmed = window.confirm(
"Reset your CediYuan preferences to their defaults?"
);

if (!confirmed) {
return;
}

direction = DEFAULT_PREFERENCES.direction;
decimalCount = DEFAULT_PREFERENCES.decimals;

document.body.classList.toggle(
"dark-mode",
DEFAULT_PREFERENCES.darkMode
);

elements.darkModeSetting.checked = DEFAULT_PREFERENCES.darkMode;
elements.defaultDirection.value = direction;
elements.decimalPlaces.value = String(decimalCount);

updateAllEstimates();
savePreferences();

window.alert("Your preferences have been reset.");
});

/* WhatsApp enquiries */

function hasValidWhatsAppNumber() {
return /^\d{10,15}$/.test(CONFIG.whatsappNumber);
}

/** @param {string} message */
function openWhatsApp(message) {
if (!hasValidWhatsAppNumber()) {
window.alert(
"WhatsApp is not connected yet.\n\n" +
"In app.js, replace 233XXXXXXXXX with your real WhatsApp " +
"number, including the country code and without the + sign."
);
return;
}

const url =
"https://wa.me/" +
CONFIG.whatsappNumber +
"?text=" +
encodeURIComponent(message);

window.open(url, "_blank", "noopener,noreferrer");
}

function makeEnquiry() {
const rawAmount = elements.convertAmount.value;
const amount = Number(rawAmount);

if (
rawAmount.trim() === "" ||
!Number.isFinite(amount) ||
amount <= 0
) {
window.alert("Please enter an amount greater than zero.");
elements.convertAmount.focus();
return;
}

const result = direction === "GHS"
? amount * CONFIG.yuanPerCedi
: amount / CONFIG.yuanPerCedi;

const inputAmount = direction === "GHS"
? formatCedis(amount)
: formatYuan(amount);

const outputAmount = direction === "GHS"
? formatYuan(result)
: formatCedis(result);

const message = [
"Hello CediYuan, I would like to make an enquiry.",
"",
"Conversion direction: " +
(direction === "GHS" ? "GHS to CNY" : "CNY to GHS"),
"Amount entered: " + inputAmount,
"Illustrative estimate: " + outputAmount,
"Illustrative rate: " + getRateText(),
"",
"I understand this is an estimate only. Please confirm the current rate and terms."
].join("\n");

openWhatsApp(message);
}

elements.convertWhatsApp.addEventListener("click", makeEnquiry);

contactButtons.forEach(function (button) {
button.addEventListener("click", function () {
openWhatsApp(
"Hello CediYuan, I would like to enquire about your current rate and services."
);
});
});

/* Copy and share estimated result */

/** @param {string} text */
async function copyText(text) {
try {
if (navigator.clipboard && window.isSecureContext) {
await navigator.clipboard.writeText(text);
window.alert("Copied to clipboard.");
return;
}
} catch (error) {
console.warn("Clipboard access was unavailable.", error);
}

/*

* Manual fallback for previews or browsers
* that do not support modern clipboard access.
* This avoids the deprecated execCommand method.
  */
  window.prompt("Copy this estimate:", text);
  }

function getCurrentEstimateText() {
const rawAmount = elements.convertAmount.value;
const amount = Number(rawAmount);

if (
rawAmount.trim() === "" ||
!Number.isFinite(amount) ||
amount <= 0
) {
window.alert("Enter an amount greater than zero first.");
return null;
}

const result = direction === "GHS"
? amount * CONFIG.yuanPerCedi
: amount / CONFIG.yuanPerCedi;

const source = direction === "GHS"
? formatCedis(amount)
: formatYuan(amount);

const estimate = direction === "GHS"
? formatYuan(result)
: formatCedis(result);

return [
"CediYuan estimate",
source + " ≈ " + estimate,
"Illustrative rate: " + getRateText(),
"Estimate only; confirm the current rate and terms."
].join("\n");
}

function addUtilityButtons() {
const resultArea = document.querySelector(
"#convertScreen .result-area"
);

if (!resultArea) {
return;
}

const actions = document.createElement("div");
actions.className = "estimate-actions";

const copyButton = document.createElement("button");
copyButton.type = "button";
copyButton.className = "secondary-button";
copyButton.textContent = "Copy estimate";

copyButton.addEventListener("click", function () {
const text = getCurrentEstimateText();

if (text) {
  copyText(text);
}

});

const shareButton = document.createElement("button");
shareButton.type = "button";
shareButton.className = "secondary-button";
shareButton.textContent = "Share estimate";

shareButton.addEventListener("click", async function () {
const text = getCurrentEstimateText();

if (!text) {
  return;
}

if (navigator.share) {
  try {
    await navigator.share({
      title: "CediYuan estimate",
      text: text
    });
  } catch (error) {
    if (error.name !== "AbortError") {
      await copyText(text);
    }
  }
} else {
  await copyText(text);
}

});

actions.append(copyButton, shareButton);
resultArea.insertAdjacentElement("afterend", actions);
}

/* App information */

elements.appVersion.textContent = CONFIG.version;
elements.currentYear.textContent = new Date().getFullYear();

/* Initialise */

loadPreferences();
updateAllEstimates();
addUtilityButtons();
showScreen("home");

/* Register offline support on supported hosting */

if (
"serviceWorker" in navigator &&
(location.protocol === "https:" || location.hostname === "localhost")
) {
window.addEventListener("load", function () {
navigator.serviceWorker.register("./service-worker.js")
.catch(function (error) {
console.warn("Offline support could not be registered.", error);
});
});
}