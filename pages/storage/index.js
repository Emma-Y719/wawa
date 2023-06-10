// pages/storage/index.js
//导入request请求工具类
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()
wx.cloud.init();
const db=wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    university:"",
    campus:"",
    type:"",
    storageList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    });
    this.searchStorageList()
  },
  async searchStorageList(e){
    requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
      var sall=result.message
      console.log(app.globalData.openid)
      wx.cloud.callFunction({
        name: 'yunrouter',
        data: {
          $url: "HuoquFriends", //云函数路由参数
          openid: app.globalData.openid
        },
        success: res2 => {
          console.log("res2:   ",res2)
          var storages=res2.result.data[0].storage
          var storageList=[]
          storages.forEach(function(value,index,array){
            storageList.push(sall[value-1])
          })
          this.setData({
            storageList:storageList
          })
        },
        fail() {
        }
      });
  
    })


  },
  promote(e){




  },
  handleCreate(e){
    wx.redirectTo({
      url: '/pages/storage/create/info/index',
    })
  }
  ,
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

  }
})