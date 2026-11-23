import { collection, doc, getDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from "./firebase.js";

export async function getStudentEnrollments(user) {
  const snapshot = await getDocs(query(
    collection(db, "enrollments"),
    where("studentUid", "==", user.uid)
  ));
  return snapshot.docs.map((item) => ({ registrationId: item.id, ...item.data() }));
}

export async function getEnrollment(user, registrationId) {
  if (!/^SGE-\d{2}-INT-\d{6}$/.test(registrationId)) return null;
  const snapshot = await getDoc(doc(db, "enrollments", registrationId));
  if (!snapshot.exists()) return null;
  const enrollment = snapshot.data();
  if (enrollment.studentUid !== user.uid) return null;
  return { registrationId: snapshot.id, ...enrollment };
}
