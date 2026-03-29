**AI Interview Q&A Generator**
A full-stack project where a user shares their job level details through a form, and an AI generates interview questions and answers as per their selected tech stack.

**The Idea Behind It****
I built this because interview preparation is time-consuming and most AI-powered tools that do this are paid. I wanted to build something that actually works using a free AI model, where a user just fills in their job level and tech stack and gets relevant questions and answers generated for them instantly.

**How It Works**

User registers or logs in
Fills out a form with their job level (junior, mid, senior) and selected tech stack
AI generates a set of interview questions and answers based on those details
User can review and use them for preparation

**Features**

Authentication — register and login with protected routes
AI integration — uses a free model via OpenRouter API to generate questions and answers
Dynamic form — user selects job level and tech stack, AI responds accordingly
State management — Context API handles user session and app state across components
Responsive UI — built with Tailwind CSS

**Tech Stack**
Frontend - React, JavaScript, Tailwind CSS
State Management - Context API
Backend - Node.js, Express
Database - MongoDB
AI - OpenRouter API (free model)

**Getting Started
Prerequisites**

Node.js installed
MongoDB connection (local or Atlas)
OpenRouter API key — get one free at openrouter.ai

**Installation**

Clone the repository
git clone https://github.com/your-username/ai-interview-qa.git
cd ai-interview-qa
Install server dependencies

bashcd server
npm install

Install client dependencies

bashcd ../client
npm install

Set up your .env file inside the server folder

envMONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000

Why I Made These Choices
OpenRouter API — I used OpenRouter because it gives access to free AI models without needing a paid subscription. It made sense for a project where the goal was to keep everything free and accessible.
Context API over Redux — the app state here is straightforward — user session and the generated Q&A data. Context API handles that without the extra setup and boilerplate that Redux requires. For a project of this size it was the right call.
MongoDB — storing user details and their generated Q&A history as documents made more sense than a relational structure here since the data shape varies depending on what tech stack the user selects.

Status
Project is complete. Some features are still being improved.

Author
Arti Yashwant Barsagade
Live: <img width="1165" height="937" alt="Screenshot 2026-03-29 165503" src="https://github.com/user-attachments/assets/b1d434ab-429f-466d-885d-0a2a34d45652" />
<img width="1880" height="985" alt="Screenshot 2026-03-29 165433" src="https://github.com/user-attachments/assets/387c3e26-aefc-46e4-81bd-1049bad8f6f6" />
<img width="1910" height="876" alt="Screenshot 2026-03-29 165422" src="https://github.com/user-attachments/assets/5e96d3ef-6a5a-4be5-8eeb-e1b8201ea793" />
https://fullstack-ai-interview.onrender.com

Run the server

bashcd server
npm run dev

Run the client (open a new terminal)

bashcd client
npm run dev

Open your browser and go to

http://localhost:5173
