
import type { RequestHandler } from '@sveltejs/kit';
import { ADDR_BY_ID } from '@/lib/sample';
export const GET:RequestHandler = async ({ url }) => {
  const id = url.searchParams.get('address_id'); const lat = url.searchParams.get('lat'); const lng = url.searchParams.get('lng');
  const key = process.env.GOOGLE_API_KEY;
  if(!key) return new Response(JSON.stringify({ error:'missing_google_key', hint:'Set GOOGLE_API_KEY' }), { status:400 });
  if(id){
    const a = (ADDR_BY_ID as any)[id];
    if(!a) return new Response(JSON.stringify({error:'unknown address'}), { status:400 });
    return new Response(JSON.stringify({ image_url:`https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${a.lat},${a.lng}&key=${key}`, satellite_url:`https://maps.googleapis.com/maps/api/staticmap?center=${a.lat},${a.lng}&zoom=18&size=320x180&maptype=satellite&key=${key}`, type_guess:a.type_guess, source:'live' }), { headers:{'content-type':'application/json'} });
  }
  if(lat && lng){
    return new Response(JSON.stringify({ image_url:`https://maps.googleapis.com/maps/api/streetview?size=640x360&location=${lat},${lng}&key=${key}`, satellite_url:`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=18&size=320x180&maptype=satellite&key=${key}`, type_guess:null, source:'live' }), { headers:{'content-type':'application/json'} });
  }
  return new Response(JSON.stringify({error:'missing_params'}), { status:400 });
}
