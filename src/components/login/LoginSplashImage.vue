<script setup>


</script>

<template>
  <div class="background-image-splash">
    <div class="container">
      <div class="logo">
        <img src="/icon_white.svg" alt="LOGO" />
      </div>
      <div class="spacer"></div>
      <h1>"Simply a group of friend who reuinite every once in a year"</h1>
      <p>Simone Ferrari</p>
      <p class="author">Presidente</p>
    </div>
  </div>
</template>

<style scoped>
.background-image-splash {
  background-image: url("https://cdn.pixabay.com/photo/2017/02/16/23/10/smile-2072907_1280.jpg");
  background-size: auto;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--color-background-mute);
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

.background-image-splash .container {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: start;
  height: 100%;
  width: 100%;
  color: white;
  padding: 2rem;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.0), rgba(0, 0, 0, 0.6));
}

.background-image-splash h1 {
  font-size: 2em;
  margin: 0;
  font-weight: bold;
}

.background-image-splash p {
  font-size: 1em;
  margin: 0;
  line-height: 1.2em;
  font-weight: bold;
}

.background-image-splash p.author {
  font-size: 1em;
  margin: 0;
  line-height: 1.2em;
  font-weight: normal;
}

.background-image-splash .logo {
  font-size: 3em;
  font-weight: bold;
  width: 100px;
  height: 100px;
}


.background-image-splash .logo img {
  width: 100%;
  height: 100%;
}

.background-image-splash .spacer {
  flex-grow: 1;
}
</style>