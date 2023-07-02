// pages/category/index.js
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
    //左侧数据
    leftMenuList:[],
    rightMenuList:[],
    baseUrl:'',
    currentIndex:0 ,//当前选中左侧菜单索引
    currentCampusIndex:-1,
    scrollTop:0
  },
  //所有商品类别数据
  Campuses:[],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    })
    this.getCampuses();
  },
  async getCampuses(){
    const result=await requestUtil({
      url:'/bigType/findCampuses',
      method:"GET"
    });
    this.Campuses=result.message;
    console.log(result)
    //普通写法
    // let leftMenuList=    this.Campuses.map((v)=>{
    //   return v.name
    // })
    //装逼写法
    let leftMenuList=    this.Campuses.map(v=>v.name)
    let rightContext=this.Campuses[0].schoolList;
    this.setData({
      leftMenuList,
      rightContext
    })
  },
  async getCampusesFromHome(index){
    const result=await requestUtil({
      url:'/bigType/findCampuses',
      method:"GET"
    });
    this.Campuses=result.message;
    console.log(this.Campuses)
    //普通写法
    // let leftMenuList=    this.Campuses.map((v)=>{
    //   return v.name
    // })
    //装逼写法
    let leftMenuList=    this.Campuses.map(v=>v.name)
    let rightContext=this.Campuses[index].schoolList;
    this.setData({
      leftMenuList,
      rightContext,
      currentIndex:index,
      scrollTop:0
    })
  },
  //左侧菜单点击切换事件
  handleMenuItemChange(e){
    const {index}=e.currentTarget.dataset;
    let rightContext=this.Campuses[index].schoolList;
    this.setData({
      currentIndex:index,
      currentCampusIndex:-1,
      rightContext,
      scrollTop:0
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
    console.log("onShow")
    const app=getApp();
    const {camIndex}=app.globalData
    const {curcamIndex}=app.globalData
    console.log("index: "+camIndex)
    console.log("index: "+curcamIndex)
    if(camIndex!=-1){//首页跳转而来
      this.getCampusesFromHome(camIndex);
      console.log(this.currentCampusIndex);
      this.setData({
        currentCampusIndex:curcamIndex
      })
    }
  },
//点击跳转商品分类页面
handleLocationJump(e){
  console.log(e);
  const {index}=e.currentTarget.dataset;
  console.log("campus: "+index)
  console.log(this.data.currentIndex)
 

  let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
  let prevPage = pages[pages.length - 2]; 
  console.log(prevPage.route)
  if (prevPage.route=="pages/index/index"){
    app.globalData.location=this.Campuses[this.data.currentIndex].name+"-"+this.Campuses[this.data.currentIndex].schoolList[index].campus;
    app.globalData.campus=this.Campuses[this.data.currentIndex].name+"-"+this.Campuses[this.data.currentIndex].schoolList[index].campus
    app.globalData.camIndex=this.data.currentIndex;
    app.globalData.curcamIndex=index;
    app.globalData.searchUniversityIndex=this.data.currentIndex;
    app.globalData.searchCampusIndex=index;
    wx.navigateBack({
      delta: 2
    })
  }else if(prevPage.route=="pages/search/index"){

    // app.globalData.location=this.Campuses[this.data.currentIndex].name+"-"+this.Campuses[this.data.currentIndex].schoolList[index].campus;

    // app.globalData.camIndex=this.data.currentIndex;
    // app.globalData.curcamIndex=index;
    // app.globalData.searchUniversityIndex=this.data.currentIndex;
    // app.globalData.searchCampusIndex=index;
    console.log("currentIndex: "+this.data.currentIndex)
    console.log("currentIndex: "+index)
    console.log("previos:   "+prevPage.route)
    prevPage.setData({
      university:app.globalData.campuses[index].name,
      campus:app.globalData.campuses[index].campus,
      uid:this.data.currentIndex,
      cid:index,
    })
    prevPage.searchProductList();
    wx.navigateBack({
      delta:1
    })
  }else{
    prevPage.setData({
      university:this.Campuses[this.data.currentIndex].name,
      campus:this.Campuses[this.data.currentIndex].schoolList[index].campus,
      uid:this.data.currentIndex,
      cid:index,
    })
    wx.navigateBack({
      delta: 2
    })
  }

  // let rightContext=this.Cates[index].smallTypeList;
  // this.setData({
  //   currentIndex:index,
  //   rightContext,
  //   scrollTop:0
  // })
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