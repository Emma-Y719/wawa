// pages/wait/id.js
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil
}from '../../utils/requestUtil.js';
var util = require('../../styles/util.js');
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    uid:-1,
    cid:-1,
    latitude: "",
    longitude: "",
  },
  async getWLogin(){
    let that =this;
    if(!app.globalData.isLogin){
      
       wx.showModal({
        title:'友情提示',
        content:'微信授权登录后，才可进入',
        success:(res)=>{
          wx.login({
            success: function(res) {
              if (res.code) {
                // 登录成功，获取到用户的登录凭证 code
                var code = res.code;
                console.log(code)
                requestUtil({url:"/user/login",method:"GET",data:{code:code}}).then(res=>{
                  console.log(res)
                  var openid=res.id;
                  requestUtil({url:"/user/findid",method:"GET",data:{id:res.id}}).then(res=>{
                    if(res.message.length==0){
                      console.log("尚未注册!！")
                      app.globalData.openid=openid;
                      console.log(app.globalData.openid)
                      wx.redirectTo({
                        url: '/pages/my/create/login',
                      })
                    }else{
                      app.globalData.openid= res.message[0].openid;
                      app.globalData.userInfo = res.message[0].userinfo;
                      app.globalData.friends=res.message[0].friends;
                      app.globalData.user=res.message[0];
                      app.globalData.isLogin=true;
                      console.log("data user:",res.message[0].university)
                      that.setData({
                        uid:res.message[0].uid,
                        cid:res.message[0].cid,
                        locuni:res.message[0].university,
                        loccam:res.message[0].campus
                      })
                      that.getcampusLoc();
                      // console.log("component ready!")
                      // that.triggerEvent('componentReady');
                      // that.watchInfo();
                      app.globalData.user["online"]=true
                      requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
                        console.log(res)
                      })
                    }
                  })
                })
                
              }
            }
          })

          // wx.cloud.callFunction({
          //   name: 'yunrouter', // 对应云函数名
          //   data: {
          //     $url: "openid", //云函数路由参数
          //   },
          //   success: re => {
          //     console.log("user:"+re.result)
          //     app.globalData.openid=re.result
          //     requestUtil({url:"/user/findid",method:"GET",data:{id:re.result}}).then(res=>{

          //           if(res.message.length==0){
          //             console.log("尚未注册!！")
                     
          //             console.log(app.globalData.openid)
          //             wx.redirectTo({
          //               url: '/pages/my/create/login',
          //             })
          //           }else{
          //             app.globalData.openid= res.message[0].openid;
          //             app.globalData.userInfo = res.message[0].userinfo;
          //             app.globalData.friends=res.message[0].friends;
          //             app.globalData.user=res.message[0];
          //             app.globalData.isLogin=true;
          //             console.log("data user:",res.message[0].university)
          //             that.setData({
          //               uid:res.message[0].uid,
          //               cid:res.message[0].cid,
          //               locuni:res.message[0].university,
          //               loccam:res.message[0].campus
          //             })
          //             that.getcampusLoc();
          //             // console.log("component ready!")
          //             // that.triggerEvent('componentReady');
          //             // that.watchInfo();
          //             app.globalData.user["online"]=true
          //             requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
          //               console.log(res)
          //             })
          //           }
          //         })
          //   }
          // })
        }
      })
    }else{
      that.setData({
        uid:app.globalData.user.uid,
        cid:app.globalData.user.cid,
        locuni:app.globalData.userInfo.university,
        loccam:app.globalData.userInfo.campus
      })
      that.getcampusLoc();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  onNoSignUp(){

  },
  onSignUp(){
    wx.reLaunch({
      url: '/pages/my/create/login.js',
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

  }
})