
import type { RequestHandler } from '@sveltejs/kit';
import { ADDR_BY_ID, DEPOT_BY_ID } from '@/lib/sample';
export const POST:RequestHandler = async ({ request }) => {
  const b = await request.json().catch(()=>({}));
  const { customer_address_id, depot_id, customer_address_text, depot_address_text } = b||{};
  if(customer_address_id && depot_id){
    const o = DEPOT_BY_ID[depot_id]; const d = ADDR_BY_ID[customer_address_id];
    if(!o || !d) return new Response(JSON.stringify({error:'unknown origin/dest'}), { status:400 });
    return new Response(JSON.stringify({ origin:o, dest:d, mode:'mock_ids' }), { headers:{'content-type':'application/json'} });
  }
  if(customer_address_text && depot_address_text){
    const key = process.env.GOOGLE_API_KEY;
    if(!key) return new Response(JSON.stringify({ error:'missing_google_key', hint:'Set GOOGLE_API_KEY' }), { status:400 });
    const g = 'https://maps.googleapis.com/maps/api/geocode/json';
    const rs = await fetch(`${g}?address=${encodeURIComponent(depot_address_text)}&key=${key}`);
    const rc = await fetch(`${g}?address=${encodeURIComponent(customer_address_text)}&key=${key}`);
    const o = await rs.json(); const d = await rc.json();
    if(o.status!=='OK' || d.status!=='OK'){
      return new Response(JSON.stringify({ error:'geocode_failed', hint:`origin=${o.status} dest=${d.status}` }), { status:502 });
    }
    const oo=o.results[0], dd=d.results[0];
    return new Response(JSON.stringify({ origin:{id:'live_origin',label:oo.formatted_address,lat:oo.geometry.location.lat,lng:oo.geometry.location.lng}, dest:{id:'live_dest',label:dd.formatted_address,lat:dd.geometry.location.lat,lng:dd.geometry.location.lng}, mode:'live_text' }), { headers:{'content-type':'application/json'} });
  }
  return new Response(JSON.stringify({ error:'invalid_payload', hint:'Use mock IDs or free-text addresses.' }), { status:400 });
}
