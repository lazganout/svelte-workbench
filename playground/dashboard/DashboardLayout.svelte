<script lang="ts">
  let active = $state("Home");
</script>

<div class="layout">
  <aside>
    <div class="brand">ACME Inc.</div>
    <nav>
      {#each ["Home", "Analytics", "Settings"] as item}
        <button class:selected={active === item} onclick={() => (active = item)}
          >{item}</button
        >
      {/each}
    </nav>
  </aside>
  <main>
    <header>
      <h2>{active}</h2>
      <div class="user">Admin</div>
    </header>
    <div class="content">
      <div class="box">Graph 1</div>
      <div class="box">Graph 2</div>
      <div class="box big">Table Data</div>
    </div>
  </main>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    height: 100%;
    width: 100%;
    background: #fff;
  }
  aside {
    background: #1a1a1a;
    color: white;
    padding: 20px;
  }
  .brand {
    font-weight: bold;
    margin-bottom: 40px;
    font-size: 1.2rem;
  }
  nav button {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: #888;
    padding: 10px;
    cursor: pointer;
  }
  nav button.selected {
    color: white;
    background: #333;
    border-radius: 4px;
  }

  main {
    display: flex;
    flex-direction: column;
    background: #f0f2f5;
  }
  header {
    background: white;
    padding: 20px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
  }
  .content {
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .box {
    background: white;
    padding: 20px;
    border-radius: 8px;
    height: 150px;
    border: 1px solid #ddd;
  }
  .box.big {
    grid-column: span 2;
  }
</style>
