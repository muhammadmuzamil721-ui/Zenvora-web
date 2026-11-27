/* Zenvora service worker: always fresh online, cached copy offline */
const CACHE='zenvora-v1';
self.addEventListener('install',e=>{ self.skipWaiting(); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{ const ks=await caches.keys(); await Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))); await self.clients.claim(); })()); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url); if(u.origin!==self.location.origin) return;
  e.respondWith((async()=>{
    try{ const res=await fetch(r,{cache:'no-cache'}); if(res&&res.ok){ const c=await caches.open(CACHE); c.put(r,res.clone()); } return res; }
    catch(err){ const hit=await caches.match(r,{ignoreSearch:true}); if(hit) return hit; if(r.mode==='navigate'){ const idx=await caches.match('./',{ignoreSearch:true})||await caches.match('index.html',{ignoreSearch:true}); if(idx) return idx; } throw err; }
  })());
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil((async()=>{ const all=await self.clients.matchAll({type:'window',includeUncontrolled:true}); for(const c of all){ if('focus' in c) return c.focus(); } return self.clients.openWindow('./'); })());
});
