Markdown# 🤖 AI Customer Support Agent (MERN + Gemini)

A smart customer support simulation that uses **Retrieval-Augmented Generation (RAG)** to answer FAQs and **Intelligent Escalation** to hand off angry users or unknown queries to human agents.

Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and powered by **Google Gemini 2.0 Flash**.

![Status](https://img.shields.io/badge/Status-Complete-green)
![Stack](https://img.shields.io/badge/Stack-MERN-blue)
![AI](https://img.shields.io/badge/AI-Google_Gemini-orange)

## ✨ Key Features

* **🧠 Contextual RAG:** Retrieves answers dynamically from a MongoDB Knowledge Base.
* **💾 Session Memory:** Remembers user details (e.g., names) throughout the conversation.
* **🚨 Auto-Escalation:** Detects **anger/aggression** or **unknown topics** and triggers an escalation workflow.
* **🎨 Dynamic UI:** The interface changes state (Blue → Red) and locks input when escalation occurs.
* **⚡ High Performance:** Uses `gemini-2.0-flash` for near-instant responses.

---

## 🏗️ Architecture

1.  **Frontend (React):** Handles user input and visualizes the "Escalation State."
2.  **Backend (Express):** Orchestrates the data flow.
3.  **Database (MongoDB):**
    * `faqs`: Stores knowledge (RAG).
    * `sessions`: Stores chat history (Context).
4.  **AI Engine (LangChain + Gemini):** Decides whether to Answer or Escalate based on the System Prompt.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB (Local or Atlas)
* Google AI Studio API Key (Free)

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/support-bot.git](https://github.com/your-username/support-bot.git)
cd support-bot
2. Backend SetupNavigate to the backend folder and install dependencies:Bashcd backend
npm install
Configure Environment:Create a .env file in the backend/ folder:Code snippetPORT=5000
MONGO_URI=mongodb://localhost:27017/support_bot
GOOGLE_API_KEY=your_google_gemini_api_key_here
Seed the Database:Populate the MongoDB with sample FAQs:Bashnode seed.js
Start the Server:Bashnode server.js
(Server will run on http://localhost:5000)3. Frontend SetupOpen a new terminal, navigate to the frontend folder:Bashcd frontend
npm install
Start the React App:Bashnpm start
(App will open at http://localhost:3000)🧠 The AI Logic (System Prompt)The core intelligence resides in backend/src/services/aiService.js. We use a strict system prompt to enforce business rules.The Logic Flow:Check Context: Is the answer in the FAQs? -> Answer.Check Memory: Is it small talk ("Hi", "My name is...")? -> Chat.Check Sentiment: Is the user angry? -> Escalate.Check Knowledge Gap: Is the answer missing? -> Escalate.The Prompt:PlaintextYou are a Customer Support Bot for "TechCorp".

INSTRUCTIONS:
1. Primary Source: Always check the CONTEXT first. If the answer is there, output it.
2. Small Talk/Memory: If the user says "Hi", tells you their name, use CHAT HISTORY to answer politely.
3. Gibberish: If user types "dfdfd", ask to rephrase. DO NOT ESCALATE.
4. Unknown Info: If the user asks a technical question NOT in CONTEXT, return "escalate": true.
5. Aggression: If the user is angry, return "escalate": true.

RESPONSE FORMAT (JSON):
{
  "answer": "Text response...",
  "escalate": boolean,
  "reason": "Why escalated..."
}
🧪 Testing Scenarios (Evaluation)Use these inputs to verify the bot's logic:ScenarioInput MessageExpected ResultLogicHappy Path"How do I reset my password?"Success (Blue)Found in FAQ Database.Memory"My name is John" -> "Who am I?"Success (Blue)Retrieved from Session History.Escalation A"How do I cook a pizza?"Escalation (Red)Topic not in Knowledge Base.Escalation B"This service is garbage! I hate you!"Escalation (Red)Sentiment Analysis (Anger).Gibberish"sfdkjfh"Clarification (Blue)Filters out typos.📡 API ReferenceEndpoint: POST /api/chatRequest Body:JSON{
  "sessionId": "user_123",
  "message": "What are your hours?"
}
Response:JSON{
  "answer": "9 AM to 5 PM EST.",
  "escalate": false,
  "reason": null
}
🛠️ Tech StackFrontend: React, Tailwind CSS, AxiosBackend: Node.js, Express.jsDatabase: MongoDB, MongooseAI: LangChain.js, Google Gemini API