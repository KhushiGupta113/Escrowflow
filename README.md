<!-- PROJECT LOGO -->
<div align="center">
  <img src="./frontend/public/favicon.ico" alt="Logo" width="80" height="80" onerror="this.src='https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/typescript/typescript.png'" />

  <h1 align="center">EscrowFlow</h1>

  <p align="center">
    A production-grade, secure, and intuitive full-stack freelance escrow platform.
    <br />
    <a href="#-features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#-api-documentation">API References</a>
    ·
    <a href="https://github.com/KhushiGupta113/Escrowflow/issues">Report Bug</a>
    ·
    <a href="https://github.com/KhushiGupta113/Escrowflow/issues">Request Feature</a>
  </p>
</div>

<!-- BADGES -->
<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next JS" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node JS" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</div>

<br />

## 📖 About The Project

**EscrowFlow** is a complete, scalable escrow payment and milestone management solution tailored for clients, freelancers, and administrators. By leveraging modern web technologies, it bridges the trust gap between parties via secure payments and automated milestone tracking.

A premium dashboard UI offers a frictionless interface while a robust, rate-limited, and protected backend architecture ensures user security and idempotency when pushing transactions. 

### 🌟 Key Product Flows

- **Multi-tenant Architecture:** distinct authorization flows and bespoke dashboards for `Client`, `Freelancer`, and `Admin` roles.
- **Milestone Lifecycles:** granular project tracking and safe escrow fund releases based on approval logic.
- **Payment Gateway Integration:** automated escrow funding and invoice settlement using Razorpay.
- **Dispute Resolution:** an unbiased conflict management system, fully operated by platform super-admins.
- **Real-time Engine:** live notification feed and channel broadcasts utilizing WebSockets (`Socket.io`).

---

## 🛠️ Tech Stack & Architecture

### **Frontend (`/frontend`)**
* **Framework:** Next.js (React 19) + TypeScript
* **Styling Tools:** Tailwind CSS v4, Framer Motion for micro-animations
* **Form & State:** React Hook Form + Zod, TanStack React Query (`v5`)
* **Realtime & UI Libraries:** Recharts, Socket.io-client, Sonner, Lucide React

### **Backend (`/backend`)**
* **Core:** Node.js, Express, TypeScript
* **Database:** MongoDB via Mongoose
* **Auth & Security:** JWT Auth, bcryptjs, Helmet, Express Rate Limit, Cookie Parser
* **Payments:** Razorpay SDK
* **Realtime API:** Socket.io
* **Documentation:** Swagger UI integration

---

## 🚀 Getting Started

Follow these instructions to run EscrowFlow locally.

### Prerequisites

Ensure you have installed the following on your workstation:
- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/) or another package manager
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas URI)

### Local Development Setup

1. **Clone the repository**
   ```sh
   git clone https://github.com/KhushiGupta113/Escrowflow.git
   cd Escrowflow
   ```

2. **Install root dependencies** (if applicable)
   ```sh
   npm install
   ```

3. **Configure Environment Variables**
   Navigate to the backend and setup the `.env` file via the example provided:
   ```sh
   cp backend/.env.example backend/.env
   ```
   *Make sure you provide your personal `MONGO_URI`, `JWT_SECRET`, and Razorpay Keys inside `.env`.*

4. **Boot Up Services**
   Fire up both backend and frontend environments concurrently:
   ```sh
   npm run dev:backend
   npm run dev:frontend
   ```
   * The **Frontend** should run on [`http://localhost:3000`](http://localhost:3000)
   * The **Backend** should run on [`http://localhost:5000`](http://localhost:5000)

---

## 🗂️ Project Structure

```text
📦 EscrowFlow
 ┣ 📂 backend/
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📜 server.ts      # App bootstrapping & DB Connections
 ┃ ┃ ┣ 📜 app.ts         # Middleware setups & unified MVC routing
 ┃ ┃ ┣ 📜 models.ts      # Collections strictly typed in Mongoose
 ┃ ┃ ┗ 📜 socket.ts      # Socket emit/receive channels
 ┃ ┗ 📜 package.json
 ┣ 📂 frontend/
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 app/           # Next.js App Router UI Layer
 ┃ ┃ ┣ 📂 components/    # Reusable shadcn/custom components
 ┃ ┃ ┣ 📂 lib/           # Utils and API wrappers
 ┃ ┃ ┗ 📂 hooks/         # React lifecycle & State
 ┃ ┗ 📜 package.json
 ┗ 📜 package.json       # Monorepo/Root configurations
```

---

## 📡 API Documentation

A summarized slice of available API endpoints. For the full experience, interact with the **Swagger UI** on `/api/docs` while running the application.

| Domain        | Action | Endpoint URL |
| ------------- | :--- | :----------- |
| **System**    | `GET` | `/health` |
| **Auth**      | `POST` | `/api/auth/signup` <br> `/api/auth/login` <br> `/api/auth/refresh` |
| **Projects**  | `GET` / `POST` | `/api/projects` |
| **Milestones**| `POST` | `/api/milestones` <br> `/api/milestones/:id/submit` |
| **Escrow**    | `POST` | `/api/escrow/fund/:id` <br> `/api/escrow/verify` <br> `/api/escrow/release/:id` |
| **Disputes**  | `POST` | `/api/disputes` <br> `/api/admin/disputes/:id/resolve` |

---

## 📈 Roadmap & Upcoming Features

- [ ] **Tighter Domain Segregation:** Move from `.app.ts` unified models to fully segregated `/controllers`, `/services`, and `/routes`.
- [ ] **Image Upload Pipeline:** Secure S3/Cloudinary bucket integration for dispute evidence support.
- [ ] **End-to-End Testing:** Automate system health checks utilizing Cypress/Playwright.
- [ ] **Admin Metrics Optimization:** Enhance audit tracking and analytic caching for rapid dashboard rendering.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [issues page](https://github.com/KhushiGupta113/Escrowflow/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <p>Built with ❤️ for secure collaborations.</p>
</div>
