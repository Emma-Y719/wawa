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
    campus:"",
    uid:-1,
    cid:-1,
    type:"",
    baseUrl:'',
    productList:[],
    floatButtonVisible: false,
    left: 0, // 悬浮窗左侧距离
    top: 0, // 悬浮窗顶部距离
    startX: 0, // 手指起始X坐标
    startY: 0, // 手指起始Y坐标
  },
  onFloatButtonTap() {
    wx.navigateTo({
      url: '/pages/search/map?uid='+this.data.uid+"&cid="+this.data.cid+"&type="+this.data.type
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
    if(options.uid!=undefined){
      console.log(options)
      let uindex=parseInt(options.uid)
      let cindex=parseInt(options.cid)
      let t=''
      if(options.type!=undefined){
        const decodedParam = decodeURIComponent(options.type);
        const de2=decodeURIComponent(decodedParam);
        console.log(de2)
        t=de2
      }
      let u=''
      let c=''
      if(uindex!=-1){
        u=app.globalData.campuses[uindex].name;
      }else{
        u="不限"
      }
      if(cindex!=-1){
        c=app.globalData.campuses[cindex].campus;
      }else{
        c="不限"
      }
      

      this.setData({
        type:t,
        uid:uindex,
        cid:cindex,
        university:u,
        campus:c,
      })


    }else{
      this.setData({
        type:app.globalData.type,
        uid:app.globalData.searchUniversityIndex,
        cid:app.globalData.searchCampusIndex,
        university:app.globalData.campus.split('-')[0],
        campus:app.globalData.campus.split('-')[1]
      })
    }


    this.searchProductList();
    var that = this
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
  ontypeInput(e){
    this.setData({
      type:e.detail.value
    })
    console.log(e.detail)
    console.log(this.data.type)
    this.searchProductList()
  },
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },

  async searchProductList(e){
    var searchUniversityIndex=app.globalData.searchUniversityIndex;
    var searchCampusIndex=app.globalData.searchCampusIndex;
    console.log("indices: "+this.data.uid+" , "+this.data.cid);
    requestUtil({url:'/product/searchMulti',method:"GET",data:{university:this.data.uid,campus:this.data.cid,type:this.data.type}}).then(result=>{
      console.log("lists",result.message);
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
  onShareAppMessage() {
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage','shareTimeline']
    })
    var that = this;
    console.log(app.globalData.userInfo)
    var nickName=app.globalData.userInfo.nickName;
    let imgurl="";

    imgurl=that.data.productList[0].propic.pics[0]

    console.log(imgurl)
    return {
      title: nickName+"分享了类别为"+this.data.type+"的一些二手物品",
      imageUrl: ""
    }

    
  }
})