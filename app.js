// ── PinPin — app.js ─────────────────────────────────────

// ── Common passwords list ────────────────────────────────
const COMMON_PASSWORDS = [
  "password","123456","12345678","qwerty","abc123","monkey","1234567",
  "letmein","trustno1","dragon","baseball","iloveyou","master","sunshine",
  "ashley","bailey","passw0rd","shadow","123123","654321","superman",
  "qazwsx","michael","football","password1","p@ssword","welcome","login",
  "admin","hello","charlie","donald","password2","qwerty123","123456789",
  "princess","rockyou","nicole","daniel","babygirl","monkey1","jessica",
  "lovely","michael1","654321","abc","pass","test","guest","root",
  "toor","user","demo","sample","changeme","default","secret","access",
];

// ── Character sets ───────────────────────────────────────
const CHARS = {
  lower:  "abcdefghijklmnopqrstuvwxyz",
  upper:  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  syms:   "!@#$%^&*()-_=+[]{}|;:,.<>?~"
};

// ── DOM refs ─────────────────────────────────────────────
const pwInput        = document.getElementById("pw-input");
const eyeBtn         = document.getElementById("eye-btn");
const eyeIcon        = document.getElementById("eye-icon");
const meterFill      = document.getElementById("meter-fill");
const strengthLabel  = document.getElementById("strength-label");
const crackTimeEl    = document.getElementById("crack-time");
const crackValEl     = document.getElementById("crack-val");
const weakSection    = document.getElementById("weaknesses-section");
const weakList       = document.getElementById("weakness-list");
const entropyRow     = document.getElementById("entropy-row");
const entropyVal     = document.getElementById("entropy-val");
const lenVal         = document.getElementById("len-val");
const poolVal        = document.getElementById("pool-val");
const genBtn         = document.getElementById("gen-btn");
const suggestionsEl  = document.getElementById("suggestions");

// check items
const checks = {
  len:   document.getElementById("chk-len"),
  upper: document.getElementById("chk-upper"),
  lower: document.getElementById("chk-lower"),
  digit: document.getElementById("chk-digit"),
  sym:   document.getElementById("chk-sym"),
  dict:  document.getElementById("chk-dict"),
};
const icons = {
  len:   document.getElementById("ico-len"),
  upper: document.getElementById("ico-upper"),
  lower: document.getElementById("ico-lower"),
  digit: document.getElementById("ico-digit"),
  sym:   document.getElementById("ico-sym"),
  dict:  document.getElementById("ico-dict"),
};

// ── Show / hide password ─────────────────────────────────
let passwordVisible = false;
eyeBtn.addEventListener("click", () => {
  passwordVisible = !passwordVisible;
  pwInput.type = passwordVisible ? "text" : "password";
  eyeIcon.innerHTML = passwordVisible
    ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`
    : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
});

// ── Entropy calculation ──────────────────────────────────
function calcEntropy(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
  return { bits: Math.round(pw.length * Math.log2(pool || 1)), pool };
}

// ── Crack time estimate ──────────────────────────────────
// Assumes ~10 billion guesses/sec (modern GPU cluster)
function crackTime(entropyBits) {
  const guesses = Math.pow(2, entropyBits);
  const rate    = 1e10; // 10B/s
  const secs    = guesses / rate;

  if (secs < 0.001)       return "instant";
  if (secs < 1)           return "< 1 second";
  if (secs < 60)          return `${Math.round(secs)} seconds`;
  if (secs < 3600)        return `${Math.round(secs / 60)} minutes`;
  if (secs < 86400)       return `${Math.round(secs / 3600)} hours`;
  if (secs < 31536000)    return `${Math.round(secs / 86400)} days`;
  if (secs < 3.15e9)      return `${Math.round(secs / 31536000)} years`;
  if (secs < 3.15e12)     return `${Math.round(secs / 3.15e9)} thousand years`;
  if (secs < 3.15e15)     return `${Math.round(secs / 3.15e12)} million years`;
  return `${Math.round(secs / 3.15e15)} billion years`;
}

// ── Set check item state ─────────────────────────────────
function setCheck(key, passed) {
  const el   = checks[key];
  const icon = icons[key];
  if (passed) {
    el.classList.add("pass");
    icon.textContent = "✓";
  } else {
    el.classList.remove("pass");
    icon.textContent = "○";
  }
}

// ── Analyze password ─────────────────────────────────────
function analyze() {
  const pw = pwInput.value;

  // reset if empty
  if (!pw) {
    meterFill.style.width = "0%";
    meterFill.style.background = "transparent";
    strengthLabel.textContent = "Enter a password to analyze";
    strengthLabel.style.color = "";
    crackTimeEl.style.display = "none";
    weakSection.style.display = "none";
    entropyRow.style.display = "none";
    Object.keys(checks).forEach(k => setCheck(k, false));
    return;
  }

  // ── checks
  const hasLen    = pw.length >= 8;
  const hasUpper  = /[A-Z]/.test(pw);
  const hasLower  = /[a-z]/.test(pw);
  const hasDigit  = /[0-9]/.test(pw);
  const hasSym    = /[^a-zA-Z0-9]/.test(pw);
  const isCommon  = COMMON_PASSWORDS.some(c => pw.toLowerCase().includes(c));
  const notDict   = !isCommon;

  setCheck("len",   hasLen);
  setCheck("upper", hasUpper);
  setCheck("lower", hasLower);
  setCheck("digit", hasDigit);
  setCheck("sym",   hasSym);
  setCheck("dict",  notDict);

  // ── score (0–10)
  let score = 0;
  if (hasLen)          score += 1;
  if (pw.length >= 12) score += 1;
  if (pw.length >= 16) score += 1;
  if (pw.length >= 20) score += 1;
  if (hasUpper)        score += 1;
  if (hasLower)        score += 1;
  if (hasDigit)        score += 1;
  if (hasSym)          score += 1;
  if (notDict)         score += 1;
  if (!/(.)\1{2,}/.test(pw)) score += 1; // no repeated chars

  const pct = Math.round((score / 10) * 100);
  meterFill.style.width = `${pct}%`;

  // ── label + color
  let label, color;
  if (pct < 20)       { label = "Very weak";    color = "#e24b4a"; }
  else if (pct < 40)  { label = "Weak";         color = "#ef9f27"; }
  else if (pct < 60)  { label = "Fair";         color = "#ff6fa8"; }
  else if (pct < 80)  { label = "Strong";       color = "#1d9e75"; }
  else                { label = "Very strong";  color = "#5dcaa5"; }

  meterFill.style.background = color;
  strengthLabel.textContent  = label;
  strengthLabel.style.color  = color;

  // ── crack time
  const { bits, pool } = calcEntropy(pw);
  crackTimeEl.style.display = "flex";
  crackValEl.textContent    = crackTime(bits);

  // ── entropy stats
  entropyRow.style.display = "flex";
  entropyVal.textContent   = `${bits} bits`;
  lenVal.textContent       = `${pw.length} chars`;
  poolVal.textContent      = `${pool} chars`;

  // ── weaknesses
  const issues = [];

  if (!hasLen)
    issues.push("Too short — aim for at least 12 characters");
  if (pw.length < 12 && hasLen)
    issues.push("Good length, but 12+ characters is even safer");
  if (!hasUpper)
    issues.push("Add uppercase letters (A–Z) to increase complexity");
  if (!hasLower)
    issues.push("Add lowercase letters (a–z) to increase complexity");
  if (!hasDigit)
    issues.push("Include numbers (0–9) for more variety");
  if (!hasSym)
    issues.push("Use special characters like !@#$% for maximum strength");
  if (isCommon)
    issues.push("Contains a common word or pattern — avoid dictionary words");
  if (/(.)\1{2,}/.test(pw))
    issues.push("Repeated characters detected (e.g. 'aaa') — avoid repetition");
  if (/^[a-zA-Z]+$/.test(pw))
    issues.push("Letters only — mix in numbers and symbols");
  if (/^[0-9]+$/.test(pw))
    issues.push("Numbers only — this is very easy to brute force");
  if (/^(.+)\1+$/.test(pw))
    issues.push("Repeated pattern detected — avoid using the same sequence twice");
  if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def)/i.test(pw))
    issues.push("Sequential characters detected (e.g. 123, abc) — avoid sequences");

  if (issues.length > 0) {
    weakSection.style.display = "block";
    weakList.innerHTML = issues
      .map(msg => `<div class="weakness-pill">${msg}</div>`)
      .join("");
  } else {
    weakSection.style.display = "none";
  }
}

pwInput.addEventListener("input", analyze);

// ── Password generator ───────────────────────────────────
function randChar(set) {
  // Use crypto.getRandomValues for real randomness
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return set[arr[0] % set.length];
}

function generatePassword(length) {
  const all = CHARS.lower + CHARS.upper + CHARS.digits + CHARS.syms;

  // Guarantee at least one of each type
  let pw = [
    randChar(CHARS.lower),
    randChar(CHARS.upper),
    randChar(CHARS.digits),
    randChar(CHARS.syms),
  ];

  for (let i = 4; i < length; i++) {
    pw.push(randChar(all));
  }

  // Fisher-Yates shuffle
  for (let i = pw.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [pw[i], pw[j]] = [pw[j], pw[i]];
  }

  return pw.join("");
}

// ── Copy to clipboard ────────────────────────────────────
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.textContent = "✓ Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 1800);
  }).catch(() => {
    // Fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    btn.textContent = "✓ Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 1800);
  });
}

// ── Generate button ──────────────────────────────────────
genBtn.addEventListener("click", () => {
  const configs = [
    { len: 14, label: "14 chars" },
    { len: 18, label: "18 chars" },
    { len: 24, label: "24 chars" },
  ];

  suggestionsEl.innerHTML = configs.map((cfg, i) => {
    const pw      = generatePassword(cfg.len);
    const { bits } = calcEntropy(pw);
    return `
      <div class="suggestion-row">
        <span class="suggestion-pw" id="spw-${i}">${pw}</span>
        <span class="entropy-tag">${bits}b</span>
        <button
          class="copy-btn"
          onclick="copyToClipboard(document.getElementById('spw-${i}').textContent, this)"
        >Copy</button>
      </div>
    `;
  }).join("");
});

// ── Keyboard shortcut: Enter to generate ────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement !== pwInput) {
    genBtn.click();
  }
});