💛 Birthday Interactive Experience

A small, mobile-first interactive web experience built as a birthday gift.
It uses three progressive interactions (no quizzes, no right/wrong answers) to unlock content step by step.

Designed to be:

Simple to host (static files)

Easy to tweak later

Friendly for touch devices

Emotion-driven, not logic-driven

📁 Project Structure
/birthday
  ├─ index.html   # Markup / structure
  ├─ style.css    # Visual styling
  └─ app.js       # All interaction logic


This is a pure HTML + CSS + JavaScript project.
No frameworks, no build step.

🚀 How to Run
Local

Just open index.html in a browser.

GitHub Pages

Push this repo to GitHub

Go to Settings → Pages

Source: main branch → /root

Save

Access via:

https://<your-username>.github.io/<repo-name>/

🧠 High-Level Flow

The experience is split into 3 steps.
Each step unlocks the next one.

Step 1 → Step 2 → Step 3 → Final message


No step requires typing or “knowing the right answer”.

🧩 STEP 1 — Find the Heart

Location: app.js → STEP 1

What it does

Defines an invisible hotspot inside the heart area

As the user touches/moves near it:

A pulse animation becomes stronger

When the touch is close enough, Step 1 is completed

Core logic
const hotspot = { x: 0.72, y: 0.58 }; // % of container
const HOT_RADIUS = 52;               // px

Completion condition
distance(touchPoint, hotspot) < HOT_RADIUS

What unlocks

Reveals first photo + text

Enables Step 2

Updates UI badges

🧩 STEP 2 — Join the Fragments (Cluster-Based)

Location: app.js → STEP 2 (CLUSTER MODE)

What it does

Displays 3 draggable blocks (image fragments)

User can drag them freely

No target positions

When all 3 blocks are close to each other, the step completes

Why cluster-based

This avoids:

Precision placement

Invisible targets

Frustration on mobile

It matches the mental model:

“Bring them together.”

Core logic

Calculate the center of each block

Measure the distance between every pair

Take the maximum distance

If that distance is below a threshold → success

const CLUSTER_DIST = pieceWidth * 0.85;


Increase this value to make it easier
Decrease it to require tighter grouping

Completion condition
maxDistanceBetweenCenters <= CLUSTER_DIST

What unlocks

Shows full assembled image

Hides draggable pieces

Enables Step 3

🧩 STEP 3 — Hold to Unlock (Time-Based)

Location: app.js → STEP 3

What it does

User presses and holds a button

A progress bar fills over time

Releasing early cancels the action

Core logic
const HOLD_MS = 3200; // milliseconds


Progress is calculated with requestAnimationFrame for smoothness.

Completion condition
heldTime >= HOLD_MS

What unlocks

Final photo

Letter / message

Optional vibration feedback (mobile)

✏️ Customization Guide
Change name
config.herName = "Maria";

Replace photos
config.photo1 = "https://...";
config.photo2 = "https://...";
config.photo3 = "https://...";

Change texts
config.cap1
config.cap2
config.letterHTML

Make Step 2 easier / harder
const CLUSTER_DIST = pieceWidth * 0.85;


0.60 → tighter

0.85 → very forgiving (recommended for mobile)

Move the heart hotspot (Step 1)
const hotspot = { x: 0.72, y: 0.58 };


Values are percentages of the container (0–1).

🧪 Debugging Tips

Open DevTools → Console

Drag pieces slowly to see behavior

Resize screen to test responsiveness

Test on real mobile device (important for touch behavior)

🔒 Notes / Constraints

Mobile-first (touch events prioritized)

No external libraries

Works offline

No data persistence (reload resets progress)

💡 Future Ideas

Confetti animation on final unlock

Sound feedback on interactions

More fragments in Step 2

Multiple “chapters” instead of linear steps

🖤 Why This Exists

This project was built to:

Feel personal, not gamified

Avoid “right/wrong” mechanics

Be easy to evolve over time

Blend emotion + interaction without overengineering