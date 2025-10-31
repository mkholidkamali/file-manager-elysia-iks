<script setup lang="ts">
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="window-controls">
        <div class="control-button red"></div>
        <div class="control-button yellow"></div>
        <div class="control-button green"></div>
      </div>
      <div class="center-title">File Manager</div>
    </header>
    
    <main class="app-content">
      <router-view />
    </main>
    
    <ConfirmDialog />
    <Toast position="bottom-right" />
  </div>
</template>

<style>
/* Global styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: var(--font-family);
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.app-header {
  background-color: #f5f5f7;
  color: #333;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #d1d1d1;
}

.window-controls {
  display: flex;
  gap: 8px;
  margin-left: 10px;
}

.center-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 500;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
}

.control-button.red {
  background-color: #ff5f57;
  border: 1px solid #e0443e;
}

.control-button.yellow {
  background-color: #febc2e;
  border: 1px solid #dea123;
}

.control-button.green {
  background-color: #28c840;
  border: 1px solid #1aab29;
}

.app-content {
  flex: 1;
  overflow: auto;
}
</style>
