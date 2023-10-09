Component({
  // properties: {
  //   postList: {
  //     type: Array,
  //     value:[
  //     ]
  //   }
  // },
  data: {
    leftList: [],
    rightList: [],
  },
  methods: {
    render: function(postList=[],i=0) {
      if (i >= postList.length) return;
      if (!this.columnNodes) {
        const query = this.createSelectorQuery();
        this.columnNodes = query.selectAll('.left, .right');
      }
      this.columnNodes.boundingClientRect().exec((res) => {
        const rects = res[0];
        if (rects && rects.length) {
          const leftH = rects[0].height;
          const rightH = rects[1].height;
          if (leftH <= rightH) {
            this.data.leftList.push(postList[i]);
          } else {
            this.data.rightList.push(postList[i]);
          }
          this.setData({
              leftList: this.data.leftList,
              rightList: this.data.rightList
          }, () => {
              this.render(postList, ++i);
          })
        }
      })
    },
  },
})