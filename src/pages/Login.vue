<script setup>

import {isLogged, Login} from "@/api.js";
import {useRouter} from "vue-router";
import {ref} from "vue";
import LoginLayout from "@/layouts/LoginLayout.vue";
import LoginSplashImage from "@/components/login/LoginSplashImage.vue";
import LoginForm from "@/components/login/LoginForm.vue";

const router = useRouter();
const email = ref("");
const password = ref("");


if (isLogged()) {
  router.push("/hub");
}

</script>

<template>
  <LoginLayout>
    <template #infobox>
      <LoginSplashImage/>
    </template>

    <template #form>
      <LoginForm/>
    </template>
  </LoginLayout>
</template>

<style scoped>
</style>