<script setup>

import {GetUser, FileUrl} from "@/api.js";
</script>

<template>
  <div class="topbar hide-on-mobile">
    <div class="spacer">
      <slot></slot>
    </div>
    <div class="user-data">
      <p>{{ GetUser().name }}</p>
      <img class="user-pic" :src="FileUrl(GetUser(), GetUser().avatar)"/>
    </div>
  </div>
  <div class="topbar hide-on-desktop">
    <div class="user-data">
      <p>{{ GetUser().name }}</p>
      <img class="user-pic" :src="FileUrl(GetUser(), GetUser().avatar)"/>
    </div>
    <div class="spacer">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.user-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.topbar {
  padding: 1rem;
  position: sticky;
  display: flex;
  align-items: center;
  gap: 1rem;
  grid-area: topbar;
}

.spacer {
  flex: 1;
}

.user-data {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: end;
}

.hide-on-desktop {
  display: none;
}

@media (max-width: 900px) {
  .hide-on-mobile {
    display: none;
  }

  .hide-on-desktop {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>