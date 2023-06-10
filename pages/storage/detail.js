// pages/search/index.js
//导入request请求工具类
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indices:[],
    university:"",
    name:"",
    campus:"",
    type:"",
    baseUrl:'',
    id:-1,
    productList:[],
    floatButtonVisible: false,
    left: 0, // 悬浮窗左侧距离
    top: 0, // 悬浮窗顶部距离
    startX: 0, // 手指起始X坐标
    startY: 0, // 手指起始Y坐标
    pic:""
  },
  onFloatButtonTap() {
    wx.navigateTo({
      url: '/pages/search/map'
    });
  },
   // 悬浮窗触摸开始事件
   onTouchStart: function (e) {
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    });
  },

  // 悬浮窗触摸移动事件
  onTouchMove: function (e) {
    let offsetX = e.touches[0].clientX - this.data.startX;
    let offsetY = e.touches[0].clientY - this.data.startY;
    this.setData({
      left: this.data.left + offsetX,
      top: this.data.top + offsetY,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    });
    if(options!=null){
      requestUtil({url:"/storage/findById",method:"GET",data:{id:options.id}}).then(result=>{
        console.log(result.message[0].campus)
        this.setData({
          id:options.id,
          university:app.globalData.campuses[result.message[0].campus].name,
          campus:app.globalData.campuses[result.message[0].campus].campus,
          name:result.message[0].name,
          pic:result.message[0].pic
        })
        this.searchProductList();
      })
    }



    
    var that = this
    //获取当前的地理位置、速度
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        console.log(res.latitude,res.longitude);
        //赋值经纬度
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
      }
    })
  },

  navigateBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onMarkerTap(e) {
    var markerId = e.markerId;
    var detailInfo = this.data.markers[markerId].detailInfo;

    // 更新详情内容到页面数据
    this.setData({
      detailInfo: detailInfo
    });
  },
  async searchProductList(e){
    console.log("id: ",this.data.id);
    requestUtil({url:'/storage/searchMulti',method:"GET",data:{id:this.data.id,type:this.data.type}}).then(result=>{
      console.log("lists",result);
      this.setData({
        productList:result.message
      })
    })
    // if(searchCampusIndex!=-1){
      
    //   requestUtil({url:'/product/searchMulti',method:"GET",data:{university:searchUniversityIndex,campus:searchCampusIndex,type:app.globalData}}).then(result=>{
    //     console.log("ll",result.message.productList);
    //     this.setData({
    //       university:university_,
    //       campus:campus_,
    //       type: app.globalData.type,
    //       productList:result.message.productList
    //     })
    //   })
    // }else if(searchCampusIndex==-1&&searchUniversityIndex!=-1){
    //   requestUtil({url:'/campus/findUniversity',method:"GET",data:{index:searchUniversity}}).then(result=>{
    //     console.log(result.message.schoolList);
    //     this.setData({
    //       university:result.message.name,
    //       campus:"不限",
    //       type:app.globalData.type,
    //       productList:result.message.schoolList
    //     })
    //   })
    // }else if(searchCampusIndex==-1&&searchUniversityIndex==-1){
    //   requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
    //     console.log(result.message);

    //     this.setData({
    //       university:"不限",
    //       campus:"不限",
    //       type:app.globalData.type,
    //       productList:result.message,
    //       scrollTop:0
    //     })
    //   })
    // }


  },
  ontypeInput(e){
    this.setData({
      type:e.detail.value
    })
    console.log(e.detail)
    console.log(this.data.type)
    this.searchProductList()
  },

  //controls控件的点击事件
  bindcontroltap(e) {
    var that = this;
    if (e.controlId == 1) {
      that.setData({
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        scale: 14,
      })
    }
  },
  //导航
  onGuideTap: function (event) {
    var lat = Number(event.currentTarget.dataset.latitude);
    var lon = Number(event.currentTarget.dataset.longitude);
    var bankName = event.currentTarget.dataset.bankname;
    console.log(lat);
    console.log(lon);
    wx.openLocation({
      type: 'gcj02',
      latitude: lat,
      longitude: lon,
      name: bankName,
      scale: 28
    })
  },
  onMapTap: function (event) {
    var lat = Number(event.currentTarget.dataset.latitude);
    var lon = Number(event.currentTarget.dataset.longitude);
    var bankName = event.currentTarget.dataset.bankname;
    console.log(lat);
    console.log(lon);
    wx.openLocation({
      type: 'gcj02',
      latitude: lat,
      longitude: lon,
      name: bankName,
      scale: 28
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

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
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage','shareTimeline']
    })
    var that = this;
    console.log(app.globalData.userInfo)
    var nickName=app.globalData.userInfo.nickName;
    let imgurl="";

    imgurl=that.data.pic

    console.log(imgurl)
    return {
      title: nickName+"分享了"+this.data.name,
      imageUrl: imgurl
    }
  },
})