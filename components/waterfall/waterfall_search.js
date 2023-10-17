// components/waterfall.js
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
var util = require('../../styles/util.js');
// 获取应用实例
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database();
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    left_h:0,
    right_h:0,
    leftDatas:[],
    rightDatas:[],
    icons:[]
  },
  /**
   * 组件的生命周期
   */
  pageLifetimes: {
    show() {
      this.setData({
        leftDatas:[],
        rightDatas:[],
        left_h:0,
        right_h:0,
        left_favs:[],
        right_favs:[]
      })

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {

    arrangeDatas(list){
      var that=this;
      list.forEach(function(value,index,array){
        var delta=0;
        if(value.propic.pics[0]){
          delta=2;
        }else{
          delta=1;
        }
        var left_h=that.data.left_h;
        var right_h=that.data.right_h;
        var leftDatas=that.data.leftDatas;
        var rightDatas=that.data.rightDatas;
        if(that.data.left_h<=that.data.right_h){
          leftDatas.push(value);
          left_h+=delta;  
        }else{
          rightDatas.push(value);
          right_h+=delta;
        }
        that.setData({
          left_h:left_h,
          right_h:right_h,
          leftDatas:leftDatas,
          rightDatas:rightDatas
        })
      })
      requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res2 => {
        console.log("result: ",res2)
        if(res2.message[0].favorite!=undefined){
          let left_favs=[];
          let right_favs=[];
          var that=this;
          // this.data.productList.forEach(function(value,i,array){
          //   let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
          //   if(index!=-1){
          //     favs.push(true);
          //   }else{
          //     favs.push(false);
          //   }
          // })
          this.data.leftDatas.forEach(function(value,i,array){
            let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
            if(index!=-1){
              left_favs.push(true);
            }else{
              left_favs.push(false);
            }
          })
          this.data.rightDatas.forEach(function(value,i,array){
            let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
            if(index!=-1){
              right_favs.push(true);
            }else{
              right_favs.push(false);
            }
          })
          that.setData({
            left_favs:left_favs,
            right_favs:right_favs
          })
        }
      });
    },
// 点击事件 商品加入购物车
handleLeftCartAdd(e){
  const {index}=e.currentTarget.dataset;
  console.log(index);
  this.setLeftCartadd(e);
},
handleRightCartAdd(e){
  const {index}=e.currentTarget.dataset;
  console.log(index);
  this.setRightCartadd(e);
},

// 加入购物车
setLeftCartadd(e){
  const {index}=e.currentTarget.dataset;
  let productObj=this.data.leftDatas[index];
  if(productObj.userid==app.globalData.openid){
    wx.showToast({
      title: '无法收藏自己发布的物品',
      icon: 'none',
      duration: 2000
    });
  }else{
  
    requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res2 => {
      console.log("result: ",res2)
      if(res2.message[0].favorite!=undefined){
        let id=res2.message[0].favorite.findIndex(v=>v.identity==productObj.identity);
        console.log("result: ",productObj.identity)
        console.log(res2.message[0].favorite)
        if(id==-1){
          console.log(id)
          res2.message[0].favorite.push(productObj);
          app.globalData.user.favorite=res2.message[0].favorite;
          requestUtil({url:"/user/update",method:"POST",data:res2.message[0]}).then(res=>{
            if(res){
              this.setData({
                sendFocusMsg:true
              })
               this.addLeftChat(e);
              console.log(app.globalData.user)
              const doc = {
                _id: `${Math.random()}_${Date.now()}`,
                groupId: this.data.chatid,
                avatar: app.globalData.user.userinfo.avatarUrl,
                nickName: app.globalData.user.userinfo.nickName,
                msgType: 'text',
                targetId:productObj.userid,
                textContent: app.globalData.user.nickname+"收藏了您的物品～",
                read:false,
                sendTime: util.formatTime(new Date()),
                sendTimeTS: Date.now(), // fallback
              }
              db.collection("chatroom_example").add({
                data: doc,
              })

              this.data.left_favs[index]=true;

              this.setData({
                left_favs:this.data.left_favs
              })
              // wx.showModal({
              //   title: '',
              //   content: '收藏成功，请去收藏夹查看～',
              //   complete: (res) => {
              //     if (res.cancel) {
                    
              //     }
              
              //     if (res.confirm) {
              //       wx.navigateTo({
              //         url: '/pages/favorite/index',
              //       })
              //     }
              //   }
              // })
            }

          })
          productObj.focus = productObj.focus+1;
          requestUtil({url:"/product/update",method:"POST",data:productObj}).then(res=>{
            // console.log(res.message)
          })
        }else{
          console.log(id)
          res2.message[0].favorite.splice(id,1);
          console.log(res2.message[0].favorite)
          app.globalData.user.favorite=res2.message[0].favorite;
          requestUtil({url:"/user/update",method:"POST",data:res2.message[0]}).then(res=>{
            if(res){
              this.data.left_favs[index]=false;
              this.setData({
                left_favs:this.data.left_favs
              })
            }
          })
          productObj.focus = productObj.focus-1;
          requestUtil({url:"/product/update",method:"POST",data:productObj}).then(res=>{
            // console.log(res.message)
          })
        }
      }
    })
  }






  // let cart=wx.getStorageSync('cart')||[];
  // console.log("cart: "+cart[0]);
  // let index=cart.findIndex(v=>v.id===this.productInfo.id);
  // if(index===-1){ // 购物车里面不存在当前商品 
  //   this.productInfo.num=1;
  //   this.productInfo.checked=true;
  //   cart.push(this.productInfo);
  // }else{ // 已经存在
  //   cart[index].num++;
  // }
  // wx.setStorageSync('cart', cart); // 把购物车添加到缓存中
},
setRightCartadd(e){
  const {index}=e.currentTarget.dataset;
  let productObj=this.data.rightDatas[index];
  if(productObj.userid==app.globalData.openid){
    wx.showToast({
      title: '无法收藏自己发布的物品',
      icon: 'none',
      duration: 2000
    });
  }else{
    requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res2 => {
      console.log("result: ",res2)
      if(res2.message[0].favorite!=undefined){
        let id=res2.message[0].favorite.findIndex(v=>v.identity==productObj.identity);
        console.log("result: ",productObj.identity)
        console.log(res2.message[0].favorite)
        if(id==-1){
          console.log(id)
          res2.message[0].favorite.push(productObj);
          app.globalData.user.favorite=res2.message[0].favorite;
          requestUtil({url:"/user/update",method:"POST",data:res2.message[0]}).then(res=>{
            if(res){
              this.setData({
                sendFocusMsg:true
              })
               this.addRightChat(e);
              console.log(app.globalData.user)
              const doc = {
                _id: `${Math.random()}_${Date.now()}`,
                groupId: this.data.chatid,
                avatar: app.globalData.user.userinfo.avatarUrl,
                nickName: app.globalData.user.userinfo.nickName,
                msgType: 'text',
                targetId:productObj.userid,
                textContent: app.globalData.user.nickname+"收藏了您的物品～",
                read:false,
                sendTime: util.formatTime(new Date()),
                sendTimeTS: Date.now(), // fallback
              }
              db.collection("chatroom_example").add({
                data: doc,
              })

              this.data.right_favs[index]=true;

              this.setData({
                right_favs:this.data.right_favs
              })
              // wx.showModal({
              //   title: '',
              //   content: '收藏成功，请去收藏夹查看～',
              //   complete: (res) => {
              //     if (res.cancel) {
                    
              //     }
              
              //     if (res.confirm) {
              //       wx.navigateTo({
              //         url: '/pages/favorite/index',
              //       })
              //     }
              //   }
              // })
            }

          })
          productObj.focus = productObj.focus+1;
          requestUtil({url:"/product/update",method:"POST",data:productObj}).then(res=>{
            // console.log(res.message)
          })
        }else{
          console.log(id)
          res2.message[0].favorite.splice(id,1);
          console.log(res2.message[0].favorite)
          app.globalData.user.favorite=res2.message[0].favorite;
          requestUtil({url:"/user/update",method:"POST",data:res2.message[0]}).then(res=>{
            if(res){
              this.data.right_favs[index]=false;
              this.setData({
                right_favs:this.data.right_favs
              })
            }
          })
          productObj.focus = productObj.focus-1;
          requestUtil({url:"/product/update",method:"POST",data:productObj}).then(res=>{
            // console.log(res.message)
          })
        }
      }
    })
  }

  // let cart=wx.getStorageSync('cart')||[];
  // console.log("cart: "+cart[0]);
  // let index=cart.findIndex(v=>v.id===this.productInfo.id);
  // if(index===-1){ // 购物车里面不存在当前商品 
  //   this.productInfo.num=1;
  //   this.productInfo.checked=true;
  //   cart.push(this.productInfo);
  // }else{ // 已经存在
  //   cart[index].num++;
  // }
  // wx.setStorageSync('cart', cart); // 把购物车添加到缓存中
},

onsubscribe(){
  // 向用户请求订阅消息授权
  wx.requestSubscribeMessage({
    tmplIds: ['cJ9pCIKt0PF3q6RJ9TIs49NN9yfblZt25oumlH0LbP8'], // 需要订阅的消息模板ID列表，替换为您自己的模板ID
    success(res) {
      // 用户授权成功
      if (res.errMsg === 'requestSubscribeMessage:ok') {
        // 遍历模板ID列表，判断用户的订阅状态
        for (let templateId of Object.keys(res)) {
          if (res[templateId] === 'accept') {
            // 用户同意订阅该模板消息
            console.log(`用户同意订阅模板消息：${templateId}`);
            // 在这里可以保存用户的订阅状态，以便后续推送消息时使用
          } else if (res[templateId] === 'reject') {
            // 用户拒绝订阅该模板消息
            console.log(`用户拒绝订阅模板消息：${templateId}`);
          }
        }
      }
    },
    fail(err) {
      // 请求订阅消息授权失败
      console.error('请求订阅消息授权失败：', err);
    }
  });

},
addLeftChat(e){
  let id=e.currentTarget.dataset.index;
  let productObj=this.data.leftDatas[id]
  let userInfo=app.globalData.user.userinfo;

  let that=this
  if(this.data.sendFocusMsg){
    console.log("set id: 0")
    this.setData({
      chatid:'s-'+app.globalData.openid+'-'+productObj.userid+'-'+productObj.identity
    })
  }else{
    this.setData({
      chatid:app.globalData.openid+'-'+productObj.userid+'-'+productObj.identity
    })
  }

  requestUtil({url:"/chats/findchatid",method:"GET",data:{chatid:this.data.chatid}}).then(res=>{
    if(res.message.length==0){
      this.addRoom(productObj,userInfo);
    }else{
      console.log("has existed chatroom!");
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
addRightChat(e){
  let id=e.currentTarget.dataset.index;
  let productObj=this.data.rightDatas[id]
  let userInfo=app.globalData.user.userinfo;

  let that=this
  if(this.data.sendFocusMsg){
    console.log("set id: 0")
    this.setData({
      chatid:'s-'+app.globalData.openid+'-'+productObj.userid+'-'+productObj.identity
    })
  }else{
    this.setData({
      chatid:app.globalData.openid+'-'+productObj.userid+'-'+productObj.identity
    })
  }

  requestUtil({url:"/chats/findchatid",method:"GET",data:{chatid:this.data.chatid}}).then(res=>{
    if(res.message.length==0){
      this.addRoom(productObj,userInfo);
    }else{
      console.log("has existed chatroom!");
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
  let id="0"
  if(!this.data.sendFocusMsg){
    id=app.globalData.openid
  }
  console.log(id);
  await requestUtil({url:"/chats/add",method:"POST",data:{
    chatid:chatroom.chatid,
    id:id,
    targetid:chatroom._openid,
    chatroom:chatroom
  }});

  await requestUtil({url:"/chats/add",method:"POST",data:{
        chatid:chatroom.chatid,
        id:chatroom._openid,
        targetid:id,
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

  if(!this.data.sendFocusMsg){
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
  }
  this.setData({
    sendFocusMsg:false
  })
},

  }
})