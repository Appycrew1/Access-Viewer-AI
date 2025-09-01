
import type { RequestHandler } from '@sveltejs/kit';
export const GET:RequestHandler = async ({ url }) => {
  const olat = url.searchParams.get('origin_lat'); const olng=url.searchParams.get('origin_lng');
  const dlat = url.searchParams.get('dest_lat'); const dlng=url.searchParams.get('dest_lng');
  const key = process.env.GOOGLE_API_KEY;
  if(olat && olng && dlat && dlng){
    if(!key) return new Response(JSON.stringify({ error:'missing_google_key', hint:'Set GOOGLE_API_KEY' }), { status:400 });
    const u = `https://maps.googleapis.com/maps/api/directions/json?origin=${olat},${olng}&destination=${dlat},${dlng}&departure_time=now&traffic_model=best_guess&key=${key}`;
    const r = await fetch(u); const j = await r.json();
    if(j.status!=='OK') return new Response(JSON.stringify({ error:'directions_failed', hint:j.status }), { status:502 });
    const leg = j.routes[0].legs[0];
    const eta = Math.round(((leg.duration_in_traffic||leg.duration).value)/60);
    const km = +(leg.distance.value/1000).toFixed(1);
    return new Response(JSON.stringify({ distance_km:km, eta_minutes:eta, incidents:[], leave_by:'Plan 10 min buffer', polyline:null, source:'live' }), { headers:{'content-type':'application/json'} });
  }
  return new Response(JSON.stringify({ error:'missing_params', hint:'Provide origin/dest lat/lng' }), { status:400 });
}
