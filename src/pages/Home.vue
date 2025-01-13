<script setup>

import SideBar from "@/components/SideBar.vue";
import Topbar from "@/components/Topbar.vue";
import EventBlock from "@/components/EventBlock.vue";
import SideBarTile from "@/components/SideBarTile.vue";
import ChartActiveUsers from "@/components/ChartActiveUsers.vue";
import {useRouter} from "vue-router";


</script>

<template>
  <main>
    <SideBar>
      <SideBarTile title="Home" icon="Home" route="/hub" selected></SideBarTile>
      <SideBarTile title="Events" icon="Ticket" route="/events"></SideBarTile>
      <SideBarTile title="Documents" icon="Document" route="/documents"></SideBarTile>
      <SideBarTile title="Community" icon="People" route="/community"></SideBarTile>
      <SideBarTile title="Boutique" icon="Shop"  route="/boutique"></SideBarTile>
    </SideBar>
    <div class="main-data">
      <Topbar></Topbar>
      <div class="main-content">
        The home page will be available soon.
        <br/>
        <br/>
        This app is still in development, some features may not work as expected and some pages may not be available.

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
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
}

@media (max-width: 900px) {
  main {
    grid-template-columns: 100px minmax(0, 100%);
  }
}
</style>