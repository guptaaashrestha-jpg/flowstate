<div align="center">

# FlowState

**A Comprehensive Productivity Command Center**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](#)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](#)

</div>

<br />

FlowState is a minimalist, high-performance productivity dashboard built to streamline daily workflows. It combines task management, daily scheduling, document parsing, and content generation into a single cohesive interface, backed by a secure Node.js proxy architecture.

## Architecture & Stack

The project is structured as a full-stack web application designed for zero-configuration deployments.

* **Frontend Client**
  Built entirely with vanilla HTML, CSS, and JavaScript. It utilizes a custom design system with CSS variables, Lucide icons, and modern grid layouts. No heavy frontend compilation frameworks are required.
* **Backend Service**
  A lightweight Node.js server using Express. The backend acts as a secure proxy to the Gemini API, ensuring the developer API key is strictly maintained server-side and never exposed to the client browser.

## Core Modules

| Module | Functionality |
| :--- | :--- |
| **Task Board** | A kanban-style management board that organizes tasks using natural language parsing. |
| **Focus Planner** | An intelligent daily scheduler that allocates focus blocks based on task priority and duration. |
| **Meeting Brain** | An analysis engine that extracts executive summaries, decisions, and actionable items from transcripts. |
| **Content Studio** | A writing environment that generates professional templates for emails, reports, and proposals. |
| **Doc Analyzer** | A parsing tool designed to break down large documents to extract key insights and comprehension questions. |

## Local Development Setup

Follow these instructions to run the application in a local development environment.

### Requirements

* Node.js (version 18.0.0 or higher)
* A valid Google Gemini API key from Google AI Studio

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/guptaaashrestha-jpg/flowstate.git
cd flowstate
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
Create a `.env` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

**4. Start the server**
```bash
node server.js
```

**5. Access the application**
Open your browser and navigate to `http://localhost:3000`.

## Fallback Mechanisms

If the backend encounters a rate limit or a quota error from the external API, the application will automatically intercept the `429` status code and fall back to streaming context-aware mock responses. This guarantees the user interface remains entirely functional, testable, and visually stable even when the upstream API is temporarily unavailable.

---

<div align="center">
  Released under the MIT License
</div>
