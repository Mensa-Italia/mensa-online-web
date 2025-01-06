<script setup>

import {ImageUrl} from "@/api.js";

defineProps({
  event: Object
})


function Iso8601ToDateFormatted(iso8601) {
    const date = new Date(iso8601);
    return date.toLocaleDateString();
}

</script>

<template>
  <div class="event-block">
    <img class="event-image" :src="ImageUrl(event, event.image)"/>
    <div class="event-info">
      <h3>{{ event.name }}</h3>
      <p class="wrap2">{{ event.description }}</p>
      <p>{{ Iso8601ToDateFormatted(event.when_start) }}</p>
      <div class="spacer"></div>
      <div class="labels">
      <p>{{ event.expand.position.state == "NaN" ? "International" : event.expand.position.state}}</p></div>
    </div>
  </div>
</template>

<style scoped>
.event-block {
  display: flex;
  gap: 1rem;
  flex-direction: row;
  padding: 1rem;
  padding-right: 2rem;
  font-size: .8em;
  border-radius: 1rem;
  justify-content: start;
  transition: all 0.5s;
  box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  background-color: var(--color-background);
  cursor: pointer;
  width: 80%;
}

.event-image {
  height: 150px;
  border-radius: 1rem;
  aspect-ratio: 1280/669;
  object-fit: cover;
  object-position: left;
}

h3 {
  font-weight: bold;
  font-size: 1.2em;
}

.event-block:hover {
  background-color: var(--color-background-soft);
}


.event-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.spacer{
  flex: 1;
}

.labels{
  display: flex;
  gap: 1rem;
}

.labels p{
  background-color: var(--color-background-mute);
  padding: 0 .5rem;
  border-radius: 1rem;
}

@media (max-width: 900px) {
  .event-block {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  h3 {
    font-weight: bold;
    font-size: 1.5em;
  }
}



</style>