 🧠 AI Agent System (Multi-Tool + Convex + Memory + Streaming)

 🚀 Live Demo

🔗 https://ai-agent-chat-lilac.vercel.app

A fully deployed real-time AI agent system that dynamically selects tools, uses persistent memory, and streams responses while answering user queries using external APIs.

---

 ✨ Overview

This project is a full-stack **AI agent system** built using **LangChain, TypeScript, Convex, and multiple external APIs**.

Unlike a basic chatbot, this system:
- Uses **tool-based reasoning**
- Maintains **persistent memory (Convex)**
- Streams responses in real-time
- Dynamically decides which tool to use based on user intent

It behaves like a lightweight AI agent architecture inspired by production-grade systems.

---

 🧠 Architecture

User Input  
↓  
Next.js Chat UI (Streaming Interface)  
↓  
Convex (Memory + Real-time Database)  
↓  
LangChain AI Agent (Brain)  
↓  
Tool Router (Decision Layer)  
↓  
├── 🎥 YouTube Transcript Tool  
├── 📚 Google Books Tool  
├── 📖 Wikipedia Tool  
├── 🌐 Tavily Search Tool  
├── 🔗 Curl/API Fetch Tool  
↓  
⚡ Streaming Response Engine  
↓  
Convex (stores final response + chat history)  
↓  
UI updates instantly

---

 ⚡ Features

- 🎥 YouTube transcript extraction & summarization  
- 📚 Google Books search (authors, summaries, details)  
- 📖 Wikipedia knowledge retrieval  
- 🌐 Tavily real-time web search  
- 🔗 Safe API / URL data fetching  
- ⚡ Convex backend for real-time state management  
- 🧠 Persistent AI memory (chat history stored in Convex)  
- 💬 Streaming AI responses for real-time UX  
- 🧠 Dynamic tool selection by AI agent  
- 💬 Chat-based interactive interface  

---

 🧰 Tech Stack

- Next.js  
- TypeScript  
- LangChain  
- Convex (real-time backend + memory)  
- Tavily API  
- Google Books API  
- YouTube Transcript API  

---

 🧰 Tools Breakdown

 🎥 YouTube Tool
Extracts transcripts from YouTube videos and enables summarization and Q&A.

 📚 Google Books Tool
Fetches book details including title, author, publication date, and description.

 📖 Wikipedia Tool
Retrieves concise encyclopedic summaries of topics, people, and concepts.

 🌐 Tavily Search Tool
Provides real-time web search results for up-to-date information.

 🔗 Curl Tool
Fetches and parses JSON/text data from public APIs safely.

 ⚡ Convex Backend
Handles:
- Real-time database storage  
- Chat history (memory)  
- State synchronization between UI and agent  

---

 🏗️ System Flow

1. User sends a message  
2. Message is stored in Convex (memory layer)  
3. AI agent analyzes user intent  
4. Agent selects the most relevant tool (if needed)  
5. External API is called  
6. Streaming response starts immediately  
7. Response + memory stored in Convex  
8. UI updates in real-time  

---

 🔐 Environment Variables

```env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
GOOGLE_BOOKS_API_KEY=your_key
CONVEX_DEPLOYMENT=your_key
```

---

 ▶️ Run Locally

```bash
pnpm install
pnpm dev
```

Start Convex backend:

```bash
npx convex dev
```

---

💡 What I Learned

- Building AI agent systems with tool orchestration  
- Implementing persistent memory using Convex  
- Designing real-time streaming AI responses  
- Integrating multiple external APIs into one system  
- Structuring scalable full-stack AI applications  
- Building agent reasoning + decision-making systems  

---
 👩‍💻 Author
 Dua

Dua
