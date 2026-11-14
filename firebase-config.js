// Firebase Web SDK configuration for the Stratos Global project.
// This config is intended for client-side use; protect your data with Firebase Security Rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJ2KQskok35B0s7i9YkuUAvXgTbpo3n8M",
  authDomain: "stratos-global-edu.firebaseapp.com",
  projectId: "stratos-global-edu",
  storageBucket: "stratos-global-edu.firebasestorage.app",
  messagingSenderId: "624610729269",
  appId: "1:624610729269:web:436da7b3e46a5b7de7c07c",
  measurementId: "G-HYZJ8YM99H"
};

const app = initializeApp(firebaseConfig);

// Analytics is only available in supported browser environments (for example, not file://).
const analytics = (await isSupported()) ? getAnalytics(app) : null;

export { app, analytics, firebaseConfig };
