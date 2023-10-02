import { requestUtil } from "../../../utils/requestUtil"

const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    chatRoomEnvId: 'cloud1-4g6bmgze1a238f21',//改成自己云开发的id
    chatRoomCollection: 'chatroom_example',//聊天记录存放的表格
    chatRoomGroupId: '',//唯一定义聊天组，可以建立群，或者好友聊天
    chatRoomGroupName: '',//聊天的群名，或者好友的昵称
    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
    product:{
      
    },
    title:"",
    productObj:{}
  },

  onLoad: function (options) {
    // 获取用户信息
    console.log('聊天中的背景图片',options.backgroundimage)
    console.log(options.product)
    requestUtil({url:"/product/findId",method:"GET",data:{id:options.product}}).then(res=>{
      console.log(res)
      let imgurl=""
      if(res.message[0].propic.pics[0][0]!='h'&&res.message[0].propic.pics[0][0]!='c'){
        imgurl=app.globalData.baseUrl+"/image/product/"+res.message[0].propic.pics[0]
      }else{
        imgurl=res.message[0].propic.pics[0]
      }
      this.setData({
        product:{
          pic:imgurl,
          name:res.message[0].name,
          price:res.message[0].price,
          university:app.globalData.campuses[res.message[0].campus].name,
          campus:app.globalData.campuses[res.message[0].campus].campus,
          status:res.message[0].status,
          userid:res.message[0].userid
        },
        productObj:res.message[0]
      })
    })

    this.setData({
      chatRoomGroupId: options.id,
      chatRoomGroupName:options.name,
      backgroundimage:options.backgroundimage,//背景图片
      // 如果是单人聊天的话，就有值，如果聊天室的话 就是none
      haoyou_openid:options.haoyou_openid?options.haoyou_openid:'none',
    })
    let targetInfo=""
    if(this.data.productObj.userid!=app.globalData.user.openid){
      targetInfo="卖家"
    }else{
      targetInfo="买家"
    }
    this.setData({
      title: '与'+targetInfo+'"'+options.name+'"的聊天'
    })
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })

    wx.getSystemInfo({
      success: res => {
        console.log('system info', res)
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 1 :2 ) }px; padding-bottom: ${40 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
  },
  navigateBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  getOpenID: async function() {
    return app.globalData.user.openid;
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  onComplete(){
    let productnew=this.data.productObj;
    wx.showModal({
      title: '',
      content: '该操作会下架商品，请确认已完成交易！下架后商品只能在个人页面下架栏中找到',
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          requestUtil({
            url:"/product/update",
            method:"POST",
            data:{
              identity: productnew.identity,
              name: productnew.name,
              price: productnew.price,
              propic: productnew.propic,
              ishot:0,
              isswiper:0,
              typeid:productnew.typeid,
              description:productnew.description,
              university:productnew.university,
              campus:productnew.campus,
              longtitude:productnew.longtitude,
              latitude:productnew.latitude,
              userid:productnew.openid,
              status:2,
              storage:productnew.storage
            }
          }).then(result=>{
            if(result){
              wx.showModal({
                title: '',
                content: '下架成功！',
                complete: (res) => {
                  if (res.cancel) {
                    wx.reLaunch({
                      url: '/pages/example/chatroom_example/message',
                    })
                  }
                  if (res.confirm) {
                    wx.reLaunch({
                      url: '/pages/my/index',
                    })
                  }
                }
              })
            }else{
    
            }
              console.log(result)
          })
        }
      }
    })
  },


  onShareAppMessage() {
    return {
      title: '好友聊天',
      path: '/pages/example/chatroom_example/im',
    }
  },
})
