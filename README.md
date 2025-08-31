# 🚀  Open State Stack  -  Next.js Starter Template

**A modern, production-ready boilerplate built with Next.js, TypeScript, and OSS Design System**

This starter provides a scalable foundation to kickstart your next web application. With clean architecture, modular folder structure.


## 🛠️ Tech Stack

| Category             | Tech                                                                          |
| -------------------- | ----------------------------------------------------------------------------- |
| **Framework**        | [Next.js v15.3.0](https://nextjs.org/)                                        |
| **Language**         | TypeScript                                                                    |
| **Styling**          | Tailwind CSS + Open State Stack DS                                            |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) – Minimal, scalable state management |
| **Tooling**          | ESLint, Prettier, TypeScript, Docker                                          |
| **i18n**             | TypeScript-ready internationalization with locale detection                   |

> 🐳 **Built-in Docker Support** – Containerize your app with included `Dockerfile` and `docker-compose.yml` for reliable development and deployment (Optional).


## 📋 Prerequisites

* Node.js `>= 18.18`
* npm or yarn
* Docker (optional – for containerized environments)


## 📁 Project Structure

```
NEXT-TS-FRONTEND-STARTER/
├── src/
│   ├── app/              → Next.js App Router (pages, layouts, routing)
│   ├── modules/          → API-based modules (e.g., auth, dashboard)
│   ├── assets/           → Static assets (images, icons, fonts)
│   ├── hooks/            → Custom React hooks
│   ├── components/       → Shared reusable components and page based components.
│   ├── context/          → React context providers
│   ├── lib/              → Utilities and helpers
│   ├── store/            → Zustand state management logic
│   ├── config/           → Global app configuration
│   ├── types/            → Global TypeScript types and interfaces
│   └── styles/           → Tailwind CSS config and global styles
├── public/               → Public static files (e.g., favicon, robots.txt)
├── .env.local            → Environment variables
├── next.config.js        → Next.js configuration
├── tsconfig.json         → TypeScript configuration
├── Dockerfile            → Docker setup
├── docker-compose.yml    → Docker Compose configuration
├── .dockerignore         → Files to exclude from Docker context
├── .gitignore            → Git ignored files
└── README.md             → Project documentation
```

---

## 🎯 Key Features

- **Modular Architecture** – Easy to scale and maintain
- **Type-safe** – Full TypeScript support
- **Pre-configured Tooling** – ESLint + Prettier for consistent code style
- **Fully Responsive** – Works across mobile, tablet, and desktop
- **Zustand-powered State** – Lightweight and scalable state management
- **i18n-Ready** – TypeScript-compatible internationalization.
- **Production-Grade Base** – Designed for scalable real-world deployments.
- **Axios Interceptor** - Pre-configured to handle auth, public, and private API calls

---

## 🧪 Getting Started - Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/Open-State-Stack/next-ts-frontend-starter
cd next-ts-frontend-starter
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file at the root of your project:

```env
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

🌐 Visit your app at: `http://localhost:3000`

## 📄 License

This project is licensed under the MIT License.
