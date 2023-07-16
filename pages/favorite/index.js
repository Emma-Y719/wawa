// 导入request请求工具类
import {
  getBaseUrl,
  requestUtil
} from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:{},
    baseUrl: '',
    cart:[],
    allChecked:false,
    totalPrice:0,
    totalNum:0,
    campuses:[],   
    user:{},
    userInfo:{},
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const baseUrl = getBaseUrl();
    this.setData({
      baseUrl
    })
    this.setData({
      campuses:app.globalData.campuses
    })

  },
  onRemove(e){
    let id=e.currentTarget.dataset.id;
    let productObj=this.data.cart[id]
    console.log(productObj)
    wx.showModal({
      title: '',
      content: '确认取消收藏？',
      complete: (res) => {
        if (res.cancel) {
          
        }
    
        if (res.confirm) {
          let that=this;
            var newFav = app.globalData.user.favorite.filter(function(element) {
              return element.identity!= productObj.identity&&element!=null; // 返回 true 以保留元素，返回 false 以删除元素
            });
            console.log(newFav);
            app.globalData.user.favorite=newFav
            requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
              if(res){
                this.getFavorites();
              }
            })
          // let index=app.globalData.user.favorite.findIndex(v=>v.identity==productObj.identity);
          // console.log("result: ",index)
          
          // app.globalData.user.favorite.splice(index,1)
          // console.log(app.globalData.user.favorite)


          // const result = await requestUtil({
          //   url: '/user/update',
          //   data:{id:result.message.userid},
          //   method: "GET"
          // })

          // db.collection('user').where({
          //   _openid: app.globalData.openid
          // }).update({
          //   data: {
          //     favorite: db.command.pull({identity:productObj.identity})
          //   }
          // }).then(res=>{
          //   this.getFavorites();
          // })
        }
      }
    })
  },
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },

  addChat(e){
    let id=e.currentTarget.dataset.id;
    let productObj=this.data.cart[id]
    let userInfo=app.globalData.user.userinfo;

    let that=this
    this.setData({
      chatid:app.globalData.openid+'-'+productObj.userid+'-'+productObj.identity
    })
    requestUtil({url:"/chats/findchatid",method:"GET",data:{chatid:this.data.chatid}}).then(res=>{
      if(res.message[0]==0){
        this.addRoom(productObj,userInfo);
      }else{
        wx.navigateTo({
          url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + userInfo.nickName+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+productObj.userid+'&product='+productObj.identity,
        })
      }
    })
    // db.collection('chats').where({
    //   chatid:this.data.chatid
    // }).get().then(res=>{
    //   console.log(this.data.chatid)
    //   console.log("chat: ",res.data.length)
    //   if(res.data.length==0){
    //     this.addRoom(productObj,userInfo);
    //   }else{
    //     wx.navigateTo({
    //       url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + userInfo.nickName+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+productObj.userid+'&product='+productObj.identity,
    //     })
    //   }
    // })
    // requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res=>{


    // })

  },
  async addRoom(productObj,userInfo){
    var chatroom={
      chatid: this.data.chatid,
      userInfo: userInfo,
      _openid: productObj.userid,
      backgroundimage: '',
      product:productObj
    }
    var chatroom_target={
      chatid: this.data.chatid,
      userInfo: app.globalData.userInfo,
      _openid: productObj.userid,
      backgroundimage: '',
      product:productObj
    }

    await requestUtil({url:"/chats/add",method:"POST",data:{
      chatid:chatroom.chatid,
      id:app.globalData.openid,
      targetid:chatroom._openid,
      chatroom:chatroom
    }});

    await requestUtil({url:"/chats/add",method:"POST",data:{
          chatid:chatroom.chatid,
          id:chatroom._openid,
          targetid:app.globalData.openid,
          chatroom:chatroom_target
    }});
    // await db.collection('chats').add({
    //   // data 字段表示需新增的 JSON 数据
    //   data: {
    //     chatid:chatroom.chatid,
    //     id:app.globalData.openid,
    //     targetid:chatroom._openid,
    //     chatroom:chatroom
    //   }
    // })
    // await db.collection('chats').add({
    //   // data 字段表示需新增的 JSON 数据
    //   data: {
    //     chatid:chatroom.chatid,
    //     id:chatroom._openid,
    //     targetid:app.globalData.openid,
    //     chatroom:chatroom_target
    //   }
    // })

    // console.log("target: "+this.data.productObj.userid)
    // const db1=wx.cloud.database()
    // let target=await db1.collection('user').where({
    //   _openid:"olD3w5L8bcp1OLV_cAzkejkVRqh4"
    // }).get();
    // console.log(target)

    // await db1.collection('user').where({
    //   _openid: this.data.productObj.userid
    // }).update({
    //   data: {
    //     chat: db1.command.push([chatroom])
    //   }
    // }).then(res=>{


    // })

    // await db.collection('user').where({
    //   _openid: app.globalData.openid
    // }).update({
    //   data: {
    //     chat: db.command.push([chatroom])
    //   }
    // })

    
    let that = this;
    let haoyouinfo =chatroom
    console.log("好友： "+haoyouinfo.userInfo.nickName)
    if(!this.data.backgroundimage1){
      //就证明没有更换图片
      that.setData({
        //这个id就唯一标识这个好友
        chatid: haoyouinfo.chatid,
        chatname: haoyouinfo.userInfo.nickName,
        backgroundimage:haoyouinfo.backgroundimage
      })
    }
    else{
      that.setData({
        //这个id就唯一标识这个好友
        chatid: haoyouinfo.id,
        chatname: haoyouinfo.userInfo.nickName,
        backgroundimage:''
      })
    }
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
        url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+haoyouinfo._openid+'&product='+productObj.identity,
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  async getFavorites(){
    // requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res=>{
    //   // console.log(res.message)
    //   let favlist=res.message[0].favorite;
    //   console.log(res.message)
    //   this.setData({
    //     cart:favlist
    //   })
    // })
    this.setData({
      cart:app.globalData.user.favorite
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("show")
    console.log("openid: "+app.globalData.openid)
    this.getFavorites();
    // wx.cloud.callFunction({
    //   name: 'yunrouter',
    //   data: {
    //     $url: "huoquUserinfo", //云函数路由参数
    //     openid: app.globalData.openid
    //   },
    //   success: res2 => {
    //     console.log(res2.result.data[0].favorite)
    //     let favlist=res2.result.data[0].favorite;
    //     this.setData({
    //       cart:favlist
    //     })
    //   },
    //   fail() {
    //   }
    // });


  },

  // 设置购物车状态 重新计算 底部工具栏 全选 总价 总数量 重新设置缓存
  setCart(cart){
    let allChecked=true;
    let totalPrice=0;
    let totalNum=0;
    cart.forEach(v=>{
      if(v.checked){
        totalPrice+=v.price*v.num;
        totalNum+=v.num;
      }else{
        allChecked=false;
      }
    })
    console.log("cart: "+cart[0]);
    allChecked=cart.length!=0?allChecked:false;
    this.setData({
      cart,
      allChecked,
      totalNum,
      totalPrice
    })

    // cart设置到缓存中
    wx.setStorageSync('cart', cart);
  }


})