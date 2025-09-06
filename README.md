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

## 🚀 Getting Started

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

## 🔌 Connecting to Your Own Firebase Project

To use your own Firebase backend instead of the default one, follow these steps:

### 1. Firebase Project Setup

-   Create a new project in the [Firebase Console](https://console.firebase.google.com/).
-   In your new project, go to **Build > Authentication** and enable the **Email/Password** sign-in provider.
-   Go to **Build > Firestore Database** and create a database. Start in **test mode** for easy setup (you can secure it with Security Rules later).

### 2. Update Firebase Configuration

The Firebase connection details are stored in a single file.

-   Navigate to `src/lib/firebase.ts`.
-   In the Firebase Console, go to your **Project Settings** (click the gear icon ⚙️) and scroll down to the **Your apps** card.
-   Select the **Web** platform (</>). If you haven't created a web app yet, do so now.
-   Find and copy the `firebaseConfig` object.
-   Replace the existing `firebaseConfig` object in `src/lib/firebase.ts` with your own.

```typescript
// src/lib/firebase.ts

// ... imports
const firebaseConfig = {
  // Replace this with your own config object from the Firebase console
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ... rest of the file
```

### 3. Firestore Database Structure

For the application to work correctly, you need to create the following collections in your new Firestore database. You can add the first document to each collection manually via the Firebase Console to create them.

-   `users`: Stores user account information (name, email, role).
-   `resources`: Stores detailed profiles of team members.
-   `projects`: Stores project details.
-   `allocations`: Stores the links between resources and projects.
--   `requests`: Stores requests from team members to join projects.

After these steps, your application will be connected to your own Firebase backend. You will need to sign up as a new user in your own application to start adding projects and resources.

## 🔮 Future Scope & Potential Enhancements

TalentFlow AI is built on a solid foundation that can be extended with even more powerful features. Future development could include:

-   **Full Slack/Email Integration:** Connect the existing notification service to a real provider (like SendGrid or a Slack Webhook) to send automated alerts for allocations, conflicts, and project milestones.
-   **Advanced Analytics:** Introduce more complex metrics and visualizations, such as budget tracking, resource utilization forecasting, and skills gap analysis across the entire organization.
-   **Gamified User Experience:** Expand on the "match score" concept with more visual badges and a points system to encourage skill development and project participation.
-   **Direct User-to-User Messaging:** Implement a chat feature to allow managers and resources to discuss project details and availability directly within the platform.
-   **Team Performance Metrics:** Track and visualize team performance over time to identify high-performing team compositions and successful project patterns.
