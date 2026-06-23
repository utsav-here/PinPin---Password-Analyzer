# 🐱 PinPin — Password Strength Analyzer

> A neon-pink, cyber-cat themed password analyzer with real-time strength detection, weakness callouts, and strong password generation.

---

## 🚀 Getting Started

No build tools, no npm install, no dependencies.

```bash
# Just open the file in your browser
open index.html

# Or use VS Code Live Server (recommended)
# Right-click index.html → "Open with Live Server"
```

---

## 📁 Project Structure

```
pinpin/
├── index.html   ← Main HTML structure
├── style.css    ← All styles (neon pink theme, responsive)
├── app.js       ← Password analysis logic + generator
└── README.md    ← This file
```

---

## ✨ Features

| Feature | Details |
|---|---|
| Real-time analysis | Strength meter updates as you type |
| 6 requirement checks | Length, uppercase, lowercase, numbers, symbols, dictionary |
| Weakness detection | 10+ specific issue callouts |
| Entropy display | Bits of entropy, character pool size |
| Crack time estimate | Based on 10B guesses/sec (GPU cluster) |
| Password generator | Cryptographically random via `crypto.getRandomValues()` |
| One-click copy | Copy any generated password instantly |
| Show/hide toggle | Eye button to reveal password |
| Responsive | Works on mobile and desktop |

---

## 🔐 How Strength Is Scored

| Criterion | Points |
|---|---|
| 8+ characters | +1 |
| 12+ characters | +1 |
| 16+ characters | +1 |
| 20+ characters | +1 |
| Has uppercase | +1 |
| Has lowercase | +1 |
| Has numbers | +1 |
| Has symbols | +1 |
| Not a common word | +1 |
| No repeated characters | +1 |

**Score → Label:**
- 0–20% → Very Weak
- 20–40% → Weak
- 40–60% → Fair
- 60–80% → Strong
- 80–100% → Very Strong

---

## 🧮 Entropy Formula

```
entropy (bits) = length × log₂(character_pool_size)
```

Pool sizes:
- Lowercase only: 26
- + Uppercase: 52
- + Numbers: 62
- + Symbols: 94

---

## 🎨 Customization

All colors are CSS custom properties at the top of `style.css`:

```css
:root {
  --pink:       #ff2d78;   /* main accent */
  --pink-light: #ff6fa8;   /* lighter pink */
  --pink-dark:  #c4005a;   /* hover states */
  --bg:         #0f0810;   /* page background */
  --surface:    #1c0e18;   /* card background */
}
```

---

## 🛠️ VS Code Tips

- Install **Live Server** extension for hot reload
- Install **Prettier** for auto-formatting
- The project uses zero external dependencies — pure HTML/CSS/JS

---
