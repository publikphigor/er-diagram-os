<template>
  <!-- License: MIT. Made by elusiveicons: https://elusiveicons.com -->
  <svg
    version="1.1"
    id="svg2"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
    sodipodi:docname="key.svg"
    inkscape:version="0.48.4 r9939"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="800px"
    height="800px"
    viewBox="0 0 1200 1200"
    enable-background="new 0 0 1200 1200"
    xml:space="preserve"
    :class="classList ? classList : 'icon key_icon'"
  >
    <sodipodi:namedview
      inkscape:cy="427.08224"
      inkscape:cx="675.06201"
      inkscape:zoom="0.26339286"
      showgrid="false"
      id="namedview30"
      guidetolerance="10"
      gridtolerance="10"
      objecttolerance="10"
      borderopacity="1"
      bordercolor="#666666"
      pagecolor="#ffffff"
      inkscape:current-layer="svg2"
      inkscape:window-maximized="1"
      inkscape:window-y="24"
      inkscape:window-height="876"
      inkscape:window-width="1535"
      inkscape:pageshadow="2"
      inkscape:pageopacity="0"
      inkscape:window-x="65"
    >
    </sodipodi:namedview>
    <path
      id="path12963"
      inkscape:connector-curvature="0"
      d="M328.261,271.758C146.977,271.758,0,418.697,0,599.981
	c0,181.283,146.977,328.261,328.261,328.261c161.72,0,296.083-116.959,323.206-270.903c0.306,0.017,0.605,0.064,0.912,0.076h126.386
	v182.46h139.538v-182.46h65.796v264.068h139.538V657.414H1200V517.878H647.095c-0.322,0.026-0.63,0.048-0.95,0.076
	C609.721,376.371,481.219,271.758,328.261,271.758L328.261,271.758z M328.261,423.611c97.415,0,176.37,78.955,176.37,176.37
	c0,97.414-78.955,176.407-176.37,176.407s-176.408-78.993-176.408-176.407C151.853,502.566,230.847,423.611,328.261,423.611
	L328.261,423.611z"
    />
  </svg>
</template>

<script>
export default {
  name: "KeyIcon",
  props: {
    classList: {
      type: String,
      default: "",
    },
  },
};
</script>
