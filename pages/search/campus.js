// 导入request请求工具类
import {
  getBaseUrl,
  requestUtil
} from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productList:[], // 商品数组
    inputValue:"", // 输入框的值
    isFocus:false,// 取消 按钮 是否显示.
    university:"",
    campus:"",
    uid:-1,
    cid:-1,
  },

  TimeoutId:-1,

  // 处理input事件
  handleInput(e){
    const {value}=e.detail;
    if(!value.trim()){
      this.setData({
        productList:[],
        isFocus:false
      })
      return;
    }
    this.setData({
      isFocus:true
    })
    clearTimeout(this.TimeoutId);
    this.TimeoutId=setTimeout(()=>{
      this.search(value)
    },1000)
   
  },

  // 点击 取消按钮
  handleCancel(){
    this.setData({
      productList:[], // 商品数组
      inputValue:"", // 输入框的值
      isFocus:false // 取消 按钮 是否显示
    })
  },

    /**
   * 获取商品详情
   */
  async search(q) {
    const result = await requestUtil({
      url: '/campus/search',
      data:{q}
    });
    this.setData({
      productList: result.message
    })
  },
  onChoose:function(e){
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2];
    var pr=wx.getStorageSync('prevPage')
    console.log(prevPage)
    const {index}=e.currentTarget.dataset;
    console.log("campus: "+index)
    console.log(this.data.productList[index])

    wx.setStorageSync("campus",this.data.productList[index].campus)
    wx.setStorageSync("university",this.data.productList[index].name)
    wx.setStorageSync("uid",this.data.productList[index].schoolid)
    wx.setStorageSync("cid",this.data.productList[index].dataid)
    if(prevPage.route=="pages/index/location"){
      console.log(e);

      app.globalData.location=this.data.productList[index].name+"-"+this.data.productList[index].campus;
    
      app.globalData.camIndex=this.data.productList[index].schoolid;
      app.globalData.curcamIndex=this.data.productList[index].dataid;
      app.globalData.searchUniversityIndex=this.data.productList[index].schoolid;
      app.globalData.searchCampusIndex=this.data.productList[index].dataid;
      wx.navigateTo({
        url: '/pages/index/index',
      }) 
    }
    else if(prevPage.route=="pages/promote/index"||prevPage.route=="pages/storage/create/login"){
      prevPage.setData({
        university:this.data.productList[index].name,
        campus:this.data.productList[index].campus,
        uid:this.data.productList[index].schoolid,
        cid:this.data.productList[index].dataid,
        choosed:true
      })

      wx.navigateBack({
        delta:1
      }) 
    }


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})