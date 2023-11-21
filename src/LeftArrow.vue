<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    :class="classList ? classList : 'arrow arrow_left'"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
    />
  </svg>
</template>

<script>
export default {
  name: "LeftArrow",
  props: {
    classList: {
      type: String,
      default: "",
    },
  },
};
</script>
