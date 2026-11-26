// New category API contract. Never fall back to the legacy Instant checkout.
export const apiBase = 'https://stratos-register.stratos-global.workers.dev';
export async function capabilities(fetcher=fetch) {
  try { const r=await fetcher(`${apiBase}/capabilities`,{cache:'no-store'}); if(!r.ok)return null; const c=await r.json(); return c.schemaVersion===2 && c.categoryEnrollment===true ? c:null; } catch{return null;}
}
export function applicationPayload(category,domain,plan,fields) {
 if(category.id==='instant'||!category.domains.some(d=>d.id===domain?.id)||!category.plans.some(p=>p.id===plan?.id))throw Error('Select a valid domain and plan.');
 const fullName=String(fields.fullName||'').trim(), phone=String(fields.phone||'').trim();
 if(fullName.length<2||fullName.length>100||!/^\+91[6-9]\d{9}$/.test(phone))throw Error('Enter your name and Indian phone number with +91.');
 return {categoryId:category.id,domainId:domain.id,planId:plan.id,fullName,phone};
}
