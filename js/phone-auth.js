import { auth } from './firebase.js';
import { RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
let verifier;
export function normalizePhone(value){const n=String(value).replace(/[\s()-]/g,'');if(!/^(?:\+91)?[6-9]\d{9}$/.test(n))throw Error('Enter a valid Indian mobile number.');return n.startsWith('+91')?n:'+91'+n;}
export async function sendOtp(phone,container){if(verifier)verifier.clear();verifier=new RecaptchaVerifier(auth,container,{size:'normal'});try{return await signInWithPhoneNumber(auth,normalizePhone(phone),verifier);}catch(e){verifier.clear();verifier=null;throw e;}}
export {auth,signOut};
