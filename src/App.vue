<template>
  <main class="main">
    <canvas
        class="canvas"
        ref="canvasRef"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="dragging=false"
        :width="canvasSize"
        :height="canvasSize"
    ></canvas>
    <section>
      <label class="label">
        Circle radius
        <input v-model="circleRadius" type="number">
      </label>
      <label class="label">
        Square side
        <input v-model="squareSide" type="number">
      </label>
      <label class="label">
        Square X
        <input v-model.lazy="squareCoords.x" type="number">
      </label>
      <label class="label">
        Square Y
        <input v-model.lazy="squareCoords.y" type="number">
      </label>
    </section>
  </main>
</template>

<script setup>
import {ref, watch, onMounted, watchEffect, reactive} from 'vue'

const canvasSize = 500
const circleRadius = ref(200)
const squareSide = ref(50)
let squareCoords = reactive({ x: canvasSize / 2 - squareSide.value / 2, y: canvasSize / 2 - squareSide.value / 2 })
const canvasRef = ref(null)
let dragging = false

function drawCircle(ctx) {
  ctx.beginPath()
  ctx.arc(canvasSize / 2, canvasSize / 2, circleRadius.value, 0, Math.PI * 2)
  ctx.fillStyle = 'red'
  ctx.fill()
  ctx.stroke()
}

function drawSquare(ctx) {
  ctx.beginPath()
  ctx.rect(squareCoords.x, squareCoords.y, squareSide.value, squareSide.value)
  ctx.fillStyle = 'black'
  ctx.fill()
  ctx.stroke()
}

function redraw() {
  const ctx = canvasRef.value.getContext('2d')
  ctx.clearRect(0, 0, canvasSize, canvasSize)
  drawCircle(ctx)
  drawSquare(ctx)
}

function getCoordsWithinCircle(proposedCoords) {
  const dx = proposedCoords.x + squareSide.value / 2 - canvasSize / 2
  const dy = proposedCoords.y + squareSide.value / 2 - canvasSize / 2
  const distToCenter = Math.sqrt(dx * dx + dy * dy)
  if (distToCenter + squareSide.value / 2 <= circleRadius.value) {
    return proposedCoords
  } else {
    const ratio = (circleRadius.value - squareSide.value / 2) / distToCenter
    return {
      x: canvasSize / 2 + dx * ratio - squareSide.value / 2,
      y: canvasSize / 2 + dy * ratio - squareSide.value / 2
    }
  }
}

function onMouseDown(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  if (
      x > squareCoords.x &&
      x < squareCoords.x + squareSide.value &&
      y > squareCoords.y &&
      y < squareCoords.y + squareSide.value
  ) dragging = true
}

function onMouseMove(e) {
  if (!dragging) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const proposedNewCoords = {
    x: Math.round(x - squareSide.value / 2),
    y: Math.round(y - squareSide.value / 2)
  }

  squareCoords.x = Math.round(getCoordsWithinCircle(proposedNewCoords).x)
  squareCoords.y = Math.round(getCoordsWithinCircle(proposedNewCoords).y)
  redraw()
}

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

watch([circleRadius, squareSide], redraw, { deep: true })

watchEffect(() => {
  const newCoords = getCoordsWithinCircle(squareCoords)
  if (newCoords.x !== squareCoords.x || newCoords.y !== squareCoords.y) {
    squareCoords.x = Math.round(newCoords.x)
    squareCoords.y = Math.round(newCoords.y)
    redraw()
  }
})

watch([() => squareCoords.x, () => squareCoords.y], debounce(redraw, 500))

onMounted(redraw)

</script>
<style>
body {
  margin: 0;
}
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}
.main {
  display: flex;
  user-select: none;
}
.canvas {
  border: 2px solid black;
  margin-right: 20px;
}
.label {
  display: block;
  text-align: end;
}
</style>
