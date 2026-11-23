import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, sendSignInLinkToEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCJ2KQskok35B0s7i9YkuUAvXgTbpo3n8M",
  authDomain: "stratos-global-edu.firebaseapp.com",
  projectId: "stratos-global-edu",
  storageBucket: "stratos-global-edu.firebasestorage.app",
  messagingSenderId: "624610729269",
  appId: "1:624610729269:web:436da7b3e46a5b7de7c07c",
  measurementId: "G-HYZJ8YM99H"
};

export const app = initializeApp(firebaseConfig, "stratos-portal");
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function sendPasswordlessLink(email) {
  await sendSignInLinkToEmail(auth, email, {
    url: `${window.location.origin}/sign-in`,
    handleCodeInApp: true
  });
  sessionStorage.setItem("stratosSignInEmail", email);
}

export async function completePasswordlessSignIn() {
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;
  let email = sessionStorage.getItem("stratosSignInEmail");
  if (!email) email = window.prompt("Enter your registered email address:");
  if (!email) throw new Error("Email is required to complete sign-in.");
  const credential = await signInWithEmailLink(auth, email, window.location.href);
  sessionStorage.removeItem("stratosSignInEmail");
  return credential.user;
}
