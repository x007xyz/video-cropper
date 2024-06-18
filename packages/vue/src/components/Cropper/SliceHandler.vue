<template>
  <div
    class="slice-content"
    :style="{ width: width + 'px', height: wrapperHeight + 'px', transform: `translateX(${start}px)` }"
  >
    <div class="slice-border" style="top: -4px"></div>
    <div class="slice-border" style="bottom: -4px"></div>
    <div
      class="slice-handler"
      style="left: -11px; border-top-left-radius: 4px; border-bottom-left-radius: 4px"
      @click="onClick"
      @mousedown="onMouseDown($event, 'start')"
    >
    </div>
    <div
      class="slice-handler"
      style="right: -11px; border-top-right-radius: 4px; border-bottom-right-radius: 4px"
      @click="onClick"
      @mousedown="onMouseDown($event, 'end')"
    >
    </div>
    <!-- {{ duration }} -->
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  // import { CLIPMAX, CLIPMIN, OFFSETLEFT, SECONDPXRATIO } from './constant'
  // import { message } from 'ant-design-vue'

  const props = defineProps<{
    start: number,
    end: number,
    min: number,
    max: number,
    wrapperWidth: number,
    wrapperHeight: number
  }>()

  const emits = defineEmits<{
    dragStart: []
    dragEnd: []
    dragging: [{ slice: { start: number, end: number }, dragType: 'start' | 'end' }]
  }>()

  const width = computed(() => props.end - props.start)

  // const duration = computed(() => parseInt(width.value / SECONDPXRATIO) + 's')

  let isDragging = false
  function onMouseDown(event: MouseEvent, type: 'start' | 'end') {
    console.log('onMouseDown')
    event.preventDefault()
    event.stopPropagation()
    // 拖拽开始
    emits('dragStart')
    isDragging = true

    let startX = event.pageX

    document.onmousemove = (e) => {
      if (isDragging) {
        e.preventDefault()
        e.stopPropagation()
        const diff = e.pageX - startX
        const newPosition = { start: props.start, end: props.end }
        newPosition[type] += diff
        // 处理极值情况
        if (
          newPosition.end - newPosition.start < props.min ||
          newPosition.end - newPosition.start > props.max ||
          newPosition.start < 0 ||
          newPosition.end > props.wrapperWidth
        ) {
          startX = e.pageX
          return
        }
        // 触发事件
        emits('dragging', { slice: newPosition, dragType: type })
        startX = e.pageX
      }
    }

    document.onmouseup = (e) => {
      e.preventDefault()
      e.stopPropagation()
      isDragging = false
      emits('dragEnd')
      document.onmousedown = null
      document.onmousemove = null
    }
  }

  function onClick(e) {
    console.log('🚀 ~ onClick ~ e:', e)
    e.stopPropagation()
  }
</script>

<style scoped>
  .slice-border {
    background-color: #00b43b;
    position: absolute;
    left: -1px;
    right: -1px;
    height: 3px;
  }
  .slice-handler {
    background-color: #00b43b;
    position: absolute;
    top: -4px;
    bottom: -4px;
    width: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
  }

  .slice-handler::after {
    content: '';
    display: inline-block;
    width: 4px;
    height: 17.25px;
    background: #ffffff;
    border-radius: 2px;
  }

  .slice-content {
    position: absolute;
    top: 0;
    height: 40px;
    border: 1px solid #fff;
    border-radius: 2px;
    font-weight: 400;
    font-size: 12px;
    color: #ffffff;
    text-align: center;
    line-height: 40px;
  }
</style>
