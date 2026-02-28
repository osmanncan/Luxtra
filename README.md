<h1 align="center">
  <img src="./assets/images/icon.png" alt="Luxtra Logo" width="120">
  <br>Luxtra
</h1>

<p align="center">
  <b>Your Private Life Assistant</b><br>
  Manage your finances, daily responsibilities, and insightful AI features seamlessly in one sleek application.
</p>

## ✨ Features

- 💸 **Expense Tracking & Financial Control:** Log your income and expenses clearly. View insightful analytics to plan your financial stability.
- 🤖 **Gemini AI Integration:** Get instant personalized insights about your spending and daily plans powered by Google's Gemini.
- 📆 **Responsibility Management:** Never forget a subscription or daily task thanks to integrated timelines and reminders.
- 🌍 **Multi-Language Support:** Available in 8+ languages including English, Turkish, Spanish, and more!
- 🔒 **Biometric Security:** FaceID & Fingerprint protection to keep your personal data strictly private.
- 🎨 **Premium Aesthetic & Gamification:** Unlock achievements while experiencing beautifully animated gradients and micro-interactions.

## 🛠 Tech Stack

- **Framework:** [React Native](https://reactnative.dev) / [Expo](https://expo.dev/) 
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **State/Storage:** [Zustand](https://github.com/pmndrs/zustand) & [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)

### ☁️ Serverless Backend Architecture
- **Database (BaaS):** [Supabase (PostgreSQL)](https://supabase.com/) with strict Row Level Security (RLS) policies.
- **Edge Functions (Deno):**
  - `handle-revenuecat-webhook`: Securely verifies JWT/Authorization headers and syncs Apple/Google subscription events to user metadata.
  - `handle-ai-chat`: Acts as a secure proxy and quota manager for AI requests, protecting private API keys and preventing billing exhaustion.
- **AI Service:** [Google Gemini 1.5 Pro](https://ai.google.dev/) (Routed through Edge Functions)
- **Payments:** [RevenueCat](https://www.revenuecat.com/) for cross-platform subscription management.
- **Auth:** Supabase Auth (Asymmetric Encrypted Passwords + Magic Links/Deep Linking via `expo-linking`)

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables by creating a `.env` file with your own API keys for Supabase, RevenueCat, and Google Gemini AI.

4. Run the development server:
   ```bash
   npx expo start
   ```

## 🛡️ Security Note
This public repository does not contain `.env` files or sensitive API keys. Ensure that you never commit your production secrets.

## 📄 License
All rights reserved © 2026 Luxtra. 
