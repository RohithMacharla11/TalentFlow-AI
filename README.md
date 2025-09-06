# TalentFlow AI: Intelligent Resource Allocation Platform

TalentFlow AI is a sophisticated, AI-driven web application designed to streamline and optimize the process of resource allocation within an organization. It moves beyond simple manual assignments by leveraging the power of generative AI to make intelligent, data-driven recommendations for matching the right people to the right projects.

This platform serves as a central hub for project managers, administrators, and team members, providing tools for project and resource management, insightful analytics, and a collaborative environment to ensure that every project is staffed for success.

## ✨ Key Features

-   **🤖 AI-Powered Resource Matching:** When viewing a project, managers can receive AI-driven suggestions for the best-suited resources, complete with a percentage match score and detailed reasoning based on skills, availability, and other project factors.
-   **🧠 Intelligent Project Recommendations:** Resources can receive intelligent recommendations for projects that align with their skill set and availability, empowering them to find their next challenge.
-   **⚠️ Automated Conflict Resolution:** The system automatically flags low-suitability allocations as "conflicts." An AI-powered tool can then be used to analyze the conflict and suggest concrete resolutions, such as reassigning the task to a better-suited colleague.
-   **📊 Dynamic Dashboard:** A central dashboard provides an at-a-glance overview of all active projects and available resources. The view is tailored to the user's role (Administrator, Project Manager, or Team Member).
-   **🗂️ Comprehensive Resource & Project Management:** Easily add, view, and manage detailed profiles for all company resources and create new projects with specific requirements, deadlines, and priorities.
-   **🗓️ Interactive Calendar & Gantt Views:** Visualize project timelines and resource allocation deadlines through an intuitive calendar and a powerful Gantt chart, providing clarity on project schedules and dependencies.
-   **💬 AI Chatbot Assistant:** An integrated AI chatbot, powered by function-calling, allows managers to perform actions using natural language, such as finding available resources or allocating a person to a project.
-   **🔐 User Roles & Permissions:** The application supports distinct user roles (Administrator, Project Manager, Team Member), ensuring that users only have access to the features and data relevant to them.
-   **🔔 Real-time Notifications:** A notification center in the header keeps users informed about recent allocation activities, ensuring everyone stays up-to-date.

## 🛠️ Technology Stack

This project is built with a modern, robust, and scalable technology stack, designed for high performance and a great developer experience.

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Generative AI:** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
-   **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore for database, Firebase Authentication for users)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Charting:** [Recharts](https://recharts.org/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🚀 Future Scope & Potential Enhancements

TalentFlow AI is built on a solid foundation that can be extended with even more powerful features. Future development could include:

-   **Full Slack/Email Integration:** Connect the existing notification service to a real provider (like SendGrid or a Slack Webhook) to send automated alerts for allocations, conflicts, and project milestones.
-   **Advanced Analytics:** Introduce more complex metrics and visualizations, such as budget tracking, resource utilization forecasting, and skills gap analysis across the entire organization.
-   **Gamified User Experience:** Expand on the "match score" concept with more visual badges and a points system to encourage skill development and project participation.
-   **Direct User-to-User Messaging:** Implement a chat feature to allow managers and resources to discuss project details and availability directly within the platform.
-   **Team Performance Metrics:** Track and visualize team performance over time to identify high-performing team compositions and successful project patterns.

## Getting Started

To get started with the project in your local environment:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
