<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    :class="classList ? classList : 'angle angle_up'"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
</template>

<script>
export default {
  name: "AngleUp",
  props: {
    classList: {
      type: String,
      default: "",
    },
  },
};
</script>
