export const SAMPLE = {
  addresses:[
    { id:'cust_1', label:'10 Downing Street, London SW1A 2AA', lat:51.5033635, lng:-0.1276248,
      image_url:'https://placehold.co/640x360?text=Street+View+Mock', satellite_url:'https://placehold.co/320x180?text=Satellite+Mock',
      type_guess:'terraced_house' },
    { id:'cust_2', label:'221B Baker Street, London NW1 6XE', lat:51.523767, lng:-0.1585557,
      image_url:'https://placehold.co/640x360?text=Street+View+Mock', satellite_url:'https://placehold.co/320x180?text=Satellite+Mock',
      type_guess:'flat_above_shop' },
    { id:'cust_3', label:'1 Canada Square, Canary Wharf, London E14 5AB', lat:51.505455, lng:-0.0235,
      image_url:'https://placehold.co/640x360?text=Street+View+Mock', satellite_url:'https://placehold.co/320x180?text=Satellite+Mock',
      type_guess:'apartment_tower' }
  ],
  depots:[ { id:'depot_1', label:'Depot: Battersea, SW11', lat:51.465, lng:-0.151 }, { id:'depot_2', label:'Depot: Stratford, E15', lat:51.54, lng:0.001 } ],
  areas:[ { code:'SW11', name:'Battersea', centroid:[51.465,-0.151], demand_index:78 }, { code:'NW1', name:'Marylebone', centroid:[51.523,-0.158], demand_index:66 }, { code:'E14', name:'Canary Wharf', centroid:[51.505,-0.023], demand_index:72 } ]
} as const;

export const ADDR_BY_ID = Object.fromEntries(SAMPLE.addresses.map(a=>[a.id,a]));
export const DEPOT_BY_ID = Object.fromEntries(SAMPLE.depots.map(d=>[d.id,d]));

export function haversine(lat1:number, lon1:number, lat2:number, lon2:number){
  const R=6371, dlat=(lat2-lat1)*Math.PI/180, dlon=(lon2-lon1)*Math.PI/180;
  const a = Math.sin(dlat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dlon/2)**2;
  const c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R*c;
}
