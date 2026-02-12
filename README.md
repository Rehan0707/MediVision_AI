# MediVision AI

**MediVision AI** is a cutting-edge medical visualization and decision-support platform. This project is organized with a proper frontend-backend separation using a monorepo structure.

## 📁 Project Structure

- **`frontend/`**: Next.js 14 web application (UI, 3D Engine, Auth).
- **`backend/`**: Express.js server (API, Database management, AI processing).
- **`packages/shared/`**: Shared TypeScript types and utility functions used by both frontend and backend.
- **`docs/`**: Project documentation and implementation plans.

## 🚀 Features

- **Imaging & Radiology**: X-Ray, MRI, CT, Ultrasound, PET, Mammography – AI analysis with 3D visualization
- **Laboratory**: Blood tests, Urine, LFT, KFT, Thyroid, Hormone – report analysis with plain-English explanations
- **Cardiac**: ECG/EKG, Echocardiogram, Stress Test, Holter – rhythm and report analysis
- **Pulmonary**: PFT, Spirometry, Sleep Study – respiratory report analysis
- **Clinical Documents**: Discharge summaries, Operation notes, Prescriptions – AI extraction and summarization
- **Advanced**: Oncology, Histopathology, Genetic Testing, Allergy – specialist report analysis
- **Location Health News**: Real-time health headlines based on user location

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Three.js, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, MongoDB.
- **Language**: TypeScript throughout.

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- (Optional) RabbitMQ for ECG async analysis
- (Optional) Python 3 for XVR 2D→3D registration

### 2. Installation
From the root directory, run:
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` and configure:

- **Backend** (`backend/.env`): Set `MONGODB_URI`, `JWT_SECRET`, and at least one of `OPENAI_API_KEY` or `GEMINI_API_KEY` for AI features.
- **Frontend** (`frontend/.env.local`): Set `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `MONGODB_URI`, `NEXT_PUBLIC_API_URL`.

### 4. Seed Demo Data (Optional)
```bash
npm run seed:users      # Creates patient@medivision.ai, doctor@medivision.ai, admin@medivision.ai (password: password123)
npm run seed:community  # Seeds community discussions
```

Super Admin login: `admin@medivision.ai` / `neural_master_2026` (from env)

### 5. Running the Project
You can run both frontend and backend simultaneously:
```bash
npm run dev
```

Or run them individually:
- Frontend: `npm run dev:frontend` (http://localhost:3000)
- Backend: `npm run dev:backend` (http://localhost:5001)

## 🚀 Deployment

### Frontend (Vercel)
1. Deploy from `frontend/` directory or set root to `frontend` in Vercel.
2. Set env vars: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `MONGODB_URI`, `NEXT_PUBLIC_API_URL` (your backend URL).
3. Build command: `npm run build`

### Backend (Railway/Render/Heroku)
1. Set root to `backend/`.
2. Env vars: `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY` or `GEMINI_API_KEY`, `FRONTEND_URL` (your frontend URL).
3. Start: `npm run dev` or `npm start` (after build).

### Production checklist
- Set `NEXT_PUBLIC_API_URL` in frontend to your deployed backend URL.
- Set `FRONTEND_URL` in backend to your deployed frontend URL.
- Use MongoDB Atlas or managed MongoDB for production.
- Keep API keys in env vars only, never in code.
- Add `NEWS_API_KEY` (from newsapi.org) for location-based health news.
- Add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` for Google sign-in.

### AI Prompts & Clinical Patterns
Modality-specific AI prompts are designed around standard clinical report structures (aligned with patterns from medical datasets). For custom dataset integration (e.g. Kaggle ECG, chest X-ray datasets), extend the prompts in `frontend/src/app/dashboard/page.tsx` and `backend/src/services/aiService.ts`.

## 🛡 License
MIT License

