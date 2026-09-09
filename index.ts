import { createClient } from 'npm:@supabase/supabase-js@2.55.0';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'};
const json=(body:any,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
 try{
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{autoRefreshToken:false,persistSession:false}});
  const token=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
  if(!token)return json({error:'Authentication required'},401);
  const {data:me,error:ae}=await admin.auth.getUser(token); if(ae||!me.user)return json({error:'Authentication required'},401);
  const caller=String(me.user.email||'').trim().toLowerCase();
  const {data:site,error:se}=await admin.from('site_settings').select('primary_owner_email').eq('id',1).single(); if(se)throw se;
  const primary=String(site?.primary_owner_email||'Editorgaadu@gmail.com').trim().toLowerCase();
  const {data:cp,error:ce}=await admin.from('profiles').select('role').eq('id',me.user.id).maybeSingle(); if(ce)throw ce;
  const role=String(cp?.role||'').trim().toLowerCase();
  const body=await req.json().catch(()=>({})); const action=String(body.action||'').trim();
  const isOwner = caller===primary || role==='owner';
  if((action==='list'||action==='list-customers') && !isOwner)return json({error:'Owner access required'},403);
  async function ensureOwner(email:string){
    const f=await admin.auth.admin.getUserByEmail(email); let u=f.data?.user;
    if(!u){const temp='CoOwner-'+crypto.randomUUID()+'-Aa9!';const c=await admin.auth.admin.createUser({email,password:temp,email_confirm:true,user_metadata:{invited_by:primary}});if(c.error)throw c.error;u=c.user;}
    const p=await admin.from('profiles').upsert({id:u.id,role:'owner',full_name:email.split('@')[0]},{onConflict:'id'});if(p.error)throw p.error;return u;
  }
  if(action==='list'){
    const autoAdded:string[]=[];
    for(const email of ['yaminijasti12@gmail.com','sagar.m399791@gmail.com']){
      const f=await admin.auth.admin.getUserByEmail(email);
      if(!f.data?.user){await ensureOwner(email);autoAdded.push(email);} else {const p=await admin.from('profiles').upsert({id:f.data.user.id,role:'owner',full_name:email.split('@')[0]},{onConflict:'id'});if(p.error)throw p.error;}
    }
    const {data:profiles,error:pe}=await admin.from('profiles').select('id,role,full_name,phone,created_at').in('role',['owner','worker']).order('created_at');if(pe)throw pe;
    const {data:us,error:ue}=await admin.auth.admin.listUsers({page:1,perPage:1000});if(ue)throw ue;const users=us?.users||[];
    const staff=(profiles||[]).map((p:any)=>({...p,email:users.find((u:any)=>u.id===p.id)?.email||''}));
    return json({staff,primary_owner_email:primary,additional_owner_limit:3,additional_owner_count:staff.filter((x:any)=>x.role==='owner'&&x.email.toLowerCase()!==primary).length,autoAdded});
  }
  if(action==='list-customers'){
    const {data:profiles,error:pe}=await admin.from('profiles').select('id,full_name,phone,created_at').eq('role','customer').order('created_at',{ascending:false});if(pe)throw pe;
    const {data:us,error:ue}=await admin.auth.admin.listUsers({page:1,perPage:1000});if(ue)throw ue;const users=us?.users||[];
    return json({customers:(profiles||[]).map((p:any)=>{const u=users.find((x:any)=>x.id===p.id);return{id:p.id,email:u?.email||'',full_name:p.full_name||'',phone:p.phone||'',created_at:p.created_at||u?.created_at||''}})});
  }
  if(caller!==primary || role!=='owner')return json({error:'Only the Primary Owner can manage owners and workers'},403);
  if(action==='invite'){
    const email=String(body.email||'').trim().toLowerCase(), r=String(body.role||'worker').trim().toLowerCase();
    if(!email||!['owner','worker'].includes(r))return json({error:'Valid email and role are required'},400);
    if(r==='owner'){const {data:o,error:oe}=await admin.from('profiles').select('id').eq('role','owner');if(oe)throw oe;if((o||[]).filter((x:any)=>x.id!==me.user.id).length>=3)return json({error:'Maximum of 3 additional owners has been reached'},400);}
    let f=await admin.auth.admin.getUserByEmail(email),u=f.data?.user;
    if(!u){const temp='Staff-'+crypto.randomUUID()+'-Bb8!';const c=await admin.auth.admin.createUser({email,password:temp,email_confirm:true});if(c.error)throw c.error;u=c.user;}
    const p=await admin.from('profiles').upsert({id:u.id,role:r,full_name:email.split('@')[0]},{onConflict:'id'});if(p.error)throw p.error;
    return json({ok:true,email,role:r,message:`${email} added as ${r}. Use Password Reset to set the login password.`});
  }
  if(action==='remove'){const email=String(body.email||'').trim().toLowerCase();if(!email)return json({error:'Email is required'},400);if(email===primary)return json({error:'Primary Owner cannot be removed'},403);const f=await admin.auth.admin.getUserByEmail(email);if(f.error||!f.data.user)return json({error:'User not found'},404);const p=await admin.from('profiles').update({role:'customer'}).eq('id',f.data.user.id);if(p.error)throw p.error;return json({message:'Access removed'});}
  return json({error:'Unsupported action'},400);
 }catch(e:any){return json({error:e?.message||'Unexpected error'},500)}
});
