// @ts-check
import {
  init, eachChildren, eachParents, makeMap,
} from './helper';

Component({
  options: {
    styleIsolation: 'apply-shared',
  },
  properties: {
    maxHeight: {
      type: String,
      value: '0',
    },
    nodes: {
      type: Array,
      value: [],
    },
    checkeds: {
      type: Array,
      value: [],
    },
  },
  data: {
    /**
     * @type {import('./types').RenderData[]}
     */
    renderList: [],
    /**
     * @type {import('./types').IdIndexMapping}
     */
    idIndexMapping: {},
    /**
     * @type {import('./types').IdChildrenMapping}
     */
    idChildrenMapping: {},
    /**
     * @type {{ [p: string]: Boolean }}
     */
    innerCheckeds: {},
  },
  observers: {
    nodes(nodes) {
      const { idIndexMapping, idChildrenMapping, renderList } = init(nodes);

      this.setData({
        renderList,
        idIndexMapping,
        idChildrenMapping,
      });
    },
    checkeds(checkeds) {
      this.setData({
        innerCheckeds: makeMap(checkeds),
      });
    },
  },
  methods: {
    /**
     * @param {WechatMiniprogram.BaseEvent} event
     */
    updateChildren(event) {
      const { currentTarget: { dataset: { index, isCollapse } } } = event;
      const { idChildrenMapping, renderList } = this.data;
      const item = renderList[index];

      if (isCollapse) {
        // 插入子节点
        const children = idChildrenMapping[item.id] || [];
        renderList.splice(index + 1, 0, ...children.map((i) => ({ ...i, level: item.level + 1 })));
        this.setData({
          renderList,
        });
      } else {
        // 移除后台节点
        const removes = {};
        eachChildren(item, (id) => idChildrenMapping[id], (id) => {
          removes[id] = true;
        });
        this.setData({
          renderList: renderList.filter((i) => !removes[i.id]),
        });
      }
    },
    /**
     * @param {WechatMiniprogram.CustomEvent} event
     */
    onChange(event) {
      const { currentTarget: { dataset: { index, id } } } = event;
      const {
        nodes, renderList, innerCheckeds: { ...innerCheckeds }, idIndexMapping, idChildrenMapping,
      } = this.data;
      const item = renderList[index];
      const checked = !innerCheckeds[id];

      function set(status, id) {
        if (status) {
          innerCheckeds[id] = true;
        } else {
          delete innerCheckeds[id];
        }
      }

      set(checked, item.id);

      const processedParents = {};

      eachChildren(item, (id) => idChildrenMapping[id], (id) => {
        set(checked, id);
      });

      eachParents(item, (id) => nodes[idIndexMapping[id]], (id) => {
        if (processedParents[id]) {
          return;
        }
        processedParents[id] = true;
        const children = idChildrenMapping[id];
        set(children.every((i) => innerCheckeds[i.id]), id);
      });

      this.triggerEvent('change', {
        checkeds: Object.keys(innerCheckeds),
      });
    },
  },
});
