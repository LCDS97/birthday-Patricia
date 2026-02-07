# 💛 Birthday Interactive Experience

A small, mobile-first interactive web experience built as a birthday gift.  
It uses **three progressive interactions** (no quizzes, no right/wrong answers) to unlock content step by step.

Designed to be:
- Simple to host (static files)
- Easy to tweak later
- Friendly for touch devices
- Emotion-driven, not logic-driven

---

## 📁 Project Structure

```
/birthday
  ├─ index.html   # Markup / structure
  ├─ style.css    # Visual styling
  └─ app.js       # All interaction logic
```

This is a **pure HTML + CSS + JavaScript** project.  
No frameworks, no build step.

---

## 🚀 How to Run

### Local
Open `index.html` in a browser.

### GitHub Pages
1. Push the repo to GitHub
2. Go to **Settings → Pages**
3. Source: `main` branch → `/root`
4. Save
5. Your site will be available at:

```
https://<your-username>.github.io/<repo-name>/
```

---

## 🧠 High-Level Flow

The experience is split into **3 steps**.  
Each step unlocks the next one:

```
Step 1 → Step 2 → Step 3 → Final message
```

No step requires typing or “knowing the right answer”.

---

## 🧩 Step 1 — Find the Heart

**Code location:** `app.js` → `STEP 1`

### What it does
- Defines an invisible hotspot inside the heart area.
- As the user touches/moves near it, the pulse becomes stronger.
- If the touch is close enough, Step 1 completes.

### Key settings
```js
const hotspot = { x: 0.72, y: 0.58 }; // position inside the heart field (0..1)
const HOT_RADIUS = 52;               // how close the touch must be (pixels)
```

### Success condition
```js
distance(touchPoint, hotspot) < HOT_RADIUS
```

### What unlocks
- Shows the first image + text
- Enables Step 2
- Updates UI badge

---

## 🧩 Step 2 — Join the Fragments (Cluster-Based)

**Code location:** `app.js` → `STEP 2 (CLUSTER MODE)`

### What it does
- Shows 3 draggable pieces (image fragments).
- User drags them freely.
- There are **no target spots**.
- When the 3 pieces are **close to each other**, it completes.

This is designed to match the simple behavior:
> “Bring the pieces together.”

### How it decides “close enough”
1. Compute the center point of each piece.
2. Compute distances between every pair.
3. Take the **maximum** distance.
4. If that maximum distance is below a threshold, it succeeds.

### Key setting
```js
const CLUSTER_DIST = pieceWidth * 0.85;
```

- Increase it to make Step 2 easier.
- Decrease it to make it harder.

Examples:
- `0.60` = tighter cluster required
- `0.85` = very forgiving on mobile (recommended)

### Success condition
```js
maxDistanceBetweenCenters <= CLUSTER_DIST
```

### What unlocks
- Shows the assembled image
- Hides the draggable pieces
- Enables Step 3
- Updates UI badge

---

## 🧩 Step 3 — Hold to Unlock (Time-Based)

**Code location:** `app.js` → `STEP 3`

### What it does
- User presses and holds a button.
- A progress bar fills over time.
- If the user releases early, it resets.
- If they hold long enough, it unlocks the final content.

### Key setting
```js
const HOLD_MS = 3200; // milliseconds required holding
```

### Success condition
```js
heldTime >= HOLD_MS
```

### What unlocks
- Shows final image + letter
- Updates UI badge
- Optional vibration feedback on mobile (if supported)

---

## ✏️ Customization Guide

### Change her name
In `app.js`:
```js
config.herName = "Maria";
```

### Replace photos
In `app.js`, set direct HTTPS image URLs:
```js
config.photo1 = "https://...";
config.photo2 = "https://...";
config.photo3 = "https://...";
```

Tip: Use stable links (GitHub raw, Imgur direct, Cloudinary, etc).  
Avoid links that require login or expire.

### Change captions and letter
In `app.js`:
```js
config.cap1 = "...";
config.cap2 = "...";
config.letterHTML = `...`;
```

---

## 🔧 Tuning & Troubleshooting

### Step 1 feels too hard
Increase `HOT_RADIUS`:
```js
const HOT_RADIUS = 70;
```

### Step 2 doesn’t unlock easily
Increase cluster threshold:
```js
const CLUSTER_DIST = pieceWidth * 0.95;
```

### Pieces look blank / image not showing in Step 2
Step 2 pieces use the same image as `photo2`.  
If `photo2` fails to load, fragments can look empty.

Check:
- `config.photo2` is a valid HTTPS direct image link
- the server allows hotlinking (some do not)

---

## ✅ Deployment Checklist

Before sending to her:
- [ ] Replace `config.photo1`, `config.photo2`, `config.photo3` with real image URLs
- [ ] Replace `config.herName`
- [ ] Update the final “present” text in `letterHTML`
- [ ] Test on your phone (touch + drag + hold)
- [ ] Publish on GitHub Pages and open the link on mobile

---

## 🔒 Notes

- No tracking, no backend, no data saved.
- Reloading the page resets progress.
- Works offline if images are also local.

---

## 💡 Future Ideas

- Add confetti on final unlock
- Add sound effects (soft clicks / sparkle)
- Use more fragments (5–9 pieces)
- Add a “replay” button at the end
