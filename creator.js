(() => {
  const cfg = window.CHILLOUT_CONFIG || {};
  const supabase = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const $ = id => document.getElementById(id);
  let cafes = [], selectedCafe = null;
  const loginView=$('loginView'), dashboardView=$('dashboardView');
  function msg(el,text){el.textContent=text||''}
  async function creatorCall(action, body={}){
    const {data:{session}}=await supabase.auth.getSession();
    if(!session) throw new Error('Session expired. Please sign in again.');
    const res=await fetch(`${cfg.SUPABASE_URL}/functions/v1/creator-platform`,{method:'POST',headers:{Authorization:`Bearer ${session.access_token}`,apikey:cfg.SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({action,...body})});
    const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data.error||'Request failed'); return data;
  }
  function showLogin(){loginView.classList.remove('hidden');dashboardView.classList.add('hidden')}
  function showDash(email){loginView.classList.add('hidden');dashboardView.classList.remove('hidden');$('creatorEmail').textContent=email||'';loadCafes()}
  async function checkSession(){const {data:{session}}=await supabase.auth.getSession(); if(!session){showLogin();return} try{const r=await creatorCall('session');showDash(r.creator.email)}catch(e){await supabase.auth.signOut();showLogin();msg($('loginMsg'),e.message)}}
  $('loginForm').addEventListener('submit',async e=>{e.preventDefault();msg($('loginMsg'),'Signing in…');const {error}=await supabase.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){msg($('loginMsg'),error.message);return}try{const r=await creatorCall('session');showDash(r.creator.email);msg($('loginMsg'),'')}catch(err){await supabase.auth.signOut();msg($('loginMsg'),err.message)}});
  $('forgot').addEventListener('click',async()=>{const email=$('email').value.trim();if(!email){msg($('loginMsg'),'Enter your creator email first.');return}const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/creator.html'});msg($('loginMsg'),error?error.message:'If that account exists, a reset email has been sent.')});
  $('logout').addEventListener('click',async()=>{await supabase.auth.signOut();showLogin()});
  $('refresh').addEventListener('click',loadCafes); $('search').addEventListener('input',render); $('statusFilter').addEventListener('change',render); $('activeFilter').addEventListener('change',render);
  async function loadCafes(){try{const r=await creatorCall('list-cafes');cafes=r.cafes||[];render()}catch(e){msg($('dashMsg'),e.message)}}
  function filtered(){const q=$('search').value.toLowerCase().trim(),s=$('statusFilter').value,a=$('activeFilter').value;return cafes.filter(c=>(!q||[c.name,c.slug,c.email,c.phone].some(x=>String(x||'').toLowerCase().includes(q)))&&(s==='all'||c.verification_status===s)&&(a==='all'||(a==='active')===!!c.is_active))}
  function render(){const list=filtered();$('stats').innerHTML=[['Total',cafes.length],['Pending',cafes.filter(c=>c.verification_status==='pending').length],['Approved',cafes.filter(c=>c.verification_status==='approved').length],['Inactive',cafes.filter(c=>!c.is_active).length]].map(x=>`<div class="stat"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');if(!list.length){$('tableWrap').innerHTML='<div class="empty">No cafés match the current filters.</div>';return}$('tableWrap').innerHTML=`<table class="table"><thead><tr><th>Café</th><th>Owner ID</th><th>Contact</th><th>Verification</th><th>Activity</th><th>Actions</th></tr></thead><tbody>${list.map(c=>`<tr><td><strong>${esc(c.name)}</strong><br><small>${esc(c.slug)}</small></td><td><small>${esc(c.owner_user_id)}</small></td><td>${esc(c.email||'—')}<br>${esc(c.phone||'')}</td><td><span class="badge ${c.verification_status}">${esc(c.verification_status)}</span></td><td><span class="badge ${c.is_active?'approved':'inactive'}">${c.is_active?'active':'inactive'}</span></td><td><div class="actions"><button data-verify="${c.id}">Verify</button><button data-active="${c.id}" data-value="${!c.is_active}">${c.is_active?'Deactivate':'Activate'}</button></div></td></tr>`).join('')}</tbody></table>`;document.querySelectorAll('[data-verify]').forEach(b=>b.onclick=()=>openVerify(cafes.find(c=>c.id===b.dataset.verify)));document.querySelectorAll('[data-active]').forEach(b=>b.onclick=()=>setActive(b.dataset.active,b.dataset.value==='true'))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function openVerify(c){selectedCafe=c;$('verifyName').textContent=c.name;$('verifyDetails').textContent=`${c.email||'No email'} • ${c.phone||'No phone'} • current status: ${c.verification_status}`;$('verifyStatus').value=c.verification_status;$('verifyMsg').textContent='';$('verifyDialog').showModal()}
  $('verifyForm').addEventListener('submit',async e=>{e.preventDefault();if(!selectedCafe)return;try{await creatorCall('verify-cafe',{cafe_id:selectedCafe.id,status:$('verifyStatus').value});$('verifyDialog').close();await loadCafes();msg($('dashMsg'),`${selectedCafe.name} verification updated.`)}catch(e){msg($('verifyMsg'),e.message)}});$('cancelVerify').onclick=()=>$('verifyDialog').close();$('closeDialog').onclick=()=>$('verifyDialog').close();
  async function setActive(id,value){try{await creatorCall('set-active',{cafe_id:id,is_active:value});await loadCafes()}catch(e){msg($('dashMsg'),e.message)}}
  supabase.auth.onAuthStateChange((_event,session)=>{if(!session)showLogin()}); checkSession();
})();
