<script setup>

import {FileUrl} from "@/api.js";

defineProps({
  community: Object
})

function getStyleBasedOnImage(community) {
  if (community.image == '' || community.image == null) {
    return {}
  }
  return {
    backgroundImage: `url(${FileUrl(community, community.image)})`
  }
}

function openCommunity(community) {
  const url = community.link;
  if (url == null || url == '') {
    return;
  }
  window.open(url, '_blank');
}

</script>

<template>
  <div class="community-block" :style="getStyleBasedOnImage(community)" @click="openCommunity(community)">
    <div class="community-block-content" v-if="community.image ==''">
      <h3>{{ community.name }}</h3>
    </div>
  </div>
</template>

<style scoped>
.community-block {
  aspect-ratio: 960/388;
  width: 300px;
  background-color: var(--vt-c-primary);
  border-radius: 1em;
  background-position: center;
  background-size: cover;
  transition: all 0.5s;
}

.community-block:hover {
  cursor: pointer;
  transform: scale(1.05);
}

.community-block-content {
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-weight: bold;
  color: white;
}

.community-block-content h3 {
  font-weight: bold;
}

</style>