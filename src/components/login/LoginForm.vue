<script setup>

import Switch from "@/components/input/Switch.vue";

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
</script>

<template>
  <div class="center">
    <form class="login-form">
      <h3>Bentornato socio!</h3>
      <h5>Rimani connesso, scopri gli eventi e non perderti un momento!</h5>
      <div class="form-group smallgaps">
        <input type="email" id="email" v-model="email" required placeholder="email" autocomplete="email">
        <input type="password" id="password" v-model="password" required autocomplete="current-password"
               placeholder="Password">
        <a href="/forgot-password" class="forgotpassword">Hai dimenticato la password?</a>
      </div>
      <div class="form-group remember-me">
        <p>Ricorda accesso</p>
        <Switch></Switch>
      </div>
      <button type="submit" @click.prevent="login">Log in</button>
      <!-- or -->
      <div class="divider">
        <hr/>
        <p>oppure</p>
        <hr/>
      </div>
      <!-- login with social media -->
      <div class="social-login">
        <button type="button" @click="loginWithGoogle" class="google-login">Login with Google</button>
        <button type="button" @click="loginWithApple" class="apple-login">Login with Apple</button>
      </div>
      <div class="form-group register">
        <p>Non sei ancora socio? <a href="/register">Fai il test!</a></p>
      </div>

    </form>
  </div>
</template>

<style scoped>

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 2em;
  max-width: 500px;
  align-content: stretch;

}

.login-form h3 {
  font-size: 2em;
  margin: 0;
  font-weight: bold;
  line-height: 1em;
  text-align: center;
}

.login-form h5 {
  font-size: 1em;
  margin: 0;
  font-weight: normal;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.form-group a:hover {
  text-decoration: underline;
}

.form-group.remember-me {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.divider {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1em;
}

.divider hr {
  width: 100%;
  height: 1px;
  background-color: var(--color-background-mute);
  border: none;
}

.social-login {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;

}

.register {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5em;
  padding-top: 2em;
}

.google-login {
  background-color: #fff;
  color: #000;
  border: 1px solid #ccc;
  padding: 1em;
  cursor: pointer;
}

.apple-login {
  background-color: #000;
  color: white;
  border: none;
  padding: 1em;
  cursor: pointer;
}

.forgotpassword {
  font-size: 0.8em;
}

.smallgaps {
  gap: 0.3em;
}
</style>