🗄️ Database Overview (How It Works)

This project uses MongoDB Atlas to store all user data, debate sessions, messages, and scoring information. The database is designed to behave similarly to ChatGPT conversation storage, where every debate and every message is saved in order and can be retrieved later.

Below is a complete explanation of how database works

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

------------------------------------------------------------------------------------------------------

📁 Database Structure (Human-Readable Summary Tables)

⸻

👤 Users Table

Represents each human user in the system.

Field	  	  Description					              Example
_id			    Unique ObjectId for the user	    693997cee5c9ae27a4b11016
name		    User’s display name			          Shreyas
email		    User’s email (unique)			        shreyas@example.com
createdAt	  Account creation time			        2025-12-10T12:03:00Z


⸻

🧵 Topics Table

Predefined topics the user can choose for debate.

Field		      Description					        Example
_id			      Topic ID						        6939975ab420ca7c7150a9f0
name		      Name of the topic				    AI & Society
category	    Topic category				      Technology
createdAt	    When the topic was added		2025-11-11T11:43:19Z


⸻

🎤 Debates Table

Each debate session between the user and the AI agents.

Field			            Description						                    Example
_id				            Debate ID						                      6939a233d5d3973ea8a309fa
topic			            Reference to topic ID				              6939975ab420ca7c7150a9f0
participants		      Array containing user + AI agents	        See table below
status			          Active / finished					                active
lastUpdated		        Timestamp of latest message		            2025-12-10T16:40:07Z

Participants (Embedded in Debate)

Field								  Description								           Example
user								  User ID (null if AI)			  				"693997cee5c9ae27a4b11016"
stance								Pro / Con / Neutral							    "pro", "con"
role									"user", "ai1", "ai2"							  "ai1"
isAi	                Whether participant is AI			      true
aiName	              (Optional) Name of AI model	        "Gemini-B"


⸻

💬 Messages Table

Stores every message from the user, AI1, and AI2.

This is the heart of conversation history — similar to ChatGPT.

Field						    Description					        Example
_id							    Message ID					        6939a0a4d5d3973ea8a309f2
debate						  Debate ID					          6939a233d5d3973ea8a309fa
senderType					"user", "ai1", "ai2"				"ai2"
senderUser					User ID if sent by user			"693997cee5c9ae27a4b11016"
text							  The message content			    "AI regulation is important..."
roundNumber				  Debate round number			    1
createdAt					  Timestamp					          2025-12-10T16:40:07Z
metadata					  Optional analytics data		  {...}

(Messages are always stored sequentially, allowing complete reconstruction of the debate.)

⸻


//In future if we add scores then scores table is also there


🏆 Scores Table

Stores 90-second structured scoring per debate.

Field					Description				          Example
_id						Score ID					          6939b122e5d3973ea8a30aaa
debate				Debate ID being scored	    6939a233d5d3973ea8a309fa
user					User who participated		    693997cee5c9ae27a4b11016
relevance			0–35					              28
strength			0–40					              32
engagement		0–25					              21
total					Sum of all scores			      81
createdAt			Timestamp				            2025-12-10T17:00:00Z


⸻

🔗 How These Collections Work Together

Here’s a readable relationship map:

User ────────────┐
                  │
                  ▼
           Debates ────────────► Messages (chronological chat log)
                  │
                  ▼
               Scores
                  ▲
Topic ────────────┘

In plain words:
	•	A User picks a Topic → starts a Debate
	•	The debate contains user + 2 AI participants
	•	All messages are stored in Messages
	•	After debate ends → a Score is generated and saved
	•	User history uses /users/:id/debates to retrieve past debates

------------------------------------------------------------------------------------------------------

MONGO DB ATLAS IS USED 
MONGO_URI=mongodb+srv://shreyas:shreyas@ai-debator.dd2xhiy.mongodb.net/ai-debator   //this is the mongo db url where everything is being stored it is mentioned in env file 


------------------------------------------------------------------------------------------------------




