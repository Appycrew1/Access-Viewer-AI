'use client'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapPin, Navigation2, Sparkles, Download, CloudSun, Shield, CarFront, Building2, Timer, Users, FileText, AlertTriangle, MessageSquare } from 'lucide-react'

type Depot = { id:string,label:string }
type Customer = { id:string,label:string }
type Intake = { origin:{lat:number,lng:number,label:string}, dest:{lat:number,lng:number,label:string}, mode:string, error?:string, hint?:string }

export default function Page(){
  const mapRef = useRef<L.Map|null>(null)
  const originRef = useRef<L.Marker|null>(null)
  const destRef = useRef<L.Marker|null>(null)
  const lineRef = useRef<L.Polyline|null>(null)
  const [depots,setDepots] = useState<Depot[]>([])
  const [customers,setCustomers] = useState<Customer[]>([])
  const [depot,setDepot] = useState(''); const [customer,setCustomer] = useState('')
  const [depotText,setDepotText] = useState(''); const [custText,setCustText] = useState('')
  const [err,setErr] = useState(''); const [mode,setMode] = useState<'mock'|'sandbox'|'live'>('mock')
  const [busy,setBusy] = useState(false)
  const [data,setData] = useState<any>({})

  useEffect(()=>{
    (async()=>{
      const L = await import('leaflet')
      if(!mapRef.current){
        const m = L.map('map').setView([51.509,-0.118], 12)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap' }).addTo(m)
        mapRef.current = m
      }
      const r = await fetch('/api/sample_addresses').then(r=>r.json())
      setDepots(r.depots); setCustomers(r.customers)
      setDepot(r.depots[0]?.id||''); setCustomer(r.customers[0]?.id||'')
    })()
  }, [])

  async function analyse(){
    try{
      setBusy(true); setErr('')
      const live = depotText.trim() && custText.trim()
      const payload = live ? { depot_address_text: depotText.trim(), customer_address_text: custText.trim() } : { depot_id: depot, customer_address_id: customer }
      const intake: Intake = await fetch('/api/intake', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(r=>r.json())
      if((intake as any).error){ setErr('Intake failed: '+((intake as any).hint||(intake as any).error)); setBusy(false); return }
      setMode(intake.mode==='live_text' ? 'live' : (intake.mode==='sandbox_text' ? 'sandbox' : 'mock'))
      const L = await import('leaflet'); const map = mapRef.current!
      if(originRef.current) originRef.current.remove(); if(destRef.current) destRef.current.remove(); if(lineRef.current) lineRef.current.remove();
      originRef.current = L.marker([intake.origin.lat, intake.origin.lng]).addTo(map).bindPopup(intake.origin.label)
      destRef.current   = L.marker([intake.dest.lat, intake.dest.lng]).addTo(map).bindPopup(intake.dest.label)
      const bounds = L.latLngBounds([ [intake.origin.lat, intake.origin.lng], [intake.dest.lat, intake.dest.lng] ])
      map.fitBounds(bounds, {padding:[30,30]})

      const pimg = await fetch((intake.mode!=='mock_ids')? `/api/property-image?lat=${intake.dest.lat}&lng=${intake.dest.lng}` : `/api/property-image?address_id=${customer}`).then(r=>r.json())
      const addrId = (intake.mode!=='mock_ids') ? 'cust_1' : customer
      const parking = await fetch(`/api/parking?address_id=${addrId}`).then(r=>r.json())
      const building = await fetch(`/api/building?address_id=${addrId}`).then(r=>r.json())
      const safety = await fetch(`/api/safety?address_id=${addrId}`).then(r=>r.json())
      const weather = await fetch(`/api/weather?lat=${intake.dest.lat}&lng=${intake.dest.lng}`).then(r=>r.json())
      const route = await fetch((intake.mode!=='mock_ids')
        ? `/api/route?origin_lat=${intake.origin.lat}&origin_lng=${intake.origin.lng}&dest_lat=${intake.dest.lat}&dest_lng=${intake.dest.lng}`
        : `/api/route?origin_id=${(payload as any).depot_id}&dest_id=${(payload as any).customer_address_id}`
      ).then(r=>r.json())
      if(route.polyline && route.polyline.type==='LineString'){
        lineRef.current = (await import('leaflet')).polyline(route.polyline.coordinates.map(([lng,lat]:[number,number])=>[lat,lng]), {weight:4, opacity:0.7}).addTo(map)
      }
      setData({ intake, pimg, parking, building, safety, weather, route })
      setBusy(false)
    }catch(e:any){ setErr(e?.message||'Something went wrong'); setBusy(false) }
  }

  async function ai(path:string){
    const ctx = { ...data }
    const r = await fetch(`/api/ai/${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ context: ctx }) })
    const j = await r.json()
    setData((prev:any)=> ({ ...prev, [path]: j }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
      <div className="flex flex-col">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand"><MapPin size={18}/></span>
          <div className="font-semibold">Pre‑Survey Add‑on</div>
          <div className="text-sm opacity-60">Next.js • Tailwind • AI‑ready</div>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn no-print" onClick={()=>window.print()}><Download size={16}/> Export PDF</button>
            <span className="text-xs px-2 py-1 rounded-full border">{mode.toUpperCase()} MODE</span>
          </div>
        </header>
        <div id="map" className="flex-1 min-h-[320px]"></div>
      </div>

      <div className="flex flex-col border-l">
        <div className="p-4 border-b bg-white/70 dark:bg-zinc-900/60 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><div className="label mb-1">Depot (mock)</div><select className="select" value={depot} onChange={e=>setDepot(e.target.value)}>{depots.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}</select></div>
            <div><div className="label mb-1">Customer (mock)</div><select className="select" value={customer} onChange={e=>setCustomer(e.target.value)}>{customers.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
            <div><div className="label mb-1">Depot (free text)</div><input className="input" value={depotText} onChange={e=>setDepotText(e.target.value)} placeholder="e.g., 12 Patcham Terrace, SW8"/></div>
            <div><div className="label mb-1">Customer (free text)</div><input className="input" value={custText} onChange={e=>setCustText(e.target.value)} placeholder="e.g., 21 Soho Square, W1D 3QP"/></div>
          </div>
          {err && <div className="mt-3 text-sm px-3 py-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 dark:bg-rose-900/20 dark:border-rose-700 dark:text-rose-200">{err}</div>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-primary px-4 py-2 rounded-lg" onClick={analyse} disabled={busy}><Navigation2 size={16}/> {busy?'Analyzing…':'Analyse Address'}</button>
            <button className="btn px-3 py-2 rounded-lg" onClick={()=>ai('duration')}><Timer size={16}/> Duration</button>
            <button className="btn px-3 py-2 rounded-lg" onClick={()=>ai('crew')}><Users size={16}/> Crew & Vehicle</button>
            <button className="btn px-3 py-2 rounded-lg" onClick={()=>ai('quote')}><FileText size={16}/> Draft Quote</button>
            <button className="btn px-3 py-2 rounded-lg" onClick={()=>ai('risk')}><AlertTriangle size={16}/> Risk Summary</button>
            <button className="btn px-3 py-2 rounded-lg" onClick={()=>ai('message')}><MessageSquare size={16}/> Customer Message</button>
            <button className="btn px-3 py-2 rounded-lg" onClick={()=>ai('analyse')}><Sparkles size={16}/> AI Autopilot</button>
          </div>
          <div className="text-xs opacity-60 mt-2">Fill both free‑text boxes to use SANDBOX/LIVE; leave empty to use MOCK.</div>
        </div>

        <div className="p-4 overflow-y-auto">
          {data.pimg && (<section className="card"><div className="flex items-center gap-2 mb-3"><Building2 size={16}/><h3 className="font-semibold">Property</h3><span className="ml-auto text-xs opacity-60">{data.pimg.source}</span></div><div className="grid grid-cols-2 gap-3"><img id="streetImg" alt="Street view" src={data.pimg.image_url} className="rounded-lg border"/><img id="satImg" alt="Satellite" src={data.pimg.satellite_url} className="rounded-lg border"/></div><div className="chips mt-3"><span className="chip">Type: {data.pimg.type_guess||'unknown'}</span></div></section>)}
          {data.parking && (<section className="card mt-3"><div className="flex items-center gap-2 mb-3"><CarFront size={16}/><h3 className="font-semibold">Parking & Kerbside</h3></div><div className="chips">{data.parking.cpz && <span className="chip chip-warn">CPZ: {data.parking.cpz}</span>}{data.parking.red_route && <span className="chip chip-warn">Red Route</span>}{data.parking.bus_lane && <span className="chip chip-warn">Bus Lane</span>}{(data.parking.bay_types||[]).map((b:string)=><span key={b} className="chip">Bay: {b}</span>)}</div><ul className="text-sm mt-2 list-disc pl-5">{(data.parking.restrictions||[]).map((r:string)=><li key={r}>{r}</li>)}</ul></section>)}
          {data.building && (<section className="card mt-3"><div className="flex items-center gap-2 mb-3"><Building2 size={16}/><h3 className="font-semibold">Building</h3></div><div className="grid grid-cols-2 md:grid-cols-5 gap-2"><div className="kpi"><b>Floors</b><span id="bFloors">{data.building.floors??'—'}</span></div><div className="kpi"><b>Lift</b><span id="bLift">{data.building.lift==null?'—':(data.building.lift?'Yes':'No')}</span></div><div className="kpi"><b>Door</b><span id="bDoor">{data.building.door_width_cm?data.building.door_width_cm+' cm':'—'}</span></div><div className="kpi"><b>Stairs</b><span id="bStair">{data.building.stair_width_cm?data.building.stair_width_cm+' cm':'—'}</span></div><div className="kpi"><b>Rear</b><span id="bRear">{data.building.rear_access==null?'—':(data.building.rear_access?'Yes':'No')}</span></div></div></section>)}
          {data.safety && (<section className="card mt-3"><div className="flex items-center gap-2 mb-3"><Shield size={16}/><h3 className="font-semibold">Safety / Risk</h3></div><div className="chips">{data.safety.width_restriction && <span className="chip chip-warn">Width: {data.safety.width_restriction}</span>}{data.safety.low_bridge && <span className="chip chip-warn">Low Bridge</span>}{data.safety.one_way && <span className="chip chip-warn">One-way</span>}{data.safety.steep_gradient && <span className="chip chip-warn">Steep</span>}{data.safety.crime_risk && <span className="chip">Crime risk: {data.safety.crime_risk}</span>}</div></section>)}
          {data.weather && (<section className="card mt-3"><div className="flex items-center gap-2 mb-3"><CloudSun size={16}/><h3 className="font-semibold">Weather</h3><span className="ml-auto text-xs opacity-60">{data.weather.source}</span></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="kpi"><b>Condition</b><span>{data.weather.condition??'—'}</span></div><div className="kpi"><b>Temp</b><span>{data.weather.temp_c!=null?data.weather.temp_c+' °C':'—'}</span></div><div className="kpi"><b>Wind</b><span>{data.weather.wind_kmh!=null?data.weather.wind_kmh+' km/h':'—'}</span></div><div className="kpi"><b>Precip</b><span>{data.weather.precip_chance_pct!=null?data.weather.precip_chance_pct+'%':'—'}</span></div></div>{(data.weather.impact||[]).length>0 && <ul className="text-sm mt-2 list-disc pl-5">{data.weather.impact.map((i:string)=><li key={i}>{i}</li>)}</ul>}</section>)}
          {data.route && (<section className="card mt-3"><div className="flex items-center gap-2 mb-3"><Navigation2 size={16}/><h3 className="font-semibold">Route</h3><span className="ml-auto text-xs opacity-60">{data.route.source}</span></div><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><div className="kpi"><b>Distance</b><span>{data.route.distance_km} km</span></div><div className="kpi"><b>ETA</b><span>{data.route.eta_minutes} min</span></div><div className="kpi"><b>Leave By</b><span>{data.route.leave_by||'—'}</span></div></div>{(data.route.incidents||[]).length>0 && <ul className="text-sm mt-2 list-disc pl-5">{data.route.incidents.map((i:string)=><li key={i}>{i}</li>)}</ul>}</section>)}

          {data.duration && (<section className="card mt-3"><div className="flex items-center gap-2 mb-2 text-brand"><Timer size={16}/><h3 className="font-semibold">AI: Duration</h3><span className="ml-auto text-xs opacity-60">{data.duration.source||'ai'}</span></div><div className="grid grid-cols-2 md:grid-cols-4 gap-2"><div className="kpi"><b>Estimated</b><span>{data.duration.estimated_minutes} min</span></div><div className="kpi"><b>Confidence</b><span>{data.duration.confidence_pct}%</span></div><div className="kpi"><b>Load</b><span>{data.duration.breakdown?.loading} min</span></div><div className="kpi"><b>Unload</b><span>{data.duration.breakdown?.unloading} min</span></div></div><ul className="text-sm mt-2 list-disc pl-5">{(data.duration.drivers||[]).map((d:string)=><li key={d}>{d}</li>)}</ul></section>)}
          {data.crew && (<section className="card mt-3"><div className="flex items-center gap-2 mb-2 text-brand"><Users size={16}/><h3 className="font-semibold">AI: Crew & Vehicle</h3></div><div className="grid grid-cols-2 md:grid-cols-3 gap-2"><div className="kpi"><b>Crew Size</b><span>{data.crew.crew_size}</span></div><div className="kpi"><b>Vehicle</b><span>{data.crew.vehicle}</span></div><div className="kpi"><b>Equipment</b><span>{(data.crew.equipment||[]).join(', ')}</span></div></div><ul className="text-sm mt-2 list-disc pl-5">{(data.crew.shift_notes||[]).map((d:string)=><li key={d}>{d}</li>)}</ul></section>)}
          {data.quote && (<section className="card mt-3"><div className="flex items-center gap-2 mb-2 text-brand"><FileText size={16}/><h3 className="font-semibold">AI: Draft Quote</h3></div><div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start"><div className="kpi"><b>Total</b><span>£{data.quote.price_gbp}</span></div><div className="p-2 rounded-lg border"><div className="text-sm font-semibold mb-1">Line Items</div><ul className="text-sm list-disc pl-5">{(data.quote.line_items||[]).map((li:any,i:number)=><li key={i}>{li.label}: £{li.amount}</li>)}</ul></div><div className="p-2 rounded-lg border"><div className="text-sm font-semibold mb-1">Terms</div><ul className="text-sm list-disc pl-5">{(data.quote.terms||[]).map((t:string)=><li key={t}>{t}</li>)}</ul></div></div><div className="mt-3"><div className="text-sm font-semibold">{data.quote.email_subject}</div><pre className="text-sm whitespace-pre-wrap mt-1 p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800">{data.quote.email_body}</pre></div></section>)}
          {data.risk && (<section className="card mt-3"><div className="flex items-center gap-2 mb-2 text-brand"><AlertTriangle size={16}/><h3 className="font-semibold">AI: Risk Summary</h3></div><div className="chips"><span className={'chip '+(data.risk.risk_level==='high'?'chip-warn':'')}>Risk: {data.risk.risk_level}</span></div><ul className="text-sm mt-2 list-disc pl-5">{(data.risk.flags||[]).map((d:string)=><li key={d}>{d}</li>)}</ul><div className="mt-2"><div className="text-sm font-semibold">Checklist</div><ul className="text-sm list-disc pl-5">{(data.risk.checklist||[]).map((c:any,i:number)=><li key={i}>{c.item} — {c.status}</li>)}</ul></div></section>)}
          {data.message && (<section className="card mt-3"><div className="flex items-center gap-2 mb-2 text-brand"><MessageSquare size={16}/><h3 className="font-semibold">AI: Customer Message</h3></div><div className="chips">{(data.message.channels||[]).map((c:string)=><span key={c} className="chip">{c}</span>)}</div><div className="mt-2 p-2 rounded-lg border"><div className="text-sm font-semibold mb-1">{data.message.templates?.email_confirm?.subject}</div><pre className="text-sm whitespace-pre-wrap">{data.message.templates?.email_confirm?.body}</pre></div><div className="mt-2 p-2 rounded-lg border"><div className="text-sm font-semibold mb-1">SMS ETA</div><pre className="text-sm whitespace-pre-wrap">{data.message.templates?.sms_eta || data.message.sms_eta}</pre></div></section>)}
        </div>
      </div>
    </div>
  )
}
