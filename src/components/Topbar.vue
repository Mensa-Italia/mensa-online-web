<script setup>

import {GetUser, ImageUrl} from "@/api.js";
</script>

<template>
  <div class="topbar">
    <slot></slot>
    <div class="spacer"></div>
    <p>{{ GetUser().name }}</p>
    <img class="user-pic" :src="ImageUrl(GetUser(), GetUser().avatar)"/>
  </div>
</template>

<style scoped>
.user-pic {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.topbar{
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.spacer {
  flex: 1;
}
</style>