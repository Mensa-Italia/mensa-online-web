<script setup>

</script>

<template>
  <div class="download-app">
    <img src="/app_logo.png" alt="icon" class="app-logo">
    <div class="content">
      <h3>Scarica l'app</h3>
      <div class="links"><a href="https://play.google.com/store/apps/details?id=it.mensa.app"
      >
        <VsxIcon iconName="GooglePlay" size="25" type="linear"></VsxIcon>
      </a><a href="https://apps.apple.com/it/app/mensa-italia/id1524200080"
      >
        <VsxIcon iconName="Apple" size="25" type="linear"></VsxIcon>
      </a></div>
    </div>
  </div>
</template>

<style scoped>

.download-app {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: .5rem;
  height: 100px;
  background-color: var(--color-background-mute);
  border-radius: 1em;
  align-items: stretch;
}

.app-logo {
  height: 100%;
  aspect-ratio: 1;
  border-radius: 1em;
}

.content {
  padding: .4em;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.spacer {
  flex: 1;
}

h3 {
  font-size: 1.2em;
  line-height: 1em;
  font-weight: bold;
}

.links {
  display: flex;
  flex-direction: row;
  gap: .3rem;
}

.links a {
  flex: 1;
  text-align: center;
  padding: .1rem;
  border-radius: 1em;
  background-color: var(--color-background-soft);
  color: var(--color-text);
  text-decoration: none;
  font-size: .6em;
}

.links a:hover {
  background-color: var(--color-text);
  color: var(--color-background);
}


  @media (max-width: 900px) {
    .download-app{
      display: none;
    }
  }
</style>