🧠 MemEnglish Upselling Strategy — Tutor Integration

🎯 Goal

Use engagement in the MemEnglish app (video-based speaking/writing tasks) to unlock AI tutor interactions and upsell students into a paid experience.

⸻

🪜 Funnel Structure

1. Free Tier Behavior
	•	Users complete up to 3 video description tasks (speaking or writing)
	•	AI generates per-task feedback (vocab, grammar, fluency)
	•	Feedback is stored in Neon DB with user_id

2. Unlock Event
	•	After completing 3 tasks:
	•	Prompt: “🎁 You’ve unlocked a free AI tutor session!”
	•	Student is redirected to AI Tutor with personalized session
	•	Tutor reads memory from Neon and injects a summary into the prompt:
“You’ve described 3 videos. Common issues: overusing ‘good’, missing articles, weak transitions. Let’s work on these today.”

3. Upsell Path
	•	After the free session, prompt user:
	•	“To continue receiving personalized feedback, upgrade for just €5/month.”
	•	“Unlock more tutor sessions, progress tracking, and extra practice.”

⸻

💳 Monetization Options

Tier	Price	Features
Free	€0	3 video tasks + 1 AI tutor session
Lite	€5/mo	8–10 tasks/mo + 1 weekly tutor session
Pro	€12–15/mo	Unlimited tasks, tutor sessions, Use of English drills


⸻

🧱 Technical Dependencies
	•	Auth: Shared across MemEnglish + Tutor (Clerk.dev recommended)
	•	Storage: Video task data + feedback stored in Neon (user_id, video_id, student_output, ai_feedback)
	•	Memory layer: AI tutor reads from Neon based on user ID to generate context-aware prompts

⸻

🧠 Why It Works
	•	Rewards create habit loops (3 tasks → tutor)
	•	Tutor session feels personalized via memory
	•	Framing upgrade as a reward → reduces friction
	•	€5 is a low-commitment threshold for continued value

⸻

✅ Next Steps
	•	Hook Neon memory to AI tutor prompt layer
	•	Add unlock condition (3 videos)
	•	Build “You’ve unlocked a tutor session!” pop-up
	•	Build soft paywall after session
	•	Track conversion metrics