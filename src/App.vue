<script>
import {
  MarkerType,
  Panel,
  VueFlow,
  isNode,
  isEdge,
  useVueFlow,
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import { ref, onMounted, nextTick, reactive, watch } from "vue";
import ProgressIcon from "./ProgressIcon.vue";
import {
  fetchLineage,
  findDownstreamNodes,
  findUpstreamNodes,
  findConnectedNodesAndEdges,
  fetchColumnLineage,
  getUpstreamNode,
  recomputeId,
  unFormatId,
} from "./initial-elements.js";
import Node from "./Node.vue";
import { useRoute } from "vue-router";

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
    const { onNodesInitialized, setViewport } = useVueFlow();

    /**
     * Our elements
     */
    // const token = ref(localStorage.getItem("access_token"));
    const route = useRoute();
    const loading = ref(false);
    const flowInstance = ref(null);
    let refs = reactive({});
    const elements = ref([]);
    const existingElements = ref({
      nodes: [],
      edges: [],
    });
    const hoveredNode = ref(null);
    const host_name = ref("");
    const database_name = ref("");
    const schema_name = ref("");
    const table_name = ref("");
    const asset_id = ref("");

    function setHoveredNode(nodeId) {
      hoveredNode.value = nodeId;
    }

    function generateElements(newNodes, edges) {
      // Create a map of new nodes for quick access
      const newNodesMap = new Map();
      newNodes.forEach((node) => {
        newNodesMap.set(node.id, node);
      });

      // filter out the nodes that are already in the graph from the old nodes
      elements.value = elements.value.filter((el) => {
        if (isNode(el)) {
          if (newNodesMap.has(el.id)) {
            return false;
          }
          return true;
        }
        return true;
      });

      elements.value = [...elements.value, ...newNodes, ...edges];

      const nodesArr = elements.value.filter((el) => isNode(el));
      const edgesArr = elements.value.filter((el) => isEdge(el));

      existingElements.value = {
        nodes: nodesArr,
        edges: edgesArr,
      };

      refs = {
        ...refs,
        ...newNodes.reduce((acc, node) => {
          acc[node.id] = ref(null);
          return acc;
        }, {}),
      };
    }

    const fetchData = async (asset_type) => {
      // Fetch data based on the route parameters and update the component
      loading.value = true;

      elements.value = [];
      existingElements.value = {
        nodes: [],
        edges: [],
      };

      let id;

      if (asset_type === "snowflake") {
        id = recomputeId(
          host_name.value,
          database_name.value,
          schema_name.value,
          table_name.value
        );
      }

      if (asset_type === "tableau_workbook") {
        id = asset_id.value;
      }

      const { nodes: nodesArr, edges } = await fetchLineage(id, false, []);
      generateElements(nodesArr, edges);
      loading.value = false;
    };

    watch(
      () => hoveredNode.value,
      (newVal) => {
        const downstreamNodes = findConnectedNodesAndEdges(
          newVal,
          existingElements.value.edges,
          "downstream"
        ).nodes;

        const upstreamNodes = findConnectedNodesAndEdges(
          newVal,
          existingElements.value.edges,
          "upstream"
        ).nodes;

        const upstreamEdges = findConnectedNodesAndEdges(
          newVal,
          existingElements.value.edges,
          "upstream"
        ).edges;

        const downstreamEdges = findConnectedNodesAndEdges(
          newVal,
          existingElements.value.edges,
          "downstream"
        ).edges;

        const allEdges = [...upstreamEdges, ...downstreamEdges];

        if (downstreamNodes.length === 0 && upstreamNodes.length === 0) return;

        elements.value = elements.value.map((el) => {
          if (isNode(el)) {
            el.data.highlighted =
              downstreamNodes.includes(el.id) || upstreamNodes.includes(el.id);
          } else {
            const edgeExistsInAllEdges =
              allEdges.some((edge) => edge.id === el.id) &&
              el.edgeType === "node";
            if (edgeExistsInAllEdges) {
              el.style.stroke = "#495057";
            } else if (el.edgeType === "node") {
              el.style.stroke = "#b1b1b7";
            }
          }

          return el;
        });
      }
    );

    watch(
      () => route.params,
      (newParams) => {
        host_name.value = newParams.host_name;
        database_name.value = newParams.database_name;
        schema_name.value = newParams.schema_name;
        table_name.value = newParams.table_name;
        asset_id.value = newParams.id;

        fetchData(asset_id.value ? "tableau_workbook" : "snowflake");
      },
      { immediate: true }
    );

    /**
     * onNodesInitialized is called when the graph has finished initializing
     */
    onNodesInitialized((nodes) => {
      if (flowInstance.value && nodes.length === 1) {
        nextTick(() => {
          flowInstance.value.fitView();
          flowInstance.value.zoomTo(1);
        });
      }
    });

    const dark = ref(false);

    /**
     * Resets the current viewpane transformation (zoom & pan)
     */
    function resetTransform() {
      return setViewport({ x: 0, y: 0, zoom: 1 });
    }

    async function toggleNodeUpstream(nodeId) {
      const node = elements.value.find((el) => el.data.node_id === nodeId);

      if (!node) return;

      let parentNodeIds = [];
      const upstreamNodeIds = findUpstreamNodes(
        nodeId,
        existingElements.value.edges
      ).filter((n) => n !== nodeId);

      upstreamNodeIds.forEach((n) => {
        const node = elements.value.find((el) => el.id === n);
        if (node) {
          parentNodeIds = [...parentNodeIds, node.id];
        }
      });

      if (parentNodeIds.length > 0) {
        let anyParentNodeShown = false;
        for (const id of parentNodeIds) {
          const node = elements.value.find((el) => el.id === id);
          if (!node.hidden) {
            anyParentNodeShown = true;
            break;
          }
        }

        elements.value = elements.value.map((el) => {
          if (anyParentNodeShown && parentNodeIds.includes(el.id)) {
            // Toggle hidden property only for parent nodes
            el.hidden = true;
          }

          if (
            parentNodeIds.includes(el.id) &&
            !anyParentNodeShown &&
            node.data.parentNodesIds.includes(el.data.node_id)
          ) {
            el.hidden = false;
          }
          return el;
        });
      } else {
        try {
          loading.value = true;
          let upstreamNodes = await getUpstreamNode(
            nodeId,
            existingElements.value.nodes
          );
          if (upstreamNodes.length > 0) {
            upstreamNodes = upstreamNodes.filter((n) => n !== nodeId);

            const edges = upstreamNodes.map((n) => {
              return {
                id: `node-edge-${n.id}-${nodeId}`,
                source: n.id,
                sourceHandle: "a",
                target: nodeId,
                targetHandle: "b",
                style: {
                  stroke: "#B1B1B7",
                  strokeWidth: 1,
                },
                edgeType: "node",
              };
            });

            generateElements(upstreamNodes, edges);
          }
          loading.value = false;
        } catch (error) {
          console.log(error);
          loading.value = false;
        } finally {
          loading.value = false;
        }
      }
    }

    async function toggleNodeDownstream(nodeId) {
      const node = elements.value.find((el) => el.data.node_id === nodeId);

      if (!node) return;

      const downstreamNodeIds = findDownstreamNodes(
        nodeId,
        existingElements.value.edges
      )
        .filter((n) => n !== nodeId)
        .map((n) => elements.value.find((el) => el.data.node_id === n).id);

      if (downstreamNodeIds.length > 0) {
        let anyDownstreamNodeShown = false;
        for (const id of downstreamNodeIds) {
          const node = elements.value.find((el) => el.id === id);

          if (!node.hidden) {
            anyDownstreamNodeShown = true;
            break;
          }
        }

        elements.value = elements.value.map((el) => {
          if (anyDownstreamNodeShown && downstreamNodeIds.includes(el.id)) {
            // Toggle hidden property only for downstream nodes
            el.hidden = true;
          }

          if (
            downstreamNodeIds.includes(el.id) &&
            !anyDownstreamNodeShown &&
            node.data.childNodesIds.includes(el.data.node_id)
          ) {
            el.hidden = false;
          }
          return el;
        });
      } else {
        try {
          loading.value = true;
          const { nodes: nodesArr, edges } = await fetchLineage(
            node.data.node_id,
            true,
            existingElements.value.nodes,
            node.position
          );

          const newNodes = nodesArr.map((n) => {
            return {
              ...n,
              hidden: false,
            };
          });

          generateElements(newNodes, edges);

          loading.value = false;
        } catch (error) {
          console.log(error);
          loading.value = false;
        }
      }
    }

    function getColumnParentNodes(columnsArr) {
      if (columnsArr.length === 0) return { parentNodes: [], columns: [] };
      let parentNodes = [];
      let columns = [];
      const nodes = existingElements.value.nodes;
      for (const node of nodes) {
        for (const column of node.data.columns) {
          if (columnsArr.includes(column.id.toLowerCase())) {
            parentNodes.push(node);
            columns.push(column);
          }
        }
      }

      return { parentNodes, columns };
    }

    function getUpstreamColumns(nodeId, columnsArr) {
      const upstreamNodes = findUpstreamNodes(
        nodeId,
        existingElements.value.edges
      ).filter((n) => n !== nodeId);
      const nodes = existingElements.value.nodes;
      const columns = [];

      for (const nodeId of upstreamNodes) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          for (const col of node.data.columns) {
            if (columnsArr.includes(col.id.toLowerCase())) {
              columns.push(col.id);
            }
          }
        }
      }
      return columns;
    }

    function getParentNode(colId) {
      const nodes = existingElements.value.nodes;
      let node = null;

      for (const n of nodes) {
        for (const col of n.data.columns) {
          if (col.id.toLowerCase() === colId.toLowerCase()) {
            node = n;
          }
        }
      }
      return node || { id: 111 };
    }

    function toggleHighlightColumn(colIdArr, highlight = true) {
      const colIds = colIdArr.map((colId) => colId.toLowerCase());
      elements.value = elements.value.map((el) => {
        if (isNode(el)) {
          for (const col of el.data.columns) {
            if (colIds.includes(col.id.toLowerCase())) {
              col.highlighted = highlight;
            }
          }
        }
        return el;
      });
    }

    function removeEdgeAndHightlight(edgeId, colIdArr) {
      toggleHighlightColumn(colIdArr, false);

      elements.value = elements.value.filter((el) => {
        if (el.id === edgeId) {
          return false;
        }
        return true;
      });
    }

    function resetColumnsHighlight(newEdges, newColumns) {
      return new Promise((resolve, _reject) => {
        elements.value = elements.value.map((el) => {
          if (isNode(el)) {
            for (const col of el.data.columns) {
              if (!newColumns.includes(col.id.toLowerCase())) {
                col.highlighted = false;
              }
            }
          }
          return el;
        });

        let edges = elements.value.filter((el) => isEdge(el));
        edges = edges.filter(
          (el) => !el.id.includes("col-edge") || newEdges.includes(el.id)
        );

        elements.value = [
          ...elements.value.filter((el) => isNode(el)),
          ...edges,
        ];

        resolve(elements.value);
      });
    }

    async function connectColumn(nodeId, colId) {
      loading.value = true;
      const res = await fetchColumnLineage(colId);

      loading.value = false;
      if (!res.length) return;

      const targetIds = res.map((r) => {
        if (r.to_id === colId) {
          return r.from_id.toLowerCase();
        }
        return r.to_id.toLowerCase();
      });
      const targetIdsNormal = res.map((r) => {
        if (r.to_id === colId) {
          return r.from_id;
        }
        return r.to_id;
      });

      const nodes = getColumnParentNodes(targetIds).parentNodes;
      const targetColumns = getColumnParentNodes(targetIds).columns;
      const upstreamColumns = getUpstreamColumns(nodeId, targetIds);

      if (nodes.length === 0) return;

      // Rearrange columns in source node
      const sourceNode = elements.value.find((el) => el.id === nodeId);
      const sourceNodeColumnsRest = sourceNode.data.columns.filter(
        (col) => col.id !== colId
      );
      const sourceNodeColumns = sourceNode.data.columns.filter(
        (col) => col.id === colId
      );

      elements.value = elements.value.map((el) => {
        if (el.id === nodeId) {
          el.data.columns = [...sourceNodeColumns, ...sourceNodeColumnsRest];
        }
        return el;
      });

      // Rearrange columns in each target node
      nodes.forEach((node, i) => {
        const targetNodeColumnsRest = node.data.columns.filter(
          (col) => col.id !== targetColumns[i].id
        );
        const targetNodeColumns = node.data.columns.filter(
          (col) => col.id === targetColumns[i].id
        );

        elements.value = elements.value.map((el) => {
          if (el.id === node.id) {
            el.data.columns = [...targetNodeColumns, ...targetNodeColumnsRest];
          }
          return el;
        });
      });

      const nodeIds = nodes.map((n) => n.id);

      nodeIds.forEach((nodeId) => {
        if (refs[nodeId]?.value) {
          refs[nodeId].value.openDropdown();
        }
      });

      if (targetIdsNormal.length === 0) return;

      const newEdgeIds = targetIdsNormal.map((target) => {
        return `col-edge-${colId}-${target}`;
      });

      // Remove existing edges and highlight
      await resetColumnsHighlight(newEdgeIds, targetIds);

      targetIdsNormal.forEach((target) => {
        // Check if the edge with the same ID exists
        const edgeId = `col-edge-${colId}-${target}`;

        let existingEdge = false; // Initialize as false

        for (const el of elements.value) {
          if (el.edgeType === "column" && el.id === edgeId) {
            existingEdge = true;
            break;
          }
        }

        if (existingEdge) {
          // Remove the existing edge
          removeEdgeAndHightlight(edgeId, [colId, target]);
        } else {
          toggleHighlightColumn([colId, target]);

          // Add the new edge
          const newEdge = {
            id: edgeId,
            source: nodeId,
            sourceHandle: upstreamColumns.includes(target) ? "d" : "c",
            target: getParentNode(target).id,
            targetHandle: upstreamColumns.includes(target) ? "c" : "d",
            edgeType: "column",
            style: {
              stroke: "#023e8a",
            },
            zIndex: 9999,
          };
          elements.value = [...elements.value, newEdge];
        }
      });
    }
    return {
      loading,
      elements,
      flowInstance,
      existingElements,
      hoveredNode,
      dark,
      refs,
      resetTransform,
      toggleNodeUpstream,
      toggleNodeDownstream,
      connectColumn,
      setHoveredNode,
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
    <Background :pattern-color="dark ? '#FFFFFB' : '#aaa'" gap="8" />

    <MiniMap />

    <Controls />

    <template #node-custom="{ data }">
      <Node
        :data="data"
        @toggleNodeDownstream="(nodeId) => toggleNodeDownstream(nodeId)"
        @toggleNodeUpstream="(nodeId) => toggleNodeUpstream(nodeId)"
        @connectColumn="(nodeId, colId) => connectColumn(nodeId, colId)"
        @setHoveredNode="(nodeId) => setHoveredNode(nodeId)"
        :ref="refs[data.node_id]"
      />
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
</style>
