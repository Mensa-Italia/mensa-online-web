<script setup>

import {isLogged, Login} from "@/api.js";
import {useRouter} from "vue-router";
import {ref} from "vue";

const router = useRouter();
const email = ref("");
const password = ref("");

function login() {
  Login(
    email.value,
    password.value
  ).then(() => {
    router.push("/hub");
  });
}

if (isLogged()){
  router.push("/hub");
}

</script>

<template>
  <main>
    <div class="grid-element color-division hide-on-mobile">
      <h1>Hai visto il nuovo numero di QUID?</h1>
      <img src="https://www.mensa.it/wp-content/uploads/2024/07/Schermata-2024-07-22-alle-18.40.53-211x300.png"/>
      <br/>
      <br/>
      <p>Scopri le ultime novità e le storie più interessanti del mese.</p>
      <button>Scopri di più</button>
    </div>
    <div class="grid-element">
      <h1>Bentornato!</h1>
      <form>
        <input type="email" placeholder="Email" v-model="email"/>
        <input type="password" placeholder="Password" v-model="password"/>
        <div class="actions">
          <button @click.stop.prevent>Password dimenticata?</button>
          <button type="submit" @click.stop.prevent="login()">Login</button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: start;
  flex-direction: row;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  font-weight: bold;
  text-align: center;
}

p{
  text-align: center;
}

.grid-element {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5rem;
}

.color-division {
  background-color: var(--color-background-mute);
}

.hide-on-mobile {
}

form{
  max-width: 400px;
}

@media (max-width: 900px) {
  main {
    grid-template-columns: 1fr;
  }

  .hide-on-mobile {
    display: none;
  }
}
</style>