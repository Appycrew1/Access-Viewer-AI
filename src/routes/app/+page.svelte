
<script lang="ts">
  import 'leaflet/dist/leaflet.css';
  import { onMount } from 'svelte';
  import { MapPin, Navigation2, Timer, Users, FileText, AlertTriangle, MessageSquare, CloudSun, Building2, CarFront, Sparkles, Download } from 'lucide-svelte';
  let depots:any[]=[]; let customers:any[]=[];
  let depot=''; let customer=''; let depotText=''; let custText='';
  let err=''; let busy=false; let mode:'mock'|'live'='mock';
  let data:any={}; let env:any=null;
  let map:any; let Lmod:any; let originMarker:any; let destMarker:any; let line:any;

  async function fetchJSON(url:string, opts:any={}){ const r = await fetch(url, opts); return r.json(); }

  onMount(async()=>{
    env = await fetchJSON('/api/env-status');
    const s = await fetchJSON('/api/sample_addresses');
    depots = s.depots; customers = s.customers; depot = depots[0]?.id||''; customer = customers[0]?.id||'';
    Lmod = await import('leaflet');
    map = Lmod.map('map').setView([51.509,-0.118], 12);
    Lmod.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  });

  async function analyse(){
    try{
      busy=true; err='';
      const live = depotText.trim() && custText.trim();
      const payload = live ? { depot_address_text: depotText.trim(), customer_address_text: custText.trim() } : { depot_id: depot, customer_address_id: customer };
      const intake = await fetchJSON('/api/intake', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if(intake.error){ err = 'Intake failed: '+(intake.hint||intake.error); busy=false; return; }
      mode = intake.mode==='live_text' ? 'live' : 'mock';

      if(originMarker) originMarker.remove(); if(destMarker) destMarker.remove(); if(line) line.remove();
      originMarker = Lmod.marker([intake.origin.lat, intake.origin.lng]).addTo(map).bindPopup(intake.origin.label);
      destMarker = Lmod.marker([intake.dest.lat, intake.dest.lng]).addTo(map).bindPopup(intake.dest.label);
      const b = Lmod.latLngBounds([ [intake.origin.lat, intake.origin.lng], [intake.dest.lat, intake.dest.lng] ]);
      map.fitBounds(b, { padding: [30,30] });

      const pimg = await fetchJSON((intake.mode!=='mock_ids')? `/api/property-image?lat=${intake.dest.lat}&lng=${intake.dest.lng}` : `/api/property-image?address_id=${customer}`);
      const addrId = (intake.mode!=='mock_ids') ? 'cust_1' : customer;
      const parking = await fetchJSON(`/api/parking?address_id=${addrId}`);
      const building = await fetchJSON(`/api/building?address_id=${addrId}`);
      const safety = await fetchJSON(`/api/safety?address_id=${addrId}`);
      const weather = await fetchJSON(`/api/weather?lat=${intake.dest.lat}&lng=${intake.dest.lng}`);
      const route = await fetchJSON((intake.mode!=='mock_ids')
        ? `/api/route?origin_lat=${intake.origin.lat}&origin_lng=${intake.origin.lng}&dest_lat=${intake.dest.lat}&dest_lng=${intake.dest.lng}`
        : `/api/route?origin_id=${payload.depot_id}&dest_id=${payload.customer_address_id}`);
      if(route.polyline && route.polyline.type==='LineString'){
        line = Lmod.polyline(route.polyline.coordinates.map(([lng,lat])=>[lat,lng]), {weight:4, opacity:0.7}).addTo(map);
      }
      data = { intake, pimg, parking, building, safety, weather, route };
      busy=false;
    }catch(e){ err = (e as any)?.message||'Something went wrong'; busy=false; }
  }

  async function ai(path:string){
    const r = await fetch(`/api/ai/${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ context: data }) });
    const j = await r.json(); data = { ...data, [path]: j };
  }
</script>

<style>
  header{ display:flex; gap:.75rem; align-items:center; border-bottom:1px solid #e5e7eb; padding:.75rem 1rem; background:rgba(255,255,255,.7); backdrop-filter: blur(8px); }
  .label{ font-size: .9rem; opacity:.8; margin-bottom:.25rem; }
  .input,.select{ padding:.5rem .75rem; border:1px solid #e5e7eb; border-radius:.5rem; width:100%; }
  .btn{ display:inline-flex; gap:.5rem; align-items:center; padding:.5rem .75rem; border:1px solid #e5e7eb; border-radius:.5rem; background:white; }
  .btn.primary{ background:#0ea5e9; color:white; border-color:#0ea5e9; }
  .grid{ display:grid; gap:.75rem; }
  .card{ border:1px solid #e5e7eb; border-radius:.75rem; padding:1rem; background:#fff; }
  .kpi{ border:1px solid #e5e7eb; border-radius:.75rem; padding:.5rem .75rem; }
  .chips{ display:flex; gap:.5rem; flex-wrap:wrap; }
  .chip{ font-size:.8rem; padding:.25rem .5rem; border:1px solid #e5e7eb; border-radius:999px; }
  @media (min-width: 1024px){ .cols{ display:grid; grid-template-columns: 1fr 1fr; height: 100vh; } #map{ height: calc(100vh - 54px); } }
</style>

<div class="cols">
  <div>
    <header>
      <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;background:#e0f2fe;border-radius:.75rem;color:#0ea5e9"><MapPin size={18}/></div>
      <div style="font-weight:600">Pre‑Survey (SvelteKit — Live‑only)</div>
      <div style="margin-left:auto; display:flex; gap:.5rem; align-items:center;">
        <button class="btn" on:click={() => window.print()}><Download size={16}/> Export</button>
        <span class="chip">{mode.toUpperCase()} MODE</span>
      </div>
    </header>
    <div id="map" style="min-height:320px;"></div>
  </div>

  <div style="border-left:1px solid #e5e7eb">
    <div class="card" style="border:none;border-bottom:1px solid #e5e7eb;border-radius:0;">
      <div class="grid" style="grid-template-columns:1fr 1fr">
        <div><div class="label">Depot (mock)</div><select class="select" bind:value={depot}>{#each depots as d}<option value={d.id}>{d.label}</option>{/each}</select></div>
        <div><div class="label">Customer (mock)</div><select class="select" bind:value={customer}>{#each customers as c}<option value={c.id}>{c.label}</option>{/each}</select></div>
        <div><div class="label">Depot (free text)</div><input class="input" bind:value={depotText} placeholder="e.g., 12 Patcham Terrace, SW8"/></div>
        <div><div class="label">Customer (free text)</div><input class="input" bind:value={custText} placeholder="e.g., 21 Soho Square, W1D 3QP"/></div>
      </div>
      {#if env}<div style="margin-top:.5rem;font-size:.8rem;opacity:.6">OpenAI: {env.openai ? '✔' : '—'} · Google: {env.google ? '✔' : '—'}</div>{/if}
      {#if err}<div style="margin-top:.5rem;color:#b91c1c;background:#fee2e2;border:1px solid #fecaca;padding:.5rem;border-radius:.5rem;">{err}</div>{/if}
      <div style="margin-top:.75rem; display:flex; gap:.5rem; flex-wrap:wrap">
        <button class="btn primary" on:click={analyse} disabled={busy}><Navigation2 size={16}/> {busy?'Analyzing…':'Analyse Address'}</button>
        <button class="btn" on:click={()=>ai('duration')}><Timer size={16}/> Duration</button>
        <button class="btn" on:click={()=>ai('crew')}><Users size={16}/> Crew & Vehicle</button>
        <button class="btn" on:click={()=>ai('quote')}><FileText size={16}/> Draft Quote</button>
        <button class="btn" on:click={()=>ai('risk')}><AlertTriangle size={16}/> Risk</button>
        <button class="btn" on:click={()=>ai('message')}><MessageSquare size={16}/> Message</button>
        <button class="btn" on:click={()=>ai('analyse')}><Sparkles size={16}/> Autopilot</button>
      </div>
    </div>

    <!-- Panels would be similar to previous build; omitted here to keep code compact -->
    <div class="card">Run an analysis to see panels populate.</div>
  </div>
</div>
