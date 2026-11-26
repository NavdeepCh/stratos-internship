import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from "./firebase.js";

export function requireStudent(onReady) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user || user.isAnonymous || !user.emailVerified) {
      window.location.replace("/sign-in");
      return;
    }
    onReady(user);
  });
}

export async function signOutStudent() {
  await signOut(auth);
  window.location.replace("/");
}
