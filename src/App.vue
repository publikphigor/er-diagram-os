<script>
import { Panel, VueFlow, useVueFlow } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { ref, nextTick, onMounted } from "vue";
import ProgressIcon from "./ProgressIcon.vue";
import { fetchLineage } from "./initial-elements.js";
import Node from "./Node.vue";

export default {
  name: "Lineage",
  components: {
    VueFlow,
    Background,
    Controls,
    MiniMap,
    ProgressIcon,
    Panel,
    Node,
  },

  setup() {
    /**
     * useVueFlow provides all event handlers and store properties
     * You can pass the composable an object that has the same properties as the VueFlow component props
     */
    const { onNodesInitialized, onNodesChange } = useVueFlow();

    /**
     * Our elements
     */
    const loading = ref(false);
    const flowInstance = ref(null);
    const elements = ref([]);

    /**
     * onNodesInitialized is called when the graph has finished initializing
     */
    onNodesInitialized(() => {
      if (flowInstance.value) {
        nextTick(() => {
          flowInstance.value.fitView();
          flowInstance.value.zoomTo(1);
        });
      }
    });

    onNodesChange(() => {
      resetTransform();
    });

    const dark = ref(false);

    /**
     * Resets the current viewpane transformation (zoom & pan)
     */
    function resetTransform() {
      if (flowInstance.value) {
        nextTick(() => {
          flowInstance.value.fitView();
          flowInstance.value.zoomTo(1);
        });
      }
    }

    onMounted(() => {
      loading.value = true;
      fetchLineage().then((data) => {
        elements.value = [...data.nodes, ...data.edges];
        loading.value = false;
      });
    });

    return {
      loading,
      elements,
      flowInstance,
      dark,
      resetTransform,
    };
  },
};
</script>

<template>
  <div class="loader" v-if="loading" @click.stop>
    <ProgressIcon classList="progress" />
  </div>
  <VueFlow
    v-model="elements"
    :class="{ dark }"
    class="basicflow"
    :default-viewport="{ zoom: 1 }"
    :min-zoom="0.2"
    :max-zoom="4"
    fit-view-on-init
    ref="flowInstance"
  >
    <Background :bg-color="'#fff'" />

    <MiniMap />

    <Controls />

    <template #node-custom="{ data }">
      <Node :data="data" @setHoveredNode="(nodeId) => setHoveredNode(nodeId)" />
    </template>

    <Panel position="top-right" class="controls">
      <button
        style="background-color: #113285; color: white"
        title="Reset Transform"
        @click="resetTransform"
      >
        <svg width="16" height="16" viewBox="0 0 32 32">
          <path
            fill="#FFFFFB"
            d="M18 28A12 12 0 1 0 6 16v6.2l-3.6-3.6L1 20l6 6l6-6l-1.4-1.4L8 22.2V16a10 10 0 1 1 10 10Z"
          />
        </svg>
      </button>
    </Panel>
  </VueFlow>
</template>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.loader {
  position: fixed;
  width: 100%;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 99;

  .progress {
    margin: 0 auto;
    display: block;
    width: 200px;
  }
}

.icon {
  width: 24px;
  height: 24px;
}
</style>
