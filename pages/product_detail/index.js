// 导入request请求工具类
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil
} from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';

// 获取应用实例
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseUrl: '',
    productObj:{},
    activeIndex:0,
    userInfo:[],
    isfocus:false,
    fvalue:"",
    me:{}
  },

  productInfo:{

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const baseUrl = getBaseUrl();
    this.setData({
      baseUrl
    })
    

    this.getProductDetail(options.id)

  },

  // tab点击事件
  handleItemTap(e){
    const {index}=e.currentTarget.dataset;
    console.log("index: "+index)
    this.setData({
      activeIndex:index
    })
  },

  /**
   * 获取商品详情
   */
  async getProductDetail(id) {
    const result = await requestUtil({
      url: '/product/detail',
      data:{id},
      method: "GET"
    });
    this.productInfo=result.message;
    this.setData({
      productObj: result.message
    })
    console.log(result.message.userid)
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "huoquUserinfo", //云函数路由参数
        openid: result.message.userid
      },
      success: res2 => {
        console.log(res2.result.data[0].userInfo)
        this.setData({
          userInfo:res2.result.data[0].userInfo
        })
      },
      fail() {
      }
    });

    console.log(app.globalData.friends[app.globalData.friends.length-1]._openid)
    console.log("user: "+this.data.productObj.userid)
    if(app.globalData.friends[app.globalData.friends.length-1]._openid==this.data.productObj.userid){
      this.setData({
        fvalue:"已关注"
      })
    }else{
      this.setData({
        fvalue:"+关注"
      })
    }

  },
  addChat(e){
    var chatroom={
      id: app.globalData.openid+this.data.productObj.userid,
      userInfo: this.data.userInfo,
      _openid: this.data.productObj.userid,
      backgroundimage: ''
    }
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "HuoquFriends", //云函数路由参数
        openid: app.globalData.openid
      },
      success: res2 => {
        console.log(res2)
        this.setData({
          peoplelist: res2.result.data[0].friends,
        })
        app.globalData.friends = res2.result.data[0].friends
      },
      fail() {
      }
    });


    
    db.collection('user').where({
      _openid: app.globalData.openid
    }).update({
      data: {
        chat: db.command.push([chatroom])
      }
    })
 
      let that = this;
      let haoyouinfo =chatroom
      console.log("好友： "+haoyouinfo.userInfo.nickName)
      if(!this.data.backgroundimage1){
        //就证明没有更换图片
        that.setData({
          //这个id就唯一标识这个好友
          chatid: haoyouinfo.id,
          chatname: haoyouinfo.userInfo.nickName,
          backgroundimage:haoyouinfo.backgroundimage
        })
      }
      else{
        that.setData({
          //这个id就唯一标识这个好友
          chatid: haoyouinfo.id,
          chatname: haoyouinfo.userInfo.nickName,
          backgroundimage:that.data.backgroundimage1
        })
      }
  
      // wx.navigateTo({
      //   url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+that.data.haoyouinfo._openid,
      // })
      let  lessonSubId='wP0DrgBo_CKL51uA2QYFRJS-_IMnLUMWataPkALuw6s'
      //调用订阅消息提醒
      // 如果开启这个订阅消息提醒，否则就不提醒
      if(app.globalData.useTmp){
        wx.requestSubscribeMessage({
          tmplIds: [lessonSubId],//这个是微信平台申请的 id
          success:res => {
           console.log(res)
           console.log(res[lessonSubId])
           if(res[lessonSubId]=="accept"){
               console.log("接受订阅申请")
               wx.navigateTo({
                url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+haoyouinfo._openid,
              })
           }else if(res[lessonSubId]=="reject"){
               console.log("拒绝接受订阅申请")
           }
          },
          fail(res){
              console.log(res)
          }
        })
      }else{
        wx.navigateTo({
          url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+haoyouinfo._openid,
        })
      }

  },
  handlefocus(e){
    if(!this.data.isfocus){
      db.collection('user').where({
        _openid: app.globalData.openid
      }).update({
        data: {
          friends: db.command.push([{
            id: app.globalData.openid+this.data.productObj.userid,
            userInfo: this.data.userInfo,
            _openid: this.data.productObj.userid,
            backgroundimage: ''
          }])
        }
      })
      
      wx.cloud.callFunction({
        name: 'yunrouter',
        data: {
          $url: "huoquUserinfo", //云函数路由参数
          openid: app.globalData.openid
        },
        success: res2 => {
          this.data.isfocus=true;
          app.globalData.friends=res2.result.data[0].friends;
          this.data.fvalue= "已关注"
        },
        fail() {
        }
      });
    }




    
  },
  // 点击事件 商品加入购物车
  handleCartAdd(){
    
    this.setCartadd();

    wx.showToast({
      title: '加入成功',
      icon:'success',
      mask:true
    })
  },

  
  // 点击 立即购买
  handleBuy(){
    this.setCartadd();
    wx.switchTab({
      url: '/pages/cart/index',
    })
  },
  handleChat:function(){
    console.log("Chat!")
    console.log(app.globalData.userInfo)
    wx.navigateTo({
      url: '/pages/chat/index',
    })
  },
  // 加入购物车
  setCartadd(){
    let cart=wx.getStorageSync('cart')||[];
    console.log("cart: "+cart[0]);
    let index=cart.findIndex(v=>v.id===this.productInfo.id);
    if(index===-1){ // 购物车里面不存在当前商品 
      this.productInfo.num=1;
      this.productInfo.checked=true;
      cart.push(this.productInfo);
    }else{ // 已经存在
      cart[index].num++;
    }
    wx.setStorageSync('cart', cart); // 把购物车添加到缓存中
  },
 // 在需要获取用户信息的事件或方法中调用
 getUserInf() {
  wxLogin({
    success: (res) => {
      if (res.code) {
        // 登录成功，可以通过 res.code 获取登录凭证 code
        wxGetUserInfo({
          success: (userInfo) => {
            // 获取用户信息成功，可以通过 userInfo 获取用户的详细信息
            const username = userInfo.nickName;
            const avatar = userInfo.avatarUrl;
            // ... 其他操作
          },
          fail: (error) => {
            // 获取用户信息失败的处理逻辑
            console.error('获取用户信息失败:', error);
          }
        });
      } else {
        // 登录失败的处理逻辑
        console.error('登录失败:', res.errMsg);
      }
    },
    fail: (error) => {
      // 登录失败的处理逻辑
      console.error('登录失败:', error);
    }
  });
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
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage','shareTimeline']
    })
    var that = this;
    console.log(app.globalData.userInfo)
    var nickName=app.globalData.userInfo.nickName;
    console.log(that.data.productObj.propic.pics[0])
    let imgurl="";
    if(that.data.productObj.propic.pics[0][0]!='h'&&that.data.productObj.propic.pics[0][0]!='c'){
      imgurl=this.data.baseUrl+'/image/product/'+that.data.productObj.propic.pics[0]
    }else{
      imgurl=that.data.productObj.propic.pics[0]
    }
    console.log(imgurl)
    return {
      title: nickName+"发现了一件好物，快来瞧一瞧～",
      imageUrl: imgurl
    }
  },

  onShareTimeline:function(){
    return {
      title:'',
      query:{
        key:value
      },
      imageUrl:''
    }
  }

})