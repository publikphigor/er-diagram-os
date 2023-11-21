import { MarkerType } from "@vue-flow/core";

function calculateYPosition(parentY, childIndex, numChildren) {
  if (numChildren < 2) {
    return parentY;
  }

  if (numChildren === 2) {
    return parentY + (childIndex === 0 ? 0 : 200);
  }

  const yDistance = 200; // Adjust this value as needed for your specific layout

  // Calculate the middle index of the children
  const middleIndex = Math.floor(numChildren / 2);

  // Calculate the y position of the child node relative to the parent
  if (childIndex < middleIndex) {
    // Child is on the left side of the parent
    return parentY + (childIndex - middleIndex) * yDistance;
  } else if (childIndex > middleIndex) {
    // Child is on the right side of the parent
    return parentY + (childIndex - middleIndex) * yDistance;
  } else {
    // Child is at the middle (same y-axis as the parent)
    return parentY;
  }
}

function calculateXPosition(newId, isUpstream, nodeZero, prevX) {
  if (newId) {
    if (isUpstream) {
      return prevX - 300;
    } else {
      return prevX + 300;
    }
  }

  if (nodeZero) {
    return isUpstream ? -300 : 0;
  }

  return isUpstream ? -300 : 300;
}

async function generateNode(
  tables,
  table,
  fromId,
  tableId,
  isNew,
  curId,
  asset_type,
  index,
  parentNodePosition,
  upstream = false
) {
  let parentNodes = await getParentNodes(upstream ? tableId : curId);
  parentNodes = parentNodes.filter((node) => node !== tableId);
  const siblingNodeIds = [];

  const childNodeIds = [];
  let baseNode = {
    type: "custom",
    data: {
      node_id: tableId,
      parent: fromId,
      childNodesIds: childNodeIds,
      hasChildNodes: childNodeIds.length > 0,
      parentNodesIds: parentNodes,
      hasParentNodes: parentNodes.length > 0,
      highlighted: false,
      checks: {},
      nodeZero: tableId === formatId(curId) || upstream,
      ancestor: upstream,
      asset_type,
    },
    position: {
      x: calculateXPosition(
        isNew,
        upstream,
        tableId === formatId(curId) || upstream,
        parentNodePosition?.x
      ),
      y: 0,
    },
    hidden: isNew ? false : index !== 0 ? true : false,
    connectable: false,
  };

  return baseNode;
}

/**
* ====== TODOS ======
* 


* ==== DONE ====
* 
*/
