<script setup>

import SideBar from "@/components/SideBar.vue";
import Topbar from "@/components/Topbar.vue";
import EventBlock from "@/components/EventBlock.vue";
import SideBarTile from "@/components/SideBarTile.vue";
import ChartActiveUsers from "@/components/ChartActiveUsers.vue";
import {useRouter} from "vue-router";
import DocumentBlock from "@/components/DocumentBlock.vue";
import {ref} from "vue";
import {GetDocuments, GetEvents} from "@/api.js";


let listOfDocumentsOriginal = [];
const listOfDocuments = ref([])
const searchModel = defineModel()

GetDocuments().then((documents) => {
  console.log(documents);
  listOfDocumentsOriginal = documents;
  listOfDocuments.value = listOfDocumentsOriginal;
})

function searchDocuments(event) {
  if (event.target.value === "") {
    listOfDocuments.value = listOfDocumentsOriginal;
    return;
  }
  listOfDocuments.value = listOfDocumentsOriginal.filter((e) => e.name.toLowerCase().includes(event.target.value.toLowerCase()));
}

</script>

<template>
  <main>
    <SideBar>
      <SideBarTile title="Home" icon="Home" route="/hub"></SideBarTile>
      <SideBarTile title="Events" icon="Ticket" route="/events"></SideBarTile>
      <SideBarTile title="Documents" icon="Document" selected route="/documents"></SideBarTile>
      <SideBarTile title="Community" icon="People" route="/community"></SideBarTile>
      <SideBarTile title="Boutique" icon="Shop" route="/boutique"></SideBarTile>
    </SideBar>
    <div class="main-data">
      <Topbar>
        <input type="text" class="searcher" placeholder="Cerca documento" @input="searchDocuments($event)"
               v-model="searchModel">
      </Topbar>
      <div class="main-content">
        <DocumentBlock v-for="document in listOfDocuments" :documentData="document"></DocumentBlock>
      </div>
    </div>
    <div class="side-data">
      <ul>
        <li>Documenti</li>
        <li>Eventi</li>
        <li>Comunicati</li>
        <li>News</li>
        <li>Guide</li>
        <li>FAQ</li>
      </ul>
    </div>
  </main>

</template>

<style scoped>
main {
  display: grid;
  grid-template-areas:
    "sidebar topbar topbar"
    "sidebar main-data side-data";
  grid-template-columns: 200px minmax(0, 1fr) 300px;
  grid-template-rows: 100px minmax(0, 1fr);
  min-height: 100vh;
  transition: all 0.5s;
}

.main-data {
  min-height: 100vh;
  width: 100%;
  height: 100%;
  background-color: var(--color-background-mute);
  display: flex;
  flex-direction: column;
  grid-area: main-data;
}

.main-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.side-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--color-background-mute);
  grid-area: side-data;
}

.searcher {
  width: 100%;
  flex: 1;
}

@media (max-width: 900px) {
  main {
    grid-template-columns: 100px minmax(0, 100%);
  }
}
</style>