Page({
  data: {
    items: [], // 存储数据项的数组
  },
  onLoad: function () {
    // 模拟加载数据
    this.loadItems();
  },
  loadItems: function () {
    // 模拟异步加载数据
    setTimeout(() => {
      // 假设 data 是你的数据数组，包含了每个数据项的高度
      const data = [
        { id: 1, height: 200, content: '内容1' },
        { id: 2, height: 150, content: '内容2' },
        { id: 3, height: 200, content: '内容1' },
        { id: 4, height: 150, content: '内容2' },
        // ...
      ];

      const items = []; // 存储所有数据项的数组
      let column1 = 0;
      let column2 = 0;

      data.forEach((item, index) => {
        // 决定将数据项添加到哪一列
        if (column1 <= column2) {
          items.push({ ...item, column: 1 });
          column1 += item.height;
        } else {
          items.push({ ...item, column: 2 });
          column2 += item.height;
        }
      });

      this.setData({
        items: items,
      });
    }, 1000);
  },
});
