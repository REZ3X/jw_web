# JogjaWaskita Frontend

This is the official Next.js frontend application for **JogjaWaskita**, a civic engagement platform designed for citizens to report, track, and resolve local issues in collaboration with government departments.

---

## 🚀 Features

The JogjaWaskita frontend is packed with modern features tailored for citizens, government officials, and platform administrators:

- **🔐 Secure Authentication:** Seamless Google OAuth login. Authentication relies on HttpOnly cookies via a secure BFF architecture.
- **📰 Centralized Feed:** A social media style community feed featuring infinite scroll, interactive vote actions, nested comments, and advanced filtering options.
- **📸 Media & Reporting:** Users can upload up to 4 images per report, optionally specify locations, and rely on an AI-powered "Choose for me" button to automatically classify report departments.
- **🤖 Dedicated AI Chat:** ChatGPT-style interface allowing users to converse with the JogjaWaskita AI Assistant. Supports general inquiries or complex agentic tool operations.
- **🏛️ Government Dashboard:** Dedicated workspace for official departments to track, update, and manage the issue queue (Pending, In Progress, Resolved).
- **🛡️ Dev Admin Panel:** High-level platform analytics, detailed user management, role assignments, and a system log viewer for auditing.
- **🎨 Modern Design:** Vibrant UI utilizing TailwindCSS v4. Complete with glassmorphism effects, dynamic micro-animations, and full dark-mode support.

---

## 🏗️ Architecture

This repository strictly implements a **BFF (Backend-For-Frontend)** architectural pattern. 

### Why BFF?
- **Security:** The browser never speaks directly to the Rust backend APIs. All client-side requests go through Next.js API Route Handlers (`src/app/api/...`) which act as a secure proxy.
- **Stateless Tokens:** Access tokens are managed entirely through `HttpOnly` server cookies. Client-side code never stores or directly accesses sensitive JWT tokens, mitigating XSS risks.
- **Server Confidence:** Next.js Server Components securely communicate directly with the Rust APIs during SSR (Server-Side Rendering) for optimal performance.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Styling:** Tailwind CSS v4, utilizing a standardized variables-based design system
- **State Management:** Zustand (for lightweight global Auth-state)
- **Icons:** Lucide React
- **Date Formatting:** date-fns
- **Markdown:** react-markdown & remark-gfm (to render AI agent responses)

---

## 📂 Project Structure

```text
jw_web/
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── admin/          # Dev Admin panel and log viewers
│   │   ├── api/            # BFF Proxy Handlers (auth, posts, comments, chat, analytics)
│   │   ├── auth/           # Login and OAuth callbacks
│   │   ├── chat/           # AI conversational interfaces
│   │   ├── dashboard/      # Specific government task queues
│   │   ├── explore/        # Advanced global search
│   │   └── profile/        # User accounts and settings
│   ├── components/         # Reusable UI, Layouts, and domain-specific Components
│   └── lib/                # Shared utilities, constants, API fetch wrappers, Auth
├── public/                 # Static assets
└── .env.example            # Environment properties template
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (`v18.x` or later recommended)
- The [JogjaWaskita Rust Backend](../jw_api) must be running.

### 1. Installation
Clone the repository and install dependencies:
```bash
cd jw_web
npm install
```

### 2. Environment Configuration
Copy the supplied environment template to ensure everything binds properly:
```bash
cp .env.example .env
```
Ensure that `BACKEND_URL` in the `.env` points to your backend instance. If running locally, this generally looks like:
```env
BACKEND_URL=http://localhost:8000
```

### 3. Start Development Server
Start hacking locally:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
