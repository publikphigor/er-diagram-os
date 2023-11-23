import { MarkerType } from "@vue-flow/core";

function getColumnLineage(node_index, column_index) {
  switch (node_index) {
    case 1:
      if (column_index === 3) {
        return {
          node_id: "3",
          column_id: `table_3/column_${column_index}`,
        };
      }
      break;
    case 2:
      if (column_index === 3) {
        return {
          node_id: "3",
          column_id: `table_3/column_${column_index}`,
        };
      }
      break;
    case 3:
      if (column_index === 6) {
        return {
          node_id: "5",
          column_id: `table_5/column_${column_index}`,
        };
      }
      break;
    case 4:
      if (column_index === 6) {
        return {
          node_id: "5",
          column_id: `table_5/column_${column_index}`,
        };
      }
      break;
    case 5:
      if (column_index === 1) {
        return {
          node_id: "6",
          column_id: `table_6/column_${column_index}`,
        };
      }
      if (column_index === 4) {
        return {
          node_id: "7",
          column_id: `table_7/column_${column_index}`,
        };
      }
      if (column_index === 7) {
        return {
          node_id: "8",
          column_id: `table_8/column_${column_index}`,
        };
      }
      break;
    default:
      return null;
  }
}

function generateColumnsArray(node_index) {
  const numColumns = 50;
  const columns = [];

  for (let i = 1; i <= numColumns; i++) {
    const column = {
      name: `COLUMN_${i}`,
      id: `table_${node_index}/column_${i}`,
      target: getColumnLineage(node_index, i),
      primary_key: i === 1,
      foreign_key: i === 4,
    };
    columns.push(column);
  }

  return columns;
}

let tables = [
  {
    id: "1",
    table_name: "table_1",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(1),
    node_id: "1",
    parentNodeIds: [],
    childNodesIds: [3],
    nodeZero: true,
    level: 1,
  },

  {
    id: "2",
    table_name: "table_2",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(2),
    node_id: "2",
    parentNodeIds: [],
    childNodesIds: [3],
    level: 1,
  },

  {
    id: "3",
    table_name: "table_3",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(3),
    node_id: "3",
    parentNodeIds: [1, 2],
    childNodesIds: [5],
    level: 2,
  },

  {
    id: "4",
    table_name: "table_4",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(4),
    node_id: "4",
    parentNodeIds: [],
    childNodesIds: [5],
    level: 2,
  },

  {
    id: "5",
    table_name: "table_5",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(5),
    node_id: "5",
    parentNodeIds: [3, 4],
    childNodesIds: [6, 7, 8],
    level: 3,
  },

  {
    id: "6",
    table_name: "table_6",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(6),
    node_id: "6",
    parentNodeIds: [5],
    childNodesIds: [],
    level: 4,
  },

  {
    id: "7",
    table_name: "table_7",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(7),
    node_id: "7",
    parentNodeIds: [5],
    childNodesIds: [],
    level: 4,
  },

  {
    id: "8",
    table_name: "table_8",
    database_name: "database_1",
    schema_name: "schema_1",
    columns: generateColumnsArray(8),
    node_id: "8",
    parentNodeIds: [5],
    childNodesIds: [],
    level: 4,
  },
];

function getTableLevels(tables) {
  const levels = {};

  tables.forEach((table) => {
    const { level, id } = table;

    if (!levels[level]) {
      levels[level] = [];
    }

    levels[level].push(id);
  });

  return levels;
}

function calculateYPosition(table, parentY) {
  const levels = getTableLevels(tables);
  const { level, id } = table;

  const tableIndex = levels[level].indexOf(id);
  const currentLevel = levels[level];
  const numChildren = currentLevel.length;

  if (numChildren < 2) {
    return parentY;
  }

  if (numChildren === 2) {
    return parentY + (tableIndex === 0 ? 0 : 500);
  }

  const yDistance = 500;

  // Calculate the middle index of the children
  const middleIndex = Math.floor(numChildren / 2);

  // Calculate the y position of the child node relative to the parent
  if (tableIndex < middleIndex) {
    // Child is on the left side of the parent
    return parentY + (tableIndex - middleIndex) * yDistance;
  } else if (tableIndex > middleIndex) {
    // Child is on the right side of the parent
    return parentY + (tableIndex - middleIndex) * yDistance;
  } else {
    // Child is at the middle (same y-axis as the parent)
    return parentY;
  }
}

function generateNode(table, fromId, tableId, parentNodePosition) {
  const parentNodes = table.parentNodeIds;
  const childNodeIds = table.childNodeIds;
  let baseNode = {
    id: tableId,
    type: "custom",
    data: {
      table_name: table.table_name,
      database_name: table.database_name,
      schema_name: table.schema_name,
      node_id: tableId,
      parent: fromId,
      childNodesIds: childNodeIds,
      parentNodesIds: parentNodes,
      nodeZero: table.nodeZero,
      columns: table.columns,
    },
    position: {
      x: table.level === 1 ? 350 : 350 * table.level,
      y: calculateYPosition(table, parentNodePosition.y),
    },
    hidden: false,
    connectable: false,
  };

  return baseNode;
}

function getColumnParentNodeId(columnId, nodes) {
  for (const node of nodes) {
    for (const column of node.data.columns) {
      if (column.id === columnId) {
        return node.id;
      }
    }
  }
}

function generateEdges(nodes) {
  const edges = [];

  for (const node of nodes) {
    for (const column of node.data.columns) {
      if (column.target) {
        const edge = {
          id: `edge-${column.id}`,
          source: getColumnParentNodeId(column.id, nodes),
          target: column.target.node_id,
          sourceHandle: `${column.id}-c`,
          targetHandle: `${column.target.column_id}-d`,
          markerEnd: MarkerType.Arrow,
          type: "smoothstep",
          zIndex: 9999,
        };
        edges.push(edge);
      }
    }
  }

  return edges;
}

export async function fetchLineage() {
  const nodes = tables.map((table) => {
    return generateNode(table, table.parentNodeIds[0], table.id, {
      x: 0,
      y: 0,
    });
  });

  const edges = generateEdges(nodes);

  console.log(nodes, "nodes");
  console.log(edges, "edges");

  return {
    nodes,
    edges,
  };
}

/**
* ====== TODOS ======
* 


* ==== DONE ====
* 
*/
