<script setup>
import {FileUrl} from "@/api.js";

defineProps({
  documentData: Object
})


function openFile(documentData) {
  const url = FileUrl(documentData, documentData.file);
  window.open(url, '_blank');
}

function parseDate(date) {
  //parse date to dd MMMM yyyy
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('it-IT', options);
}

function getIconBasedOnCategory(category) {
  
  switch (category) {
    case "bilanci": // Bilanci
      return "StatusUp";
    case "elezioni": // Elezioni
      return "Crown";
    case "eventi_progetti": // Eventi e progetti
      return "Calendar";
    case "materiale_comunicazione": // Materiale per comunicazione
      return "Folder";
    case "modulistica_contratti": // Modulistica e contratti
      return "Paperclip";
    case "news_pubblicazioni": // News e pubblicazioni
      return "TableDocument";
    case "normativa_interna": // Normativa interna
      return "Judge";
    case "verbali_delibere": // Verbali e delibere
      return "Book1";
    case "tesoreria_contabilita": // Tesoreria e contabilità
      return "StatusUp";
    default:
      return "Document";
  }
}
</script>

<template>
  <div class="document-block" @click="openFile(documentData)">
    <div class="icon-doc">
      <VsxIcon :iconName="getIconBasedOnCategory(documentData.category)" size="40" type="linear"></VsxIcon>
    </div>
    <div class="content">
      <h3>{{documentData.name}}</h3>
      <div class="spacer"></div>
      <p>{{parseDate(documentData.published)}}</p>
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
  width: 100%;
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

.content{
  display: flex;
  flex-direction: row;
  padding-right: 1.5em;
  flex: 1;
  justify-content: center;
  align-items: center;

}

.spacer{
  flex: 1;
}

.content p{
  font-size: .8em;
  opacity: .5;
}
.content h3{
  font-size: 1em;
  font-weight: bold;
}
</style>