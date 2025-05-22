<script setup>

</script>

<template>
  <main>
    <div class="container">
      <div class="infobox">
        <slot name="infobox"/>
      </div>
      <div class="form">
        <slot name="form"/>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  height: 100svh;
  padding: 2em;
  background-color: var(--color-background-mute);
}

.container {
  grid-template:
    "infobox form" 100%
    / 35% auto;
  display: grid;
  height: 100%;
  border-radius: 2em;
  overflow: hidden;
  background-color: var(--color-background);
  box-shadow: 0 0 1em var(--color-background-mute);
}

.infobox {
  grid-area: infobox;
  padding: 0;
  margin: 0;
}

.form {
  grid-area: form;
}

</style>