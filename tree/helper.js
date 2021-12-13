// @ts-check

/**
 * @typedef {import('./types').PropData} PropData
 * @typedef {import('./types').RenderData} RenderData
 * @typedef {import('./types').IdChildrenMapping} IdChildrenMapping
 * @typedef {import('./types').IdIndexMapping} IdIndexMapping
 */

/**
 * @param {string[]} arr
 */
export function makeMap(arr) {
  // eslint-disable-next-line
  return arr.reduce((total, cur) => (total[cur] = true, total), {});
}

/**
 * @param {PropData[]} nodes
 */
export function init(nodes) {
  /**
   * @type {IdChildrenMapping}
   */
  const idChildrenMapping = {};
  /**
   * @type {IdIndexMapping}
   */
  const idIndexMapping = {};

  nodes.forEach((item, index) => {
    idIndexMapping[item.id] = index;

    if (!idChildrenMapping[item.parentId]) {
      idChildrenMapping[item.parentId] = [];
    }
    idChildrenMapping[item.parentId].push(item);
  });

  const roots = idChildrenMapping.null || [];
  /**
   * @type {RenderData[]}
   */
  const renderList = roots.map((item) => ({ ...item, level: 0 }));

  return { idIndexMapping, idChildrenMapping, renderList };
}

/**
 * @param {PropData} parent
 * @param {{(id: string): PropData[]}} childrenGetter
 * @param {(p: string) => void} handler
 */
export function eachChildren(parent, childrenGetter, handler) {
  const children = childrenGetter(parent.id) || [];

  children.forEach((i) => {
    handler(i.id);
    eachChildren(i, childrenGetter, handler);
  });
}

/**
 * @param {PropData} current
 * @param {(id: string) => PropData} getter
 * @param {(p: string) => void} handler
 */
export function eachParents(current, getter, handler) {
  const parent = getter(current.parentId);
  if (parent) {
    handler(parent.id);
    eachParents(parent, getter, handler);
  }
}
