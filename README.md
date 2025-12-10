🗄️ Database Overview (How It Works)

This project uses MongoDB Atlas to store all user data, debate sessions, messages, and scoring information. The database is designed to behave similarly to ChatGPT conversation storage, where every debate and every message is saved in order and can be retrieved later.

Below is a complete explanation of how your database works, without any code.

⸻

👤 1. Users
• Every human participant is stored as a User.
• Users have a name and email.
• A user can participate in multiple debates over time.
• You can fetch all debates for any user using:
GET /api/users/:id/debates

This works like a “conversation history” page, showing all past debates the user participated in.

⸻

📝 2. Topics
• Topics are stored once in the database (seeded).
• Each debate references a topic.
• Examples: AI & Society, Climate Policy, UBI, etc.

These are shown in the UI when selecting a debate subject.

⸻

🎤 3. Debates

A Debate record represents a full debate session.
Each debate stores:
• The selected topic
• The human participant
• The AI participants (ai1, ai2)
• Their stance (pro / con / neutral)
• Debate status (active/finished)
• A timestamp indicating the most recent message

Debates basically act like conversation containers.

⸻

💬 4. Messages (Chat History)

This is the most important part of your system.

Every single message in the debate—whether from the user or either AI agent—is saved sequentially.

Each message stores:
• Who sent it (user, ai1, or ai2)
• The debate it belongs to
• The text of the message
• Which round it occurred in
• The exact time it was created
• Optional metadata for analytics

When you want to load a conversation, you simply request:

GET /api/debates/:id/messages

and you get the entire chat in order.

This is exactly how ChatGPT loads past conversations.

⸻

🤖 Multi-AI Support

Each debate can have:
• 1 human
• AI agent 1 (role: ai1)
• AI agent 2 (role: ai2)

Messages are tagged so you can clearly see:
• Who spoke
• In what order
• In which round

The backend automatically generates AI replies after the user speaks.

⸻

📊 5. Scoring System

After the debate ends, the system generates a score entry that evaluates:
• Relevance
• Strength
• Engagement
• Total score

This score is saved in the database so it can be shown later in:
• Summary page
• Leaderboard
• Performance analytics

You can generate a score using:

POST /api/debates/:id/score
In simple terms:
• A User chooses a Topic and starts a Debate.
• The debate creates a chat container.
• All messages from the User, AI1, and AI2 go into the message log.
• After the debate, a score is generated and stored.
