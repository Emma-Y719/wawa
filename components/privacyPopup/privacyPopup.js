import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil
}from '../../utils/requestUtil.js';
var util = require('../../styles/util.js');
import regeneratorRuntime from '../../lib/runtime/runtime';
const app = getApp()
Component({
  /**
   * 组件的初始数据
   */
  data: {
      privacyContractName: '',
      showPrivacy: false,
      isTextVisible: false
  },
  /**
   * 组件的生命周期
   */
  pageLifetimes: {
      show() {
          const _ = this
          if(this.isBaseLibraryVersionGreaterThan("2.32.3")){
            wx.getPrivacySetting({
              success(res) {
                  if (res.errMsg == "getPrivacySetting:ok") {
                      _.setData({
                          privacyContractName: res.privacyContractName,
                          showPrivacy: true
                      })
                  }
              },
              fail(e){
                console.log(e);
              }
          })
          }else{
            this.setData({
              showPrivacy:true
            })
          }
          

      }
  },
  /**
   * 组件的方法列表
   */
  methods: {
      // 点击按钮切换文本块的显示状态
      toggleText: function () {
        this.setData({
          isTextVisible: !this.data.isTextVisible
        });
      },
      // 判断基础库版本是否大于指定版本
 isBaseLibraryVersionGreaterThan(targetVersion) {
  // 获取微信小程序基础库版本
  const wxVersion = wx.getSystemInfoSync().SDKVersion;
  
  // 将版本号字符串转换为数字并进行比较
  const wxVersionNum = parseFloat(wxVersion);
  const targetVersionNum = parseFloat(targetVersion);

  // 如果基础库版本大于指定版本，则返回 true，否则返回 false
  if (!isNaN(wxVersionNum) && !isNaN(targetVersionNum)) {
    return wxVersionNum > targetVersionNum;
  } else {
    console.error('无效的版本号');
    return false;
  }
},
handleagree(){
  if(!this.isBaseLibraryVersionGreaterThan("2.32.3")){
    var  that=this;
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
                
                app.globalData.uid=0;
                app.globalData.cid=0;
                app.globalData.locuni="东南大学";
                app.globalData.loccam="四牌楼校区";
                app.globalData.openid=res.id;
                that.getcampusLoc()
                wx.reLaunch({
                  url: '/pages/wait/id',
                })
              }else{
                app.globalData.openid= res.message[0].openid;
                app.globalData.userInfo = res.message[0].userinfo;
                app.globalData.friends=res.message[0].friends;
                app.globalData.user=res.message[0];
                app.globalData.isLogin=true;
                console.log("data user:",res.message[0].university)
                
                app.globalData.uid=res.message[0].uid
                app.globalData.cid=res.message[0].cid
                app.globalData.locuni=res.message[0].university
                app.globalData.loccam=res.message[0].campus
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
  }

},
handledeny(){
  if(!this.isBaseLibraryVersionGreaterThan("2.32.3")){
  // 在按钮的点击事件处理函数中调用 navigateBackMiniProgram 方法
  wx.navigateBackMiniProgram({
    success: function () {
      console.log('退出小程序成功');
    },
    fail: function (err) {
      console.error('退出小程序失败', err);
    }
  });
  }


},
      // 打开隐私协议页面
      openPrivacyContract() {
          const _ = this
          wx.openPrivacyContract({
              fail: () => {
                  wx.showToast({
                      title: '遇到错误',
                      icon: 'error'
                  })
              }
          })
      },
      // 拒绝隐私协议
      exitMiniProgram() {
          // 直接退出小程序
          wx.exitMiniProgram()
      },
      getcampusLoc(){

        requestUtil({url:"/campus/findId",mothod:"GET",data:{cid:app.globalData.cid}}).then(res=>{
          console.log(res)

          app.globalData.latitude=res.message.latitude;
          app.globalData.longitude=res.message.longitude;

          //  this.setData({
          //    latitude:res.message.latitude,
          //    longitude:res.message.longitude
          //  })
        })
      },
      // 同意隐私协议
      handleAgreePrivacyAuthorization() {
          const _ = this

          _.setData({
              showPrivacy: false
          })
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let cur=pages[pages.length-1]
          let route=cur.route
          var that=this;
          if(route=='pages/wait/wait'){
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
                        
                        app.globalData.uid=0;
                        app.globalData.cid=0;
                        app.globalData.locuni="东南大学";
                        app.globalData.loccam="四牌楼校区";
                        app.globalData.openid=openid;
                        that.getcampusLoc()
                        wx.reLaunch({
                          url: '/pages/wait/id',
                        })
                      }else{
                        app.globalData.openid= res.message[0].openid;
                        app.globalData.userInfo = res.message[0].userinfo;
                        app.globalData.friends=res.message[0].friends;
                        app.globalData.user=res.message[0];
                        app.globalData.isLogin=true;
                        console.log("data user:",res.message[0].university)
                        
                        app.globalData.uid=res.message[0].uid
                        app.globalData.cid=res.message[0].cid
                        app.globalData.locuni=res.message[0].university
                        app.globalData.loccam=res.message[0].campus
                        that.getcampusLoc();
                        // console.log("component ready!")
                        // that.triggerEvent('componentReady');
                        // that.watchInfo();
                        app.globalData.user["online"]=true
                        requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
                          console.log(res)
                        })
                        wx.reLaunch({
                          url: '/pages/index/index',
                        })
                      }
                    })
                  })
                  
                }
              }
            })
     
          }
      },
  },
})