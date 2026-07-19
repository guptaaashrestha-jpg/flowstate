# FlowState

FlowState is a comprehensive, AI-powered productivity dashboard built to streamline daily workflows. It combines task management, scheduling, document analysis, and content generation into a single, cohesive interface.

The application uses a vanilla JavaScript frontend with a lightweight Node.js/Express backend to securely proxy requests to the Google Gemini API.

## Core Features

* **Task Board**: A kanban-style board that allows users to create and organize tasks using natural language processing.
* **Focus Planner**: An intelligent daily scheduler that optimizes focus blocks based on current energy levels and priority tasks.
* **Meeting Brain**: An analysis tool that extracts executive summaries, key decisions, and actionable items from raw meeting transcripts.
* **Content Studio**: A writing assistant that generates professional emails, reports, and social posts with customizable tones.
* **Doc Analyzer**: A parsing tool designed to break down large documents and extract key insights and comprehension questions.

## Architecture

The project is structured as a full-stack web application:

* **Frontend**: Built entirely with vanilla HTML, CSS, and JavaScript. It utilizes a custom design system with CSS variables, Lucide icons, and modern grid layouts. No heavy frontend frameworks are required.
* **Backend**: A Node.js server using Express. The backend acts as a secure proxy to the Gemini API, ensuring the API key is never exposed to the client side.

## Local Development

Follow these steps to run the application locally.

### Prerequisites

* Node.js (version 18 or higher)
* A Google Gemini API key from Google AI Studio

### Setup

1. Clone the repository and navigate into the project directory.

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the local server:
   ```bash
   node server.js
   ```

5. Open your browser and navigate to `http://localhost:3000` to use the application.

## Fallback Mechanisms

If the backend encounters a rate limit or a quota error from the Gemini API, the application will automatically fall back to intelligent mock responses. This ensures the user interface remains functional and testable even when the API is temporarily unavailable.

## License

MIT License. See LICENSE file for details.
