<script setup>
import {FileUrl} from "@/api.js";

defineProps({
  documentData: Object
})


function openFile(documentData) {
  const url = FileUrl(documentData, documentData.file);
  window.open(url, '_blank');
}
</script>

<template>
  <div class="document-block" @click="openFile(documentData)">
    <div class="icon-doc">
      <VsxIcon iconName="Document" size="40" type="linear"></VsxIcon>
    </div>
    <div class="content">
      <h3>{{documentData.name}}</h3>
    </div>
  </div>
</template>

<style scoped>
.document-block {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding: .5rem;
  height: 80px;
  background-color: var(--color-background);
  border-radius: 1em;
  align-items: center;
  align-content: center;
  width: 80%;
}

.document-block:hover {
  background-color: var(--color-background-soft);
  cursor: pointer;
}

.document-block .icon-doc {
  height: 100%;
  aspect-ratio: 1;
  border-radius: 1em;
  background-color: var(--color-background-mute);
  display: flex;
  justify-content: center;
  align-items: center;

}
</style>