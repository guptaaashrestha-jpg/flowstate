/* ============================================
   FlowState — AI Engine
   Gemini API Integration with Context-Aware Prompts
   ============================================ */

const AIEngine = (() => {
  const API_ENDPOINT = 'http://localhost:3000/api/generate';

  function getMockResponse(sysPrompt) {
    if (!sysPrompt) return "I've hit my API rate limit. Let's pretend this is exactly what you needed.";
    
    if (sysPrompt.includes('scheduling assistant')) {
      return JSON.stringify({
        schedule: [
          { time: "09:00 AM", endTime: "10:30 AM", title: "Deep Work Block", type: "deep_work", description: "API rate limit reached. This is a mock schedule." },
          { time: "10:30 AM", endTime: "11:00 AM", title: "Review Inbox", type: "admin", description: "Catch up on emails." }
        ],
        tips: ["Since we hit a rate limit, try taking a quick screen break!"]
      });
    }
    if (sysPrompt.includes('task parser')) {
      return JSON.stringify({
        tasks: [
          { title: "Mocked Task", description: "Generated while rate limited.", priority: "medium", category: "work", dueDate: null }
        ]
      });
    }
    if (sysPrompt.includes('meeting intelligence')) {
      return JSON.stringify({
        summary: "We hit an API rate limit, so this is a simulated meeting summary.",
        keyDecisions: ["Mock data will be used temporarily."],
        actionItems: [{ task: "Wait 60 seconds for API quota to reset", assignee: "User", deadline: "Now" }],
        followUpEmail: "Hi team,\n\nWe encountered a temporary rate limit while processing our notes. I'll send the full summary shortly.\n\nBest,\nFlowState AI",
        sentiment: "neutral"
      });
    }
    if (sysPrompt.includes('document analysis')) {
      return JSON.stringify({
        summary: "API rate limit reached. Mock document analysis provided.",
        keyInsights: ["The document exceeded our current API quota limits."],
        actionItems: ["Please wait a moment and try again."],
        questions: [{ question: "Why am I seeing this?", answer: "API rate limits were reached." }],
        wordCount: 100,
        readingTime: "1 min",
        complexity: "simple"
      });
    }
    
    if (sysPrompt.includes('content writer')) {
      if (sysPrompt.toLowerCase().includes('email')) {
        return "Subject: Enhancing our Workflow Strategy\n\nHi Team,\n\nI wanted to share a quick update regarding our new productivity initiatives. By leveraging FlowState's capabilities, we anticipate a 40% reduction in administrative overhead this quarter.\n\nPlease review the attached guidelines when you have a moment.\n\nBest regards,\nAlex";
      }
      if (sysPrompt.toLowerCase().includes('social post')) {
        return "🚀 Exciting news! We're officially rolling out our new AI-powered productivity system today. Say goodbye to scattered tasks and hello to seamless workflows! #Productivity #AI #Innovation 💡";
      }
      if (sysPrompt.toLowerCase().includes('report')) {
        return "Q3 Performance Report (Mock Data)\n\n1. Executive Summary\nThis quarter, team velocity increased significantly, driven by the adoption of automated workflows.\n\n2. Key Metrics\n- Task Completion Rate: +25%\n- Meeting Efficiency: +15%\n\n3. Next Steps\nContinue monitoring AI integration and optimize the daily focus blocks.";
      }
      return "Here is a beautifully crafted mock response for your request. Since the API rate limit is currently active, I'm providing this placeholder text so you can still preview the Content Studio's typing animation and UI flow!";
    }

    return "I've hit my API rate limit for a moment. But here is a simulated response! Let's pretend this is exactly what you needed.";
  }

  function hasApiKey() {
    return true; // Now handled by backend
  }

  async function generate(prompt, options = {}) {
    if (!hasApiKey()) {
      throw new Error('API key not configured. Please set your Gemini API key.');
    }

    const {
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt = '',
    } = options;

    const contents = [];

    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
        },
        stream: false
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.error?.message || `API Error: ${response.status}`;
      if (response.status === 429 || msg.toLowerCase().includes('quota')) {
        console.warn("Gemini Rate Limit hit, falling back to mock response.");
        return getMockResponse(systemPrompt);
      }
      throw new Error(msg);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No response generated');
    return text;
  }

  async function streamGenerate(prompt, onChunk, options = {}) {
    if (!hasApiKey()) {
      throw new Error('API key not configured.');
    }

    const {
      temperature = 0.7,
      maxTokens = 4096,
      systemPrompt = '',
    } = options;

    const contents = [];

    if (systemPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
        },
        stream: true
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.error?.message || `API Error: ${response.status}`;
      if (response.status === 429 || msg.toLowerCase().includes('quota')) {
        console.warn("Gemini Rate Limit hit, falling back to mock stream response.");
        const mockMsg = getMockResponse(options.systemPrompt || prompt);
        if (onChunk) {
          const words = mockMsg.split(' ');
          for (const word of words) {
            onChunk(word + ' ');
            await new Promise(r => setTimeout(r, 50));
          }
        }
        return mockMsg;
      }
      throw new Error(msg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const chunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (chunk) {
              fullText += chunk;
              onChunk(chunk, fullText);
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }
      }
    }

    return fullText;
  }

  // --- Context Builder ---
  function getTaskContext() {
    const tasks = JSON.parse(localStorage.getItem('flowstate_tasks') || '[]');
    if (tasks.length === 0) return '';
    const summary = tasks.map(t =>
      `- [${t.status}] ${t.title} (Priority: ${t.priority}, Category: ${t.category || 'General'})`
    ).join('\n');
    return `\n\nCurrent tasks:\n${summary}`;
  }

  // --- Module-Specific Prompts ---

  const PROMPTS = {
    parseTask: (input) => ({
      systemPrompt: `You are FlowState AI, a productivity assistant. Parse natural language task descriptions and extract structured task data. Always respond with valid JSON only, no markdown code fences.

Response format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Brief description",
      "priority": "urgent|high|medium|low",
      "category": "work|personal|meetings|creative|health|learning",
      "dueDate": "YYYY-MM-DD or null"
    }
  ]
}`,
      prompt: `Parse these task(s) from natural language:\n\n"${input}"\n\nExtract all tasks mentioned. Assign appropriate priority and category based on context clues. Return JSON only.`
    }),

    planDay: (tasks, energy) => ({
      systemPrompt: `You are FlowState AI, a smart scheduling assistant. Create optimized daily schedules. Consider task priority, estimated duration, and energy levels. Always respond with valid JSON only, no markdown code fences.

Response format:
{
  "schedule": [
    {
      "time": "HH:MM",
      "endTime": "HH:MM",
      "title": "Task/Activity name",
      "type": "deep_work|admin|meeting|break|creative",
      "description": "Brief note"
    }
  ],
  "tips": ["Productivity tip 1", "Tip 2"]
}`,
      prompt: `Create an optimized daily schedule for today.

Energy level: ${energy}
${getTaskContext()}

Additional context: Current time is ${new Date().toLocaleTimeString()}. Schedule from now until end of day. Place high-priority and complex tasks during peak energy times. Include breaks every 90 minutes. Return JSON only.`
    }),

    analyzeMeeting: (transcript) => ({
      systemPrompt: `You are FlowState AI, a meeting intelligence assistant. Analyze meeting transcripts and extract structured insights. Always respond with valid JSON only, no markdown code fences.

Response format:
{
  "summary": "2-3 sentence executive summary",
  "keyDecisions": ["Decision 1", "Decision 2"],
  "actionItems": [
    {
      "task": "Action item description",
      "assignee": "Person name or 'Unassigned'",
      "deadline": "Mentioned deadline or 'TBD'"
    }
  ],
  "followUpEmail": "Draft follow-up email text",
  "sentiment": "positive|neutral|mixed|tense"
}`,
      prompt: `Analyze this meeting transcript/notes:\n\n"${transcript}"\n\nExtract all key information. Be thorough with action items. Write a professional follow-up email. Return JSON only.`
    }),

    generateContent: (type, topic, tone, context) => ({
      systemPrompt: `You are FlowState AI, a professional content writer. Generate high-quality ${type} content in a ${tone} tone. Write naturally and professionally. Do NOT use markdown formatting — output plain text only, using line breaks for structure.`,
      prompt: `Generate a ${type} about the following:\n\n"${topic}"\n\nTone: ${tone}\n${context ? `Additional context: ${context}` : ''}\n\nWrite the complete ${type}. Make it ready to use with no placeholders.`
    }),

    analyzeDocument: (text) => ({
      systemPrompt: `You are FlowState AI, a document analysis expert. Analyze documents and extract structured insights. Always respond with valid JSON only, no markdown code fences.

Response format:
{
  "summary": "Executive summary (3-4 sentences)",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "actionItems": ["Action 1", "Action 2"],
  "questions": [
    {
      "question": "Comprehension question",
      "answer": "Brief answer"
    }
  ],
  "wordCount": number,
  "readingTime": "X minutes",
  "complexity": "simple|moderate|complex"
}`,
      prompt: `Analyze this document:\n\n"${text}"\n\nProvide a thorough analysis with actionable insights. Return JSON only.`
    }),

    commandBar: (input) => ({
      systemPrompt: `You are FlowState AI command center. Parse natural language commands and determine the user's intent. Always respond with valid JSON only, no markdown code fences.

Response format:
{
  "intent": "create_task|plan_day|summarize_meeting|generate_content|analyze_document|navigate|general_query",
  "module": "tasks|planner|meetings|content|docs|dashboard",
  "data": {
    // Extracted data relevant to the intent
  },
  "response": "Brief confirmation or response text"
}`,
      prompt: `Parse this command:\n\n"${input}"\n\n${getTaskContext()}\n\nDetermine intent and extract relevant data. Return JSON only.`
    })
  };

  return {
    hasApiKey,
    generate,
    streamGenerate,
    PROMPTS,
    getTaskContext
  };
})();
