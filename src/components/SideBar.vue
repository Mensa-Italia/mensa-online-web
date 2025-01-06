<script setup>

import SideBarTile from "@/components/SideBarTile.vue";
import {Logout} from "@/api.js";
import {useRouter} from "vue-router";

const router = useRouter();

function FullLogout(){
  Logout();
  router.push("/");
}

</script>

<template>
  <div class="sidebar-filler"></div>
  <div class="sidebar">
    <img class="logo hide-on-mobile" src="/logo_horizontal.png"/>
    <img class="logo hide-on-desktop" src="/icon.svg"/>
    <slot></slot>
    <div class="Spacer"></div>
    <SideBarTile title="Logout" icon="LogoutCurve" color="red" :on-click="FullLogout" ></SideBarTile>
  </div>
</template>

<style scoped>
  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    font-weight: bold;
    text-align: center;
  }

  .logo{
    width: 90%;
    margin: auto;
    margin-bottom: 1rem;
  }

  .sidebar{
    background-color: var(--color-background);
    padding: 1rem;
    width: 300px;
    box-shadow: 0 0 10px rgba(0, 0, 0, .1);
    display: flex;
    flex-direction: column;
    gap: .5rem;
    top: 0;
    bottom: 0;
    left: 0;
    position: fixed;
    animation: slide 0.5s;
    transition: width 0.5s;
  }

  .sidebar-filler{
    width: 300px;
    animation: slide 0.5s;
    transition: width 0.5s;
  }

  .Spacer{
    flex: 1;

  }

  .hide-on-desktop{
    display: none;
  }


  @media (max-width: 900px) {
    .sidebar {
      width: 100px;
    }

    .sidebar-filler{
      width: 100px;
    }

    .hide-on-mobile{
      display: none;
    }

    .hide-on-desktop{
      display: block;
    }
  }
</style>