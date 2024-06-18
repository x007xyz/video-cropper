<template>
  <div class="cropper-wrapper">
    <video v-if="!$slots.default" ref="videoRef" :src="url" :width="videoWidth" :height="videoHeight" controls @timeupdate="onTimeUpdate"></video>
    <slot v-else></slot>
    <div class="timeline-wrapper" :style="{ height: trackHeight + 'px', width: trackWidth + 'px' }">
      <canvas ref="canvasRef" :width="trackWidth" :height="trackHeight"></canvas>
      <SliceHandler v-if="!loading" :start="start" :end="end" :min="0" :max="tlWidth" :wrapperWidth="tlWidth" :wrapperHeight="tlHeight" @dragging="onDragging" @dragEnd="onDragEnd"></SliceHandler>
      <div class="loader-wrapper" v-else>
        <div class="loader"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { drawThumbnailsImage } from "@video-cropper/core"
import { nextTick, ref, watch } from "vue";
import SliceHandler from "./SliceHandler.vue"

const props = withDefaults(defineProps<{
  videoWidth?: number | string,
  videoHeight?: number | string,
  trackWidth?: number | string,
  trackHeight?: number | string,
  url: string,
}>(), {
  videoWidth: 640,
  videoHeight: 360,
  trackWidth: 800,
  trackHeight: 50,
  url: '',
})

const emits = defineEmits({
  clip: (clip: { start: number, end: number }) => typeof clip,
})

const canvasRef = ref<HTMLCanvasElement>()

const videoRef = ref<HTMLVideoElement>()

const loading = ref(false)

const duration = ref(0)

const unit = ref(0)

const start = ref(0)

const end = ref(0)

// 时间轴宽高
const tlWidth = ref(0)

const tlHeight = ref(0)

function onDragging ({ slice, dragType } : { slice: { start: number, end: number }, dragType: 'start' | 'end' }) {
  start.value = slice.start;
  end.value = slice.end;
  if (videoRef.value) {
    videoRef.value.currentTime = slice[dragType] * unit.value / 1e6
  }
}

function onDragEnd() {
  emits('clip', { start: start.value * unit.value, end: end.value * unit.value })
}

function onTimeUpdate() {
  if (videoRef.value) {
    if (videoRef.value.currentTime < start.value * unit.value / 1e6) {
      videoRef.value.currentTime = start.value * unit.value / 1e6
      videoRef.value.pause()
    }
    if (videoRef.value.currentTime > end.value * unit.value / 1e6) {
      videoRef.value.currentTime = end.value * unit.value / 1e6
      videoRef.value.pause()
    }
  }
}

watch(() => props.url, async (val, oldVal) => {
  if (oldVal !== val && val) {

    loading.value = true

    const stream = (await fetch(val)).body
    await nextTick()

    if (!canvasRef.value) {
      loading.value = false
      return
    }

    if (!stream) {
      loading.value = false
      throw new Error(`获取视频url:${val}失败`)
    };
    

    const { width, height } = canvasRef.value.getBoundingClientRect()

    const info = await drawThumbnailsImage(stream, { width, height })

    duration.value = info.duration;

    tlWidth.value = width;

    tlHeight.value = height;

    unit.value = info.duration / width;

    start.value = 0;

    end.value = width;

    canvasRef.value!.getContext("bitmaprenderer")?.transferFromImageBitmap(info.bitmap)

    loading.value = false
  }
}, { immediate: true })

</script>

<style scoped>
.cropper-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.timeline-wrapper {
  position: relative;
  margin-top: 10px;
}
.loader-wrapper {
  position: absolute;
  inset: 0;
  /* background-color: rgba(0,0, 0, 0.6); */
  display: flex;
  align-items: center;
  justify-content: center;
}
/* HTML: <div class="loader"></div> */
.loader {
  width: 120px;
  height: 20px;
  -webkit-mask:linear-gradient(90deg,#000 70%,#0000 0) 0/20%;
  background:
   linear-gradient(#000 0 0) 0/0% no-repeat
   #ddd;
  animation: l4 2s infinite steps(6);
}
@keyframes l4 {
    100% {background-size:120%}
}
</style>