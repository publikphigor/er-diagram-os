<script>
import { Handle, Position } from "@vue-flow/core";
import { computed, ref } from "vue";
import RightArrow from "./RightArrow.vue";
import LeftArrow from "./LeftArrow.vue";
import AngleUp from "./AngleUp.vue";
import AngleDown from "./AngleDown.vue";
import KeyIcon from "./KeyIcon.vue";

export default {
  components: {
    Handle,
    RightArrow,
    LeftArrow,
    AngleUp,
    AngleDown,
    KeyIcon,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const baseHandleStyles = computed(() => ({
      backgroundColor: "transparent",
      top: "50%",
      width: "0",
      height: "0",
      zIndex: 10,
      border: "none",
    }));

    const sourceHandleStyleA = computed(() => ({
      ...baseHandleStyles.value,
      right: "0",
    }));

    const sourceHandleStyleB = computed(() => ({
      ...baseHandleStyles.value,
      left: "0",
    }));

    const baseColumnHandleStyles = computed(() => ({
      backgroundColor: "transparent",
      top: "50%",
      width: "0",
      height: "0",
      border: "none",
      position: "absolute",
    }));

    const targetHandleStyleA = computed(() => ({
      ...baseColumnHandleStyles.value,
      right: "1px",
    }));

    const targetHandleStyleB = computed(() => ({
      ...baseColumnHandleStyles.value,
      left: "1px",
    }));

    const search = ref("");
    const columns = computed(() => {
      return props.data.columns.filter((col) =>
        col.name.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    return {
      emit,
      sourceHandleStyleA,
      sourceHandleStyleB,
      targetHandleStyleA,
      targetHandleStyleB,
      search,
      columns,
      Position,
    };
  },
};
</script>

<template>
  <div class="node">
    <div class="title">
      <h2 :title="data.table_name">{{ data.table_name }}</h2>
    </div>
    <div class="columns">
      <input
        type="text"
        v-model="search"
        :placeholder="`Search ${data.columns.length} columns...`"
        class="search"
      />

      <div class="content">
        <div
          v-for="col in columns"
          :key="col.id"
          class="column_node"
          @click.stop="emit('connectColumn', data.node_id, col.id)"
        >
          <Handle
            :id="`${col.id}-c`"
            type="source"
            :position="Position.Right"
            :style="targetHandleStyleA"
          />
          <h3 class="column_name" :title="col.name">
            {{ col.name }}
            <span class="key" v-if="col.primary_key">PK</span>
            <span class="key" v-if="col.foreign_key">FK</span>
          </h3>
          <Handle
            :id="`${col.id}-d`"
            type="target"
            :position="Position.Left"
            :style="targetHandleStyleB"
          />
        </div>
      </div>
    </div>

    <Handle
      id="a"
      type="source"
      :position="Position.Right"
      :style="sourceHandleStyleA"
    />

    <Handle
      id="b"
      type="target"
      :position="Position.Left"
      :style="sourceHandleStyleB"
    />
  </div>
</template>

<style scoped lang="scss">
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.node {
  background-color: #fff;
  border-radius: 5px;
  border: 1px solid #f1f1f1;
  font-size: 14px;
  font-family: sans-serif;
  text-align: left;
  max-width: 200px;
  position: relative;
  z-index: 8;
  overflow: hidden;

  &.highlight {
    border: 1px solid #495057;
  }

  .title {
    padding: 4px 8px;
    background-color: #333;
    position: relative;

    h2 {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 150px;
      margin: 0;
      font-size: 12px;
      font-weight: 500;
      color: #fff;
    }
  }

  .columns {
    background-color: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #f9f9f9;

    .search {
      width: 100%;
      padding: 4px 8px;
      border: none;
      margin: 4px 0;
      border-top: none;
      border-radius: 0 0 4px 4px;
      outline: none;
      color: #666;

      &::placeholder {
        font-size: 10px;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      max-height: 200px;
      width: 100%;
      max-height: 300px;
      overflow-y: auto;
      overflow-x: hidden;

      &::-webkit-scrollbar {
        width: 5px;
      }

      /* Track */
      &::-webkit-scrollbar-track {
        background-color: #f1f1f1;
        border-radius: 5px;
      }

      /* Handle */
      &::-webkit-scrollbar-thumb {
        background-color: #adb5bd;
        border-radius: 5px;
      }

      /* Handle on hover */
      &::-webkit-scrollbar-thumb:hover {
        background-color: #86868b;
      }
    }

    .column_node {
      position: relative;
    }
    .column_name {
      margin: 0;
      font-size: 10px;
      font-weight: 500;
      color: #333;
      padding: 5px;
      border: 1px solid #f1f1f1;
      background-color: #fff;
      border-radius: 4px;
      width: 100%;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .key {
        width: max-content;
        font-size: 12px;
        color: #86868b;
        flex-shrink: 0;
      }

      &.active {
        background-color: #323232;
        color: #fff;
      }
    }
  }

  .arrow {
    width: 15px;
    color: #fff;
  }
}
</style>
