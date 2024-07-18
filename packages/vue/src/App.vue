<script setup lang="ts">
import Cropper from "./components/Cropper/index.vue"

function onClip(clip) {
  console.log('clip', clip)
}

</script>

<template>
  <Cropper url="https://bilibili.github.io/WebAV/video/bunny.mp4" @clip="onClip" :endTime="20 * 1e3" :startTime="10 * 1e3"></Cropper>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
