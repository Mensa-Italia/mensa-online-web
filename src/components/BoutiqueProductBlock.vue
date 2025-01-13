<script setup>

import {FileUrl} from "@/api.js";

defineProps(
    {
      product: Object
    }
)

function getStyleForProduct(product) {
  if (product.image.length === 0) {
    return {}
  }
  return {
    backgroundImage: `url(${FileUrl(product, product.image[0])})`
  }
}

function parseAmount(amount) {
  return (amount / 100).toFixed(2) + "€";
}
</script>

<template>
  <div class="product-block">
    <div class="product-block-image" :style="getStyleForProduct(product)"></div>
    <div class="product-block-content">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <p class="amount">{{ parseAmount(product.amount) }}</p>
      <div class="spacer"></div>
      <div>
        <button>Acquista</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-block {
  height: 200px;
  width: 80%;
  border-radius: 1em;
  transition: all 0.5s;
  padding: 1em;
  background-color: var(--color-background);
  display: flex;
  flex-direction: row;

}

.product-block-image {
  aspect-ratio: 1/1;
  height: 100%;
  background-color: var(--vt-c-primary);
  border-radius: 1em;
  background-position: center;
  background-size: cover;
}

.product-block-content {
  padding: .1em;
  padding-left: 1em;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-block-content h3 {
  font-weight: bold;
}

.product-block:hover {
  cursor: pointer;
  background-color: var(--color-background-soft);
}

.product-block-content .amount {
  font-size: 1.5em;
}

.spacer {
  flex: 1;
}

button {
  background-color: var(--vt-c-primary);
  color: white;
  border: none;
  border-radius: 1em;
  font-weight: bold;
  transition: all 0.5s;
  width: unset;
  padding: 0.5em 1em;
}

</style>