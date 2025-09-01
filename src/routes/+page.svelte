
<script lang="ts">
  export let data:any;
  if(data?.redirect){ window.location.href = data.redirect }
</script>
<h1>Welcome</h1>
<p><a href="/login">Sign in</a></p>
