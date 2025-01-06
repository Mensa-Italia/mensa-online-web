<script setup>

import {useRouter} from "vue-router";

const props = defineProps({
  selected: Boolean,
  title: String,
  icon: String,
  color: String || "var(--color-text)",
  onClick: Function,
  route: String
});


const router = useRouter();

const onClickInternal = () => {
  if (props.route !== undefined) {
    router.push(props.route);
  } else {
    props.onClick();
  }
}

</script>

<template>
  <div class="side-bar-tile" :class="{selected: selected}" @click="onClickInternal">
    <VsxIcon :iconName="icon" size="25" type="linear" :color="color"></VsxIcon>
    <p :style="{color: color}">{{ title }}</p>
  </div>
</template>

<style scoped>
.side-bar-tile {
  padding: 1rem;
  width: 100%;
  animation: slide 0.5s;
  transition: background-color 0.5s;
  border-radius: 1em;
  display: flex;
  flex-direction: row;
  gap: .5em;
  align-items: center;
  cursor: pointer;
}

.side-bar-tile:hover {
  background-color: var(--color-background-soft);
}

.side-bar-tile.selected {
  background-color: var(--color-background-mute);
}


@media (max-width: 900px) {
  .side-bar-tile p {
    display: none;
  }

  .side-bar-tile {
    justify-content: center;
  }
}
</style>