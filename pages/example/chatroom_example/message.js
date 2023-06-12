// pages/example/chatroom_example/message.js

import {
  getBaseUrl,
  requestUtil
} from '../../../utils/requestUtil.js';
import regeneratorRuntime from '../../../lib/runtime/runtime';

wx.cloud.init()
const db=wx.cloud.database()
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focusdisplay:false,
    chatdisplay:true,
    focuses:[],
    rooms:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getRooms();
  },
  async getRooms(){
    console.log(app.globalData.openid)
    let positive=await db.collection('chats').where({
      id:app.globalData.openid
    }).get()

    let chats=positive.data
    console.log(chats.length)
    let rooms=[]
    chats.forEach(function(value,index,array){
      let chatroom=value.chatroom
      let imgurl=""
      if(chatroom.product.propic.pics[0][0]!='h'&&chatroom.product.propic.pics[0][0]!='c'){
        imgurl=app.globalData.baseUrl+"/image/product/"+chatroom.product.propic.pics[0]
      }else{
        imgurl=chatroom.product.propic.pics[0]
      }
      let room={
        target:chatroom.userInfo,
        product:{
          pic:imgurl,
          name:chatroom.product.name
        },
        url:'/pages/example/chatroom_example/room/room?id=' + chatroom.chatid + '&name=' + chatroom.userInfo.nickName+'&backgroundimage='+chatroom.backgroundimage+'&haoyou_openid='+chatroom.product.userid+'&product='+chatroom.product.identity
      }
      rooms.push(room)
    })
    this.setData({
      rooms:rooms
    })
    console.log(this.data.rooms)

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