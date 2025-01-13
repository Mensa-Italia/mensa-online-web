<script setup>

import SideBar from "@/components/SideBar.vue";
import Topbar from "@/components/Topbar.vue";
import EventBlock from "@/components/EventBlock.vue";
import SideBarTile from "@/components/SideBarTile.vue";
import ChartActiveUsers from "@/components/ChartActiveUsers.vue";
import {useRouter} from "vue-router";
import DocumentBlock from "@/components/DocumentBlock.vue";
import {ref} from "vue";
import {GetBoutiqueProducts, GetDocuments, GetEvents} from "@/api.js";
import BoutiqueProductBlock from "@/components/BoutiqueProductBlock.vue";


let listOfBoutiqueOriginal = [];
const listOfBoutique = ref([])
const searchModel = defineModel()

GetBoutiqueProducts().then((boutique) => {
  console.log(boutique);
  listOfBoutiqueOriginal = boutique;
  listOfBoutique.value = listOfBoutiqueOriginal;
})

function searchBoutique(event) {
  if (event.target.value === "") {
    listOfBoutique.value = listOfBoutiqueOriginal;
    return;
  }
  listOfBoutique.value = listOfBoutiqueOriginal.filter((e) => e.name.toLowerCase().includes(event.target.value.toLowerCase()));
}

</script>

<template>
  <main>
    <SideBar>
      <SideBarTile title="Home" icon="Home" route="/hub"></SideBarTile>
      <SideBarTile title="Events" icon="Ticket" route="/events"></SideBarTile>
      <SideBarTile title="Documents" icon="Document" route="/documents"></SideBarTile>
      <SideBarTile title="Community" icon="People" route="/community"></SideBarTile>
      <SideBarTile title="Boutique" icon="Shop" selected route="/boutique"></SideBarTile>
    </SideBar>
    <div class="main-data">
      <Topbar>
        <input type="text" class="searcher" placeholder="Cerca prodotto" @input="searchBoutique($event)" v-model="searchModel">
      </Topbar>
      <div class="main-content">
        <BoutiqueProductBlock v-for="product in listOfBoutique" :key="product.id" :product="product"></BoutiqueProductBlock>
      </div>
    <div style="height: 300px"></div>
    </div>
  </main>

</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: 300px minmax(0, 100%);
  min-height: 100vh;
  transition: all 0.5s;
}

.main-data {
  min-height: 100vh;
  height: 100%;
  width: 100%;
  background-color: var(--color-background-mute);
  display: flex;
  flex-direction: column;
}

.main-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.toolbar-buttons {
  display: flex;
  justify-content: flex-end;
  width: 80%;
  gap: 1rem;
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