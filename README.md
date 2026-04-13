# JogjaWaskita Frontend

This is the official Next.js frontend application for **JogjaWaskita**, a civic engagement platform designed for citizens to report, track, and resolve local issues in collaboration with government departments.

---

## 🚀 Features

The JogjaWaskita frontend is packed with modern features tailored for citizens, government officials, and platform administrators:

- **🔐 Secure Authentication & RBAC:** Seamless Google OAuth login and email verification. Authentication relies on HttpOnly cookies via a secure BFF architecture. Role-Based Access Control completely gates comment creation, voting, and report drafting until citizens verify their email.
- **📰 Centralized Feed:** A social media style community feed featuring infinite scroll, interactive vote actions, nested comments, and advanced filtering options.
- **📸 Media & Reporting:** Users can upload up to 4 images per report, optionally specify locations, and rely on an AI-powered "Choose for me" button to automatically classify report departments.
- **🤖 Unified AI Assistant:** A sophisticated ChatGPT-style interface acting as a single entry point for conversational inquiries, guided civic issue reporting, and data exploration via natively injected agentic tools.
- **🏛️ Government Dashboard:** Dedicated workspace for official departments to track, update, and manage the issue queue (Pending, In Progress, Resolved).
- **🛡️ Dev Admin Panel:** High-level platform analytics, detailed user management, role assignments, and a system log viewer for auditing.
- **🔍 Advanced Explore:** Search across active reports by keywords/departments or pivot into a dedicated 'People' tab to discover community profiles based on names and usernames.
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

For **production/staging**, also set `NEXT_PUBLIC_SITE_URL` to your public domain so OAuth redirects resolve correctly (instead of the internal server address):
```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Start Development Server
Start hacking locally:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
