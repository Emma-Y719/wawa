Page({

  /**
   * 页面的初始数据
   */
  data: {
    postList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.data.postList = [
      {
        id:1,
        big_picture:'https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358203237485.png',
        title:'六神花露水',
        price:100,
        decription:'decription',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
        icons:["star","chat"]
      },
      {
        id:2,
        big_picture:null,
        title:'求购！ 5号电池',
        price:null,
        decription:'blablabla',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
      },
      {
        id:3,
        big_picture:'https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358203237485.png',
        title:'六神花露水',
        price:100,
        decription:'decription',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
      },
      {
        id:4,
        big_picture:'https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358203237485.png',
        title:'六神花露水',
        price:100,
        decription:'decription',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
      },
      {
        id:5,
        big_picture:null,
        title:'求购！ 5号电池',
        price:null,
        decription:'blablabla',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
        icons:["star","chat"]
      },
      {
        id:6,
        big_picture:'https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358203237485.png',
        title:'六神花露水',
        price:100,
        decription:'decription',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
      },
      {
        id:7,
        big_picture:null,
        title:'求购！ 5号电池',
        price:null,
        decription:'blablabla',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
      },
      {
        big_picture:'https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358203237485.png',
        title:'六神花露水',
        price:100,
        decription:'decription',
        distance:'1.5KM',
        university:'南京信息工程大学',
        campus:'明故宫校区',
      }
    ]
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.waterfallRef = this.selectComponent('.waterfall');
    this.waterfallRef.render(this.data.postList);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.setNavigationBarTitle({
      title: '浏览历史'
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})