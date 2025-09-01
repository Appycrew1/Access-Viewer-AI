
<script lang="ts">
  let email='';
  let link='';
  async function send(){
    const r = await fetch('/api/auth/magic', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email }) });
    const j = await r.json();
    link = j.dev_link; // In production you'd email this
  }
</script>

<h1>Sign in</h1>
<p>Enter your email to get a magic link (for this demo we show the link directly).</p>
<input placeholder="you@company.com" bind:value={email} style="padding:.5rem;border:1px solid #e5e7eb;border-radius:.5rem"/>
<button on:click={send} style="margin-left:.5rem; padding:.5rem .75rem; border:1px solid #e5e7eb; border-radius:.5rem">Send Link</button>

{#if link}
  <p style="margin-top:1rem">Dev link: <a href={link}>{link}</a></p>
{/if}
