<script setup>

import SideBar from "@/components/SideBar.vue";
import Topbar from "@/components/Topbar.vue";
import EventBlock from "@/components/EventBlock.vue";
import SideBarTile from "@/components/SideBarTile.vue";
import ChartActiveUsers from "@/components/ChartActiveUsers.vue";
import {useRouter} from "vue-router";
import DocumentBlock from "@/components/DocumentBlock.vue";
import {ref} from "vue";
import {GetCommunities, GetDocuments, GetEvents} from "@/api.js";
import CommunityBlock from "@/components/CommunityBlock.vue";


let listOfCommunityOriginal = [];
const listOfCommunity = ref([])
const searchModel = defineModel()

GetCommunities().then((documents) => {
  console.log(documents);
  listOfCommunityOriginal = documents;
  listOfCommunity.value = listOfCommunityOriginal;
})

function searchCommunity(event) {
  if (event.target.value === "") {
    listOfCommunity.value = listOfCommunityOriginal;
    return;
  }
  listOfCommunity.value = listOfCommunityOriginal.filter((e) => e.name.toLowerCase().includes(event.target.value.toLowerCase()));
}

</script>

<template>
  <main>
    <SideBar>
      <SideBarTile title="Home" icon="Home" route="/hub"></SideBarTile>
      <SideBarTile title="Events" icon="Ticket" route="/events"></SideBarTile>
      <SideBarTile title="Documents" icon="Document" route="/documents"></SideBarTile>
      <SideBarTile title="Community" icon="People" selected route="/community"></SideBarTile>
      <SideBarTile title="Boutique" icon="Shop" route="/boutique"></SideBarTile>
    </SideBar>
    <div class="main-data">
      <Topbar>
        <input type="text" class="searcher" placeholder="Cerca community" @input="searchCommunity($event)"
               v-model="searchModel">
      </Topbar>
      <div class="main-content">
        <CommunityBlock v-for="community in listOfCommunity" :key="community.id" :community="community"></CommunityBlock>
      </div>
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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1em;
  padding-bottom: 5em;
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