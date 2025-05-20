<script setup>

import SideBar from "@/components/SideBar.vue";
import SideBarTile from "@/components/SideBarTile.vue";
import Topbar from "@/components/Topbar.vue";
import {ref} from "vue";
import {GetDocuments} from "@/api.js";
import DocumentBlock from "@/components/DocumentBlock.vue";


let listOfDocumentsOriginal = [];
const listOfDocuments = ref([])
const searchModel = defineModel()
const typesFilterModel = ref([])
const types = [
  "bilanci",
  "elezioni",
  "eventi_progetti",
  "materiale_comunicazione",
  "modulistica_contratti",
  "news_pubblicazioni",
  "normativa_interna",
  "verbali_delibere",
  "tesoreria_contabilita"
]

const typesNames = [
  "Bilanci",
  "Elezioni",
  "Eventi e progetti",
  "Materiale per comunicazione",
  "Modulistica e contratti",
  "News e pubblicazioni",
  "Normativa interna",
  "Verbali e delibere",
  "Tesoreria e contabilità"
]

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

function filterDocumentsByType(type) {
  if (typesFilterModel.value.includes(type)) {
    typesFilterModel.value = typesFilterModel.value.filter((e) => e !== type);
  } else {
    typesFilterModel.value.push(type);
  }
  listOfDocuments.value = listOfDocumentsOriginal.filter((e) => typesFilterModel.value.includes(e.category));
  if (typesFilterModel.value.length === 0) {
    listOfDocuments.value = listOfDocumentsOriginal;
  }
}
</script>

<template>
  <main>
    <div class="topbar-area">
      <Topbar>
        <input type="text" class="searcher" placeholder="Cerca documento" @input="searchDocuments($event)"
               v-model="searchModel">
      </Topbar>
    </div>
    <div class="sidebar-area">
      <SideBar>
        <SideBarTile title="Home" icon="Home" route="/hub"></SideBarTile>
        <SideBarTile title="Events" icon="Ticket" route="/events"></SideBarTile>
        <SideBarTile title="Documents" icon="Document" selected route="/documents"></SideBarTile>
        <SideBarTile title="Community" icon="People" route="/community"></SideBarTile>
        <SideBarTile title="Boutique" icon="Shop" route="/boutique"></SideBarTile>
      </SideBar>
    </div>
    <div class="main-data-area">
      <DocumentBlock v-for="document in listOfDocuments" :documentData="document"></DocumentBlock>
    </div>
    <div class="side-data-area">
      <div class="side-data-area-fixed">
        <h3>Tipo di documento</h3>
        <hr>
        <ul>
          <li v-for="type in types" :key="type" @click="filterDocumentsByType(type)"
              :class="{selected: typesFilterModel.includes(type)}">
            {{ typesNames[types.indexOf(type)] }}
          </li>

        </ul>
      </div>
    </div>
    <div class="bottombar-area"></div>
  </main>
</template>

<style scoped>

main {
  grid-template:
  "sidebar topbar topbar" 100px
  "sidebar main-data side-data"
  "sidebar bottombar bottombar" 50px / 300px 1fr auto;
  min-height: 100vh;
  transition: all 0.5s;
  display: grid;
  background-color: var(--color-background-mute);

}

.sidebar-area {
  grid-area: sidebar;
}

.main-data-area {
  grid-area: main-data;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  gap: 1rem;
  overflow: hidden;
}

.bottombar-area {
  grid-area: bottombar;
  overflow: hidden;
}

.topbar-area {
  grid-area: topbar;
  overflow: hidden;
}

.side-data-area {
  grid-area: side-data;
  max-width: 400px;
  padding: 1rem;
  overflow: hidden;
}

.side-data-area ul {
  list-style: none;
  padding: 0;

}

.side-data-area li {
  padding: 0.5rem 1rem;
  background-color: var(--color-background);
  border-radius: 1em;
  margin-bottom: 0.5rem;

}

.side-data-area li:hover {
  background-color: var(--color-background-soft);
  cursor: pointer;
}

.side-data-area hr {
  height: 1px;
  border-color: var(--color-background-mute);
  margin-bottom: 1rem;
}

.side-data-area-fixed {
  position: sticky;
  top: 0;
  height: calc(100vh - 100px);
  background-color: var(--color-background-mute);
  padding: 1rem;
}

.side-data-area li.selected {
  background-color: var(--vt-c-primary);
  color: white;
}

@media (max-width: 900px) {
  main {
    grid-template:
      "sidebar topbar" 100px
      "sidebar side-data" 100px
      "sidebar main-data"
      "sidebar bottombar" / 100px auto;
  }
}

</style>