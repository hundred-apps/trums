<template>
  <div ref="container" class="table-scroll-container">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

const container = ref();

let scrollEl: HTMLElement | null = null;

let isDragging = false;

let startX = 0;
let startY = 0;

let scrollLeft = 0;
let scrollTop = 0;

onMounted(async () => {
  await nextTick();

  scrollEl = container.value.querySelector(".el-scrollbar__wrap");

  if (!scrollEl) return;

  scrollEl.style.cursor = "grab";

  scrollEl.addEventListener("mousedown", startDrag);
  scrollEl.addEventListener("mousemove", onDrag);
  scrollEl.addEventListener("mouseup", stopDrag);
  scrollEl.addEventListener("mouseleave", stopDrag);
});

const startDrag = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  if (
    target.closest("button") ||
    target.closest("input") ||
    target.closest(".el-input") ||
    target.closest(".el-button")
  ) {
    return;
  }

  isDragging = true;

  startX = e.pageX;
  startY = e.pageY;

  scrollLeft = scrollEl!.scrollLeft;
  scrollTop = scrollEl!.scrollTop;

  scrollEl!.style.cursor = "grabbing";
};

const onDrag = (e: MouseEvent) => {
  if (!isDragging) return;

  e.preventDefault();

  const x = e.pageX - startX;
  const y = e.pageY - startY;

  scrollEl!.scrollLeft = scrollLeft - x;
  scrollEl!.scrollTop = scrollTop - y;
};

const stopDrag = () => {
  isDragging = false;

  if (scrollEl) {
    scrollEl.style.cursor = "grab";
  }
};
</script>

<style scoped>
.table-scroll-container {
  width: 100%;
}
</style>
