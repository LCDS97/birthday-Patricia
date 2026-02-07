# 💛 Birthday Interactive Experience

A small, mobile-first interactive web experience built as a birthday gift.  
It uses **three progressive interactions** (no quizzes, no right/wrong answers) to unlock content step by step.

Designed to be:
- Simple to host (static files)
- Easy to tweak later
- Friendly for touch devices
- Emotion-driven, not logic-driven

---

## 📌 Where to Continue / Photo Plan (IMPORTANT)

Before refining text or adding sound effects, this project should be completed in this order:

### ✅ Current focus
Finish all **visual behavior first** (animations, drag, unlock logic).  
Only after that:
- choose final photos
- write the final texts
- optionally add sound effects

---

## 📸 Photo Plan (What images are needed)

### Step 1 — Heart / Emotional Intro
- Photos needed: **1**
- Purpose: emotional setup, anticipation
- Type of image:
  - romantic / abstract
  - hands, light, silhouette, hug, sunset
  - does NOT need to be a photo of both of you
- Appears only after the heart is found

This image works as the emotional *prologue*.

---

### Step 2 — Fragments → Places → Us (MAIN CONCEPT)
- Photos needed: **4**
  - 3 photos of places visited together (ex: São Thomé das Letras, Arraial do Cabo, São Roque)
  - 1 large photo of you together (final reveal)

Concept:
Places come together → reveal **you two together**.

Technical note:
- Each draggable block uses a **different image** (places)
- The assembled view shows a **separate final photo**
- Unlock is based on **proximity**, not perfect placement

---

### Step 3 — Final Hold + Letter
- Photos needed: **1**
- Purpose: calm closure + support the final text
- Type:
  - you together
  - soft light, minimal background

---

### ✅ Total photos required
| Step | Photos |
|-----|--------|
| Step 1 | 1 |
| Step 2 | 4 |
| Step 3 | 1 |
| **Total** | **6** |

---

## 📁 Project Structure

/birthday  
├─ index.html   (markup)  
├─ style.css    (visual styling)  
└─ app.js       (interaction logic)

No frameworks. No build step.

---

## 🚀 How to Run

### Local
Open index.html in a browser.

### GitHub Pages
1. Push repo to GitHub  
2. Settings → Pages  
3. Source: main / root  
4. Save  

URL:
https://<your-username>.github.io/<repo-name>/

---

## 🧠 High-Level Flow

Step 1 → Step 2 → Step 3 → Final

No typing. No right/wrong answers.

---

## 🧩 Step 1 — Find the Heart
Location: app.js → STEP 1

- Invisible hotspot
- Pulse grows when close
- Unlocks when touch distance < HOT_RADIUS

---

## 🧩 Step 2 — Join the Fragments (Cluster-Based)
Location: app.js → STEP 2

- Drag 3 blocks freely
- No targets
- Unlocks when all blocks are close together

Key setting:
CLUSTER_DIST = pieceWidth * 0.85

---

## 🧩 Step 3 — Hold to Unlock
Location: app.js → STEP 3

- Press & hold
- Progress bar fills
- Unlock after HOLD_MS

---

## ✏️ Customization

- Name: config.herName
- Photos: config.photo1 / photo2 / photo3
- Texts: config.cap1 / cap2 / letterHTML

---

## 🔧 Notes

- Reload resets progress
- Works offline if images are local
- Mobile-first design

---

## 💡 Future Ideas

- Sound effects
- Confetti animation
- More fragments
- Replay option
