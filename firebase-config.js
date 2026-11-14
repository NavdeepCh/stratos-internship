// Firebase Web SDK configuration for the Stratos Global project.
// This browser config is public by design. Protect database data with Firebase Security Rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJ2KQskok35B0s7i9YkuUAvXgTbpo3n8M",
  authDomain: "stratos-global-edu.firebaseapp.com",
  projectId: "stratos-global-edu",
  storageBucket: "stratos-global-edu.firebasestorage.app",
  messagingSenderId: "624610729269",
  appId: "1:624610729269:web:436da7b3e46a5b7de7c07c",
  measurementId: "G-HYZJ8YM99H"
};

// Reuse the same named app from both config and page modules.
const app = initializeApp(firebaseConfig, "stratos-global-edu");
const db = getFirestore(app);

// Analytics is only available in supported browser environments (for example, not file://).
const analytics = isSupported().then((supported) => supported ? getAnalytics(app) : null);

export { app, analytics, db, firebaseConfig };
