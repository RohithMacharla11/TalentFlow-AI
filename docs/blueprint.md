# **App Name**: TalentFlow AI

## Core Features:

- Intelligent Resource Allocation: Match resources to projects based on skills, availability, and priority, using an AI tool.
- Conflict Resolution: Prioritize resource allocation based on project priority and deadlines, with automated conflict alerts.
- Allocation Dashboard: Display resources and projects in sortable and filterable tables, highlighting key requirements and deadlines.
- Calendar View: Visualize allocations on a calendar to see resource commitments over time.
- Conversational AI Interface: Use a Gemini-powered chatbot to allocate resources, reassign tasks, and resolve conflicts through natural language queries.
- Explainability Logs: Record explanations for each assignment, detailing skill matches and availability, and show these in the UI.
- Real-time Synchronization: Enable real-time data synchronization between the UI and the data store.
- Skill Extraction: Use Gemini/Genkit to auto-extract skills from project descriptions and resource CVs.
- "Why This Resource?" Explainability: AI gives a ranked reasoning (e.g., “Assigned Alice -> 95% skill match, 10 hrs available, deadline alignment”).
- Notifications: Email/Slack integration (via Firebase Functions) when conflicts or reallocations happen.
- Audit Trail: Store allocation history in Firestore (so team leads can track changes).
- Dark/Light Mode Toggle: Toggle between dark and light UI modes.
- Drag-and-Drop Allocation: Directly move a resource between projects on the dashboard.
- Color Coding: Green = matched perfectly; Yellow = partial skill match; Red = conflict.
- Gantt Chart View: Shows timeline of allocations.
- Mobile-friendly Responsive Design: Tailwind makes this easy.
- Gamified AI Suggestions: e.g., “Confidence score 95% 🎯” badges on allocations.

## Style Guidelines:

- Primary color: Teal (#008080) to represent expertise and efficiency.
- Background color: Light cyan (#E0FFFF) to create a clean, calming workspace.
- Accent color: Coral (#FF8080) for highlighting critical actions and alerts.
- Font pairing: 'Space Grotesk' (sans-serif) for headings, 'Inter' (sans-serif) for body text.
- Use clear and concise icons from a Material Design library for key actions and resource statuses.
- Employ a card-based layout with clean divisions for resource and project summaries to improve readability and UX.
- Use subtle transition animations for data updates and interactive elements to enhance user engagement.