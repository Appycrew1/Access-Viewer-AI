
<script lang="ts">
  import { onMount } from 'svelte';
  let orgs:any[]=[]; let current='';
  onMount(async()=>{
    const r = await fetch('/api/orgs'); const j = await r.json(); orgs=j.orgs; current=j.current||'';
  });
  async function setOrg(id:string){
    await fetch('/api/orgs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    location.href='/app';
  }
</script>

<h1>Select organisation</h1>
<div id="list"></div>
{#each orgs as o}
  <div style="margin:.5rem 0; padding:.5rem; border:1px solid #e5e7eb; border-radius:.5rem">
    <b>{o.name}</b> <button on:click={()=>setOrg(o.id)} style="margin-left:.5rem">Use</button>
    {#if o.id===current}<span style="margin-left:.5rem">✓ current</span>{/if}
  </div>
{/each}
