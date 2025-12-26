# Menopause Companion (همدم یائسگی)

A comprehensive, empathetic, and scientifically-backed Progressive Web Application (PWA) designed to support women during their menopause journey. This application provides symptom tracking, community support, educational resources, and health insights in a secure and user-friendly environment.

## ✨ Features

### 🌸 Core Functionality
- **Symptom Tracker**: Daily logging of physical, psychological, and urogenital symptoms based on the Menopause Rating Scale (MRS).
- **Data Visualization**: Interactive charts (Recharts) displaying symptom trends over weekly and monthly periods, helping users and doctors monitor progress.
- **Smart Dashboard**: Personalized health overview including age, weight, period status, and dominant symptoms.

### 🤝 Community & Support
- **Anonymous Forum**: A safe space for users to discuss topics like hot flashes, mood swings, and sleep issues without revealing personal identity.
- **Role-Based Access**: Granular permission system (User, Subscriber, Admin, Super Admin, Developer) for moderation and management.

### 📚 Education & Wellness
- **Digital Library**: Integrated audio player for podcasts and external links for scientific articles.
- **Daily Tips**: Automated daily health and motivational messages.
- **Reminders**: Built-in reminders for water intake, sleep, and medication.

### 🛠 Technical Highlights
- **Real-time Database**: Powered by **Firebase Firestore** for instant data syncing.
- **Authentication**: Secure login via Email/Password and Anonymous Guest login using **Firebase Auth**.
- **Admin Panel**: robust backend management for user administration, content moderation, and system-wide notifications.
- **Responsive Design**: Fully responsive UI built with **Tailwind CSS**, optimized for all device sizes.
- **System Integrity**: Features like maintenance mode, user banning, and forced updates.

## 🚀 Tech Stack

- **Frontend**: React.js (v18+), TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: React Hooks
- **Backend**: Firebase (Firestore, Auth, Analytics)
- **Charts**: Recharts
- **Build Tool**: Vite (Recommended for deployment)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MrV006/menopause-companion.git
   cd menopause-companion
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a project in [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password, Anonymous).
   - Enable **Firestore Database**.
   - Copy your Firebase config object into `src/firebase.ts`.

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment (GitHub Pages)

To deploy this application to GitHub Pages:

1. Update `vite.config.ts` (if using Vite) to set the base path:
   ```ts
   export default defineConfig({
     base: '/menopause-companion/',
     plugins: [react()],
   })
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to the `gh-pages` branch.

## 👨‍💻 Developer

Designed and Developed by **MrV006**.

- **GitHub**: [github.com/MrV006](https://github.com/MrV006)
- **Contact**: 09902076468

---
*© 2024 Menopause Companion. All rights reserved.*
