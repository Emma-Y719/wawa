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
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    ptype:["在卖","草稿","已下架"],
    b1:"",
    b2:"",
    typeIndex:0,
    hotProductList:[],
    button1:["编辑","编辑","编辑"],
    button2:["已完成","删除","删除"],
    onsale:[],
    draft:[],
    off:[]
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      baseUrl:app.globalData.baseUrl
    })
    console.log("userInfo: ",app.globalData.userInfo)
    this.setData({
      user:app.globalData.user,
      b1:this.data.button1[this.data.typeIndex],
      b2:this.data.button2[this.data.typeIndex]
    })

    this.getHotProductList();
    


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


  onbutton2(e){
    let tid=this.data.typeIndex
    let pid=e.currentTarget.dataset.id;
    if(tid==0){
      let product=this.data.hotProductList[pid]
      console.log(product)
      let productnew=product
      productnew.status=2;

      wx.showModal({
        title: '',
        content: '确认下架？请核实已交易成功',
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
                userid:app.globalData.openid,
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
                        url: '/pages/my/index',
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


    }else{
      let product=this.data.hotProductList[pid]
      console.log(product)
      let productnew=product
      productnew.status=2;
      wx.showModal({
        title: '',
        content: '确认删除此草稿？',
        complete: (res) => {
          if (res.cancel) {
          }
          if (res.confirm) {
            requestUtil({
              url:"/product/remove",
              method:"POST",
              data:{
                identity:product.identity
              }
            }).then(result=>{
              if(result){
                wx.showModal({
                  title: '',
                  content: '删除成功！',
                  complete: (res) => {
                    if (res.cancel) {
                      wx.reLaunch({
                        url: '/pages/my/index',
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


    }

  },
  /**
   * 请求后端获取用户token
   * @param {*} loginParam 
   */
  async wxlogin(loginParam){
    const result=await requestUtil({url:"/user/wxlogin",data:loginParam,method:"post"});
    console.log(result);
    const token=result.token;
    if(result.code===0){
      // 存储token到缓存
      wx.setStorageSync('token', token);
      // 支付继续走，创建订单
      console.log("支付继续走，创建订单");
      this.createOrder();
    }
  },

  // 点击 编辑收货地址
  handleEditAddress(){
    wx.chooseAddress({
      success: (result) => {},
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
      display=this.data.draft;
    }else if(index==2){
      display=this.data.off;
    }

    this.setData({
      typeIndex:index,
      b1:this.data.button1[index],
      b2:this.data.button2[index],
      hotProductList:display
    })
  },
  async getHotProductList(e){
    requestUtil({url:'/product/findUserId',method:"GET",data:{uid:app.globalData.openid}}).then(result=>{
      let onsale=[];let draft=[];let off=[]
      result.message.forEach(function(value,index,array){
        if(value.status==0){
          onsale.push(value);
        }else if(value.status==1){
          draft.push(value);
        }else if(value.status==2){
          off.push(value);
        }
      })
      this.setData({
        onsale:onsale,
        draft:draft,
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage','shareTimeline']
    })

    console.log(this.data.user.userInfo.avatarUrl)
    return {
      title: this.data.user.userInfo.nickName+": 这里是我的宝库，快来瞧一瞧～",
      imageUrl: this.data.user.userInfo.avatarUrl
    }
  },
})