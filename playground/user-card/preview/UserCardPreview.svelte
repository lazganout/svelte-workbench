<script module>
  // Hug is the default, but we can be explicit
  export const workbench = { mode: "hug" };
</script>

<script lang="ts">
  import UserCard from "../UserCard.svelte";
</script>

<!-- We can render multiple states in one preview for 'hug' mode -->
<div class="wrapper">
  <UserCard name="Alice Johnson" role="Software Engineer" />
  <UserCard name="Bob Smith" role="Product Designer" />
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 10px; /* Padding ensures the iframe doesn't clip shadows */
  }
</style>
