export const SAMPLE={addresses:[{id:'cust_1',label:'10 Downing Street, London SW1A 2AA',lat:51.503,lng:-0.127}],depots:[{id:'depot_1',label:'Depot: Battersea',lat:51.465,lng:-0.151}]} as const;
export const ADDR_BY_ID=Object.fromEntries(SAMPLE.addresses.map(a=>[a.id,a]));
export const DEPOT_BY_ID=Object.fromEntries(SAMPLE.depots.map(d=>[d.id,d]));
