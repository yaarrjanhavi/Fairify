# Fairify

Fairify is a tiny, cozy, game‑styled web app for tracking personal expenses and (eventually) splitting shared costs with friends. It’s designed to be simple, cute, and actually useful rather than bloated, inspired by small web‑based expense trackers and local‑storage tools.[web:80][web:83]

---

## Features

### My Wallet

- Add expenses with **amount**, **note**, and **category** (Food, Rent, Travel, Other).  
- Each expense is timestamped so summaries can be calculated per month.  
- See a running **“Total spent”** for the currently viewed month.  
- View **category cards** that show how much you spent in each category, each with its own soft color.  
- Delete individual expenses with a small “×” button.  
- All wallet data is saved in the browser using local storage so it persists across refreshes and sessions.[web:83][web:96]  

### Summary & Overview

- **Summary** section with four cards: Food, Rent, Travel, Other, each displaying the total spent in that category.  
- **Overview** panel with:
  - Number of expense entries for the current month.  
  - Average expense amount.  
  - A small SVG **pie chart** that visualizes spending share across the four categories, using the same colors as the cards.[web:86][web:98]  

### Groups (v1)

- Create named **groups** (e.g., “Goa trip”) to organize shared expenses.  
- Group list is stored in local storage so your groups remain after closing the tab.  
- Each group row shows its name and a placeholder label like “0 expenses” ready for future group‑expense features, similar to simple bill‑splitting tools.[web:88][web:94]  

### Indie / Pixel UI

- Retro **window frame** with a wooden outer border and soft inner panel, mimicking cozy browser‑game UIs.  
- Chunky, game‑style buttons and tab bar (“My Wallet” / “Groups”).  
- Support for small pixel icons (wallet, groups, coins) via PNGs under an `assets/` folder with `image-rendering: pixelated` styling for crisp pixels.

---

## Tech Stack

- **HTML** – single static page (`index.html`)  
- **CSS** – custom styling for the retro frame, tabs, cards, and pie chart (`style.css`)  
- **Vanilla JavaScript** – expense logic, local‑storage persistence, summary calculations, and SVG pie chart rendering (`app.js`)[web:80][web:83][web:96]  

No frameworks or build tools are required; everything runs directly in the browser.

---

## Running Locally

1. Clone or download this repository.  
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox).  
3. Start adding expenses in **My Wallet** or creating groups on the **Groups** tab.  

Everything is stored locally in your browser; clearing site data will reset Fairify.[web:83][web:96]

---

## Roadmap / Ideas

- Add **per‑group expenses** (payer, participants, amounts) and a simple “who owes whom” summary inspired by common bill‑splitting apps.[web:88][web:99]  
- Support multiple currencies (₹, $, €, etc.).  
- Optional dark / night mode that keeps the indie aesthetic.  
- Export / import expenses as JSON or CSV for backup or analysis elsewhere.[web:90][web:96]
