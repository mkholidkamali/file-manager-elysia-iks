<template>
  <div class="not-found">
    <div class="flex flex-column align-items-center justify-content-center h-screen">
      <i class="pi pi-exclamation-circle text-6xl text-yellow-500 mb-4"></i>
      <h1 class="text-4xl mb-2">404 Not Found</h1>
      <p class="text-xl mb-4">The page you're looking for doesn't exist.</p>
      <Button label="Go Home" icon="pi pi-home" @click="$router.push('/')" />
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed
</script>

<style scoped>
.not-found {
  height: 100vh;
  background-color: #f8f9fa;
}
</style>