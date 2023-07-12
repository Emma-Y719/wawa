// 导入request请求工具类
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil
} from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
const app=getApp();
wx.cloud.init()
const db=wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    ptype:["在卖","已下架"],
    b1:"",
    b2:"",
    typeIndex:0,
    hotProductList:[],
    onsale:[],
    draft:[],
    off:[],
    share:false
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const baseUrl = getBaseUrl();
    this.setData({
      baseUrl
    })

    if(options!=undefined&&options.userid!=undefined){
      console.log("its shared")
      this.setData({
        share:true,
        userid:options.userid
      })
      this.getHotProductList();

    }

    


    // const token=wx.getStorageSync('token');
    // if(!token){
    //   wx.showModal({
    //     title:'友情提示',
    //     content:'微信授权登录后，才可进入个人中心',
    //     success:(res)=>{
    //       Promise.all([getWxLogin(),getUserProfile()]).then((res)=>{
    //         console.log(res[0].code);
    //         console.log(res[1].userInfo.nickName,res[1].userInfo.avatarUrl)
    //         let loginParam={
    //           code:res[0].code,
    //           nickName:res[1].userInfo.nickName,
    //           avatarUrl:res[1].userInfo.avatarUrl
    //         }
    //         console.log(loginParam)
    //         wx.setStorageSync('userInfo', res[1].userInfo);
    //         this.wxlogin(loginParam);
    //         this.setData({
    //           userInfo:res[1].userInfo
    //         })
    //       })
    //     }
    //   })
    // }else{
    //   console.log("token存在："+token);
    //   const userInfo=wx.getStorageSync('userInfo')
    //   this.setData({
    //     userInfo
    //   })
    // }
  },
  onUpdate(e){
    let id=e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/promote/index?id='+this.data.hotProductList[id].identity,
    })

  },


  handletype(e){
    console.log(e.currentTarget.dataset.index);
    var index=e.currentTarget.dataset.index;
    console.log("index:  "+index);
    var display=[]
    if(index==0){
      display=this.data.onsale;
    }else if(index==1){
      display=this.data.off;
    }

    this.setData({
      typeIndex:index,
      hotProductList:display
    })
  },
  async getUserInfo(){
    console.log("this userid: ",this.data.userid)
    await requestUtil({url:"/user/findid",method:"GET",data:{id:this.data.userid}}).then(res=>{
      this.setData({
        user:res.message[0]
      })
    })

  },
  async getHotProductList(e){
    console.log(this.data.user)
    this.getUserInfo();

    requestUtil({url:'/product/findUserId',method:"GET",data:{uid:this.data.userid}}).then(result=>{
      let onsale=[];let draft=[];let off=[]
      result.message.forEach(function(value,index,array){
        if(value.status==0){
          onsale.push(value);
        }else if(value.status==1){
          off.push(value);
        }
      })
      this.setData({
        onsale:onsale,
        off:off,
        hotProductList:onsale
      })
      result.message.forEach(function(value,index,array){
        　　//code something
        console.log(value.propic.pics[0])
        });
      console.log("Hot: "+result)
    })
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
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },
  onShareTimeline: function () {

    console.log(this.data.user.userInfo.avatarUrl)
    let imgurl=''
    if(this.data.onsale.length>0){
      if(this.data.onsale[0].propic.pics[0][0]!='h'&&this.data.onsale[0].propic.pics[0][0]!="c"){
        imgurl=app.globalData.baseUrl+"/image/product/"+this.data.onsale[0].propic.pics[0]
      }else{
        imgurl=this.data.onsale[0].propic.pics[0]
      }
    }else{
      imgurl=this.data.user.userInfo.avatarUrl
    }

    return {
      title: app.globalData.userInfo.nickName+"分享了"+this.data.user.userInfo.nickName+"的个人页面，快来瞧一瞧～",
      imageUrl: imgurl,
      path:"pages/my/detail?userid="+this.data.userid
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage']
    })

    console.log(this.data.user.userInfo.avatarUrl)
    let imgurl=''
    if(this.data.onsale.length>0){
      if(this.data.onsale[0].propic.pics[0][0]!='h'&&this.data.onsale[0].propic.pics[0][0]!="c"&&this.data.onsale[0].propic.pics[0][0]!="w"){
        imgurl=app.globalData.baseUrl+"/image/product/"+this.data.onsale[0].propic.pics[0]
      }else{
        imgurl=this.data.onsale[0].propic.pics[0]
      }
    }else{
      imgurl=this.data.user.userInfo.avatarUrl
    }

    return {
      title: app.globalData.userInfo.nickName+"分享了"+this.data.user.userInfo.nickName+"的个人页面，快来瞧一瞧～",
      imageUrl: imgurl,
      path:"pages/my/detail?userid="+this.data.userid
    }
  },
})