<script lang="ts">
  interface Props {
    name: string;
    role: string;
  }
  let { name, role }: Props = $props();
</script>

<div class="card">
  <div class="avatar">{name[0]}</div>
  <div class="info">
    <h3>{name}</h3>
    <p>{role}</p>
  </div>
  <button>Follow</button>
</div>

<style>
  .card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    width: 350px;
    /* Shadow is optional, but helps visualize the hug */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .avatar {
    width: 48px;
    height: 48px;
    background: #333;
    color: white;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: bold;
    font-size: 1.2rem;
  }
  .info h3 {
    margin: 0;
    font-size: 1rem;
  }
  .info p {
    margin: 0;
    color: #666;
    font-size: 0.85rem;
  }
  button {
    margin-left: auto;
    padding: 8px 16px;
    background: #007fd4;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>
