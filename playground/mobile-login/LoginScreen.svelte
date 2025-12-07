<script lang="ts">
  let email = $state("");
</script>

<div class="mobile-screen">
  <header>
    <span>9:41</span>
    <span>🔋</span>
  </header>
  <main>
    <h1>Welcome Back</h1>
    <input type="email" placeholder="Email" bind:value={email} />
    <input type="password" placeholder="Password" />
    <button>Log In</button>
  </main>
</div>

<style>
  .mobile-screen {
    width: 100%;
    height: 100%;
    background: #f5f5f7;
    display: flex;
    flex-direction: column;
  }
  header {
    display: flex;
    justify-content: space-between;
    padding: 14px 20px;
    font-weight: 600;
    font-size: 0.9rem;
  }
  main {
    flex: 1;
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  input {
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 12px;
    font-size: 1rem;
  }
  button {
    margin-top: auto;
    padding: 16px;
    background: #000;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
  }
</style>
