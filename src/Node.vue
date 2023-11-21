<script>
import { Handle, Position } from "@vue-flow/core";
import { computed, ref } from "vue";
import RightArrow from "./RightArrow.vue";
import LeftArrow from "./LeftArrow.vue";
import AngleUp from "./AngleUp.vue";
import AngleDown from "./AngleDown.vue";

export default {
  components: {
    Handle,
    RightArrow,
    LeftArrow,
    AngleUp,
    AngleDown,
    SnowflakeIcon,
    TableauIcon,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  setup(props, { emit }) {
    const childRef = ref(null);

    const callChildMethod = () => {
      childRef.value.childMethod();
    };

    const baseHandleStyles = computed(() => ({
      backgroundColor: "#adb5bd",
      top: "50%",
      width: "20px",
      height: "30px",
      zIndex: 10,
      borderRadius: "0",
      border: "none",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      justifyContent: "center",
      cursor: "pointer",
    }));

    const sourceHandleStyleA = computed(() => ({
      ...baseHandleStyles.value,
      right: "-20px",
    }));

    const sourceHandleStyleB = computed(() => ({
      ...baseHandleStyles.value,
      left: "-20px",
    }));

    const baseColumnHandleStyles = computed(() => ({
      backgroundColor: props.data.highlighted ? "#fff" : "#495057",
      top: "50%",
      width: "2px",
      height: "2px",
      borderRadius: "50%",
      border: "none",
      position: "absolute",
    }));

    const targetHandleStyleA = computed(() => ({
      ...baseColumnHandleStyles.value,
      right: "-1px",
    }));

    const targetHandleStyleB = computed(() => ({
      ...baseColumnHandleStyles.value,
      left: "-1px",
    }));

    const isDropdownActive = ref(false);

    const toggleDropdown = () => {
      isDropdownActive.value = !isDropdownActive.value;
    };

    const openDropdown = () => {
      isDropdownActive.value = true;
    };

    const search = ref("");
    const columns = computed(() => {
      return props.data.columns.filter((col) =>
        col.name.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    function getPassingRatio(data) {
      let { color, bgColor, passingRatio } = {
        color: "#86868b",
        bgColor: "#9E9E9E14",
        passingRatio: "0",
      };

      if (!data || typeof data === "undefined") {
        return { color, bgColor, passingRatio };
      }
      if ("enabled_checks" in data) {
        if (data?.failed_checks > 0) {
          return {
            color: "#e03a3e",
            bgColor: "#F4433614",
            passingRatio: `${data?.passed_checks}/${data?.enabled_checks}`,
          };
        } else if (data?.enabled_checks === 0) {
          return {
            color: "#86868b",
            bgColor: "#9E9E9E14",
            passingRatio,
          };
        } else if (
          data?.passed_checks >= 1 &&
          data?.passed_checks === data?.enabled_checks
        ) {
          return {
            color: "#279345",
            bgColor: "#27934514",
            passingRatio: `${data?.passed_checks}/${data?.enabled_checks}`,
          };
        } else {
          return {
            color: "",
            bgColor: "",
            passingRatio: "",
          };
        }
      } else {
        return {
          color: "#86868b",
          bgColor: "#9E9E9E14",
          passingRatio,
        };
      }
    }

    function getTooltip(data) {
      if (!data || typeof data === "undefined") {
        return "No checks are enabled";
      }
      if ("enabled_checks" in data) {
        if (data?.failed_checks > 0) {
          return `${data?.failed_checks} ${
            data?.failed_checks > 1 ? "checks are" : "check is"
          } failing`;
        } else if (data?.enabled_checks === 0) {
          return "No checks are enabled";
        } else if (
          data?.passed_checks >= 1 &&
          data?.passed_checks === data?.enabled_checks
        ) {
          return "All checks are passing";
        } else {
          return "";
        }
      } else {
        return "No checks are enabled";
      }
    }

    return {
      childRef,
      callChildMethod,
      emit,
      sourceHandleStyleA,
      sourceHandleStyleB,
      targetHandleStyleA,
      targetHandleStyleB,
      isDropdownActive,
      toggleDropdown,
      openDropdown,
      search,
      columns,
      Position,
      getPassingRatio,
      getTooltip,
      navigateToTable,
    };
  },
};
</script>

<template>
  <div
    class="node"
    :class="{
      highlight: data.highlighted,
    }"
    @mouseenter="emit('setHoveredNode', data.node_id)"
    @mouseleave="emit('setHoveredNode', null)"
    :title="getTooltip(data.checks.metadata)"
    @click.stop="
      navigateToTable(
        data.host_name,
        data.database_name,
        data.schema_name,
        data.table_name,
        data.node_id,
        data.asset_type
      )
    "
  >
    <div class="d_obj_header">
      <div class="title">
        <span>{{ data.database_name }}</span>
        <span>{{ data.schema_name }}</span>
        <h2 :title="data.table_name">{{ data.table_name }}</h2>
      </div>
      <div class="indicators">
        <SnowflakeIcon v-if="data.asset_type === 'snowflake'" />
        <TableauIcon v-if="data.asset_type.includes('tableau')" />
        <span
          class="passing_ratio"
          :style="{
            color: getPassingRatio(data.checks.metadata).color,
            backgroundColor: getPassingRatio(data.checks.metadata).bgColor,
          }"
        >
          {{ getPassingRatio(data.checks.metadata).passingRatio }}
        </span>
      </div>
    </div>
    <div
      class="columns"
      :class="{
        active: isDropdownActive,
      }"
    >
      <div
        class="columns_length"
        @click.stop="data.columns.length > 0 ? toggleDropdown() : null"
      >
        <span>{{ data.columns.length }} Columns</span>
        <span v-if="data.columns.length">
          <AngleUp v-if="!isDropdownActive" />
          <AngleDown v-if="isDropdownActive" />
        </span>
      </div>
      <input
        type="text"
        v-model="search"
        placeholder="Search columns..."
        class="search"
        v-if="data.columns.length > 0 && isDropdownActive"
      />

      <div class="content">
        <div
          v-for="col in columns"
          :key="col.id"
          class="column_node"
          @click.stop="emit('connectColumn', data.node_id, col.id)"
        >
          <Handle
            id="c"
            type="source"
            :position="Position.Right"
            :style="{
              ...targetHandleStyleA,
              backgroundColor: col.highlighted ? '#0077b6' : '#495057',
              opacity: col.highlighted ? 1 : 0,
            }"
          />
          <h3
            class="column_name"
            :class="{
              active: col.highlighted,
            }"
            :title="col.name"
          >
            {{ col.name }}
          </h3>
          <Handle
            id="d"
            type="target"
            :position="Position.Left"
            :style="{
              ...targetHandleStyleB,
              backgroundColor: col.highlighted ? '#0077b6' : '#495057',
              opacity: col.highlighted ? 1 : 0,
            }"
          />
        </div>
      </div>
    </div>

    <div
      v-if="data.hasChildNodes"
      @click.stop="
        data.ancestor ? null : emit('toggleNodeDownstream', data.node_id)
      "
    >
      <Handle
        id="a"
        type="source"
        :position="Position.Right"
        :style="sourceHandleStyleA"
      >
        <RightArrow v-if="!data.ancestor" />
      </Handle>
    </div>

    <div
      @click.stop="
        data.hasParentNodes && data.nodeZero
          ? emit('toggleNodeUpstream', data.node_id)
          : null
      "
      v-if="data.hasParentNodes || !data.nodeZero"
    >
      <Handle
        id="b"
        type="target"
        :position="Position.Left"
        :style="sourceHandleStyleB"
      >
        <LeftArrow v-if="data.hasParentNodes && data.nodeZero" />
      </Handle>
    </div>
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
  padding: 10px;
  font-size: 14px;
  font-family: sans-serif;
  text-align: left;
  max-width: 200px;
  position: relative;
  z-index: 8;

  &.highlight {
    border: 1px solid #495057;
  }

  .d_obj_header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;

    .indicators {
      width: max-content;
      display: flex;
      gap: 5px;
      align-items: center;

      .passing_ratio {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 10px;
        flex-shrink: 0;
      }
    }
  }

  .title {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    span {
      display: block;
      font-size: 10px;
      color: #86868b;
      text-transform: uppercase;
    }
    h2 {
      margin: 0;
      margin-top: 5px;
      font-size: 12px;
      font-weight: 500;
      color: #333;
    }
  }

  .columns {
    background-color: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #f9f9f9;
    margin-top: 16px;

    .columns_length {
      font-size: 12px;
      color: #666;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      cursor: pointer;
      width: 100%;
      padding: 2px 4px;

      .angle {
        width: 15px;
        color: #666;
      }
    }

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
      gap: 5px;
      max-height: 200px;
      width: 100%;
      overflow: hidden;
      max-height: 0;
    }

    .column_node {
      position: relative;
      cursor: pointer;
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

      &:hover {
        background-color: #915cfb11;
      }
      &.active {
        background-color: #023e8a6f;
        color: #fff;
      }
    }
  }

  .columns.active {
    .content {
      padding: 8px;
      max-height: 200px;
      transition: max-height 0.3s ease-in-out;
      overflow-y: auto;
    }
  }

  .arrow {
    width: 15px;
    color: #fff;
  }
}
</style>
