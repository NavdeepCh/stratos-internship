import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from "./firebase.js";
import { signOutStudent } from "./auth.js";

export function renderPortalNav() {
  const targets = document.querySelectorAll("[data-student-nav]");
  if (!targets.length) return;

  onAuthStateChanged(auth, (user) => {
    targets.forEach((target) => {
      if (user && !user.isAnonymous) {
        target.innerHTML = `
          <a href="/my-internships" class="button button-green py-2.5 px-5">My Internships</a>
          <button type="button" data-sign-out class="button button-outline !border-[var(--line)] !text-[var(--ink)] py-2.5 px-4">Sign Out</button>`;
        target.querySelector("[data-sign-out]").addEventListener("click", signOutStudent);
      } else {
        target.innerHTML = `<a href="/sign-in" class="button button-outline !border-[var(--line)] !text-[var(--ink)] py-2.5 px-4">Sign In</a>`;
      }
    });
  });
}
