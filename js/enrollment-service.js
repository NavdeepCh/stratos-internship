import { collection, doc, getDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { db } from "./firebase.js";
const orders = collection(db,"artifacts","stratos-global-edu","public","data","orders");
function normalize(item) {
 const d=item.data(); return {...d,registrationId:item.id,track:d.domainName||d.track,category:d.categoryName||d.categoryId||"Instant Internship",certificateStatus:d.completionCertificateStatus||d.certificateStatus};
}
export async function getStudentEnrollments(user) {
 const snapshot=await getDocs(query(orders,where("userId","==",user.uid)));
 return snapshot.docs.map(normalize);
}
export async function getEnrollment(user,id) {
 if(!/^SGE-\d{2}-INT-\d{6}$/.test(id)) return null;
 const item=await getDoc(doc(orders,id));
 return item.exists() && item.data().userId===user.uid ? normalize(item):null;
}
export const escapeHtml = value => String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
export function safeFormUrl(value) { try {const u=new URL(value);return u.protocol==="https:" && (u.hostname==="forms.gle" || (u.hostname==="docs.google.com" && u.pathname.startsWith("/forms/"))) ? u.href : "";}catch{return "";} }
