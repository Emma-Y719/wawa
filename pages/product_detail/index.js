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
    user:{},
    userInfo:{},
    isfocus:false,
    fvalue:"",
    me:{},
    id:-1,
    chatid:"",
    hasStorage:false,
    storageName:'',
    storageid:0
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
  onStorageEntry(){
    wx.navigateTo({
      url: '/pages/storage/detail?id='+this.data.storageid,
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
    console.log("storage: ",result.message)
    if(result.message.storage!=0){
      this.setData({
        id:id,
        productObj: result.message,
        hasStorage:true,
        storageid:result.message.storage
      })
      console.log("storageid: ",this.data.storageid)
      requestUtil({url:'/storage/findById',method:"GET",data:{id:result.message.storage}}).then(res=>{
        console.log("storage: ",res.message[0])
        this.setData({
          storageName:res.message[0].name
        })

      })
    }else{
      this.setData({
        id:id,
        productObj: result.message,
        hasStorage:false
      })
    }

    console.log("userid: ",result.message)

    await requestUtil({url:"/user/findid",method:"GET",data:{id:result.message.userid}}).then(res=>{
      console.log(res)
      this.setData({
        userInfo:res.message[0].userinfo,
        user:res.message[0]
      })
    })

    
    if(app.globalData.friends!=undefined){
      if(app.globalData.friends.length!=0){
        console.log("friends: ",app.globalData.user.friends)
        // if(app.globalData.friends[0]==null){
        //   app.globalData.friends.splice(0,1)
        // }
        console.log("this: ",this.data.user.openid)
        if(app.globalData.friends!=1&&app.globalData.friends[0]!=null){
          let index=app.globalData.user.friends.findIndex(v=>v._openid==this.data.user.openid);
          console.log("result: ",index)
          if(index!=-1){
              this.setData({
                isfocus:true,
                fvalue:"已关注"
              })
            }else{
              this.setData({
                fvalue:"+关注"
              })
            }
        }


          

      }else{
        this.setData({
          isfocus:false,
          fvalue:"+关注"
        })
      }

    }else{
    
        this.setData({
          isfocus:false,
          fvalue:"+关注"
        })
      
    }

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
  
  addChat(e){
    console.log(app.globalData.user.subscribe)
    if(app.globalData.user.subscribe!=true){
      this.onsubscribe();
    }
    
    if(this.data.productObj.userid==app.globalData.openid){
      wx.showToast({
        title: '扪心自问：我是谁，我来自哪里，我在干什么～',
        icon: 'none',
        duration: 2000
      });
    }else{
      let that=this
      this.setData({
        chatid:app.globalData.openid+'-'+this.data.productObj.userid+'-'+this.data.productObj.identity
      })
      db.collection('chats').where({
        chatid:this.data.chatid
      }).get().then(res=>{
        console.log(this.data.chatid)
        console.log("chat: ",res.data.length)
        if(res.data.length==0){
          this.addRoom();
        }else{
          wx.navigateTo({
            url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + this.data.userInfo.nickName+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+that.data.productObj.userid+'&product='+that.data.productObj.identity,
          })
        }
      })

    }

    
        //     let rooms=res2.result.data[0].chat;
        // console.log("chat: ",rooms)
        // let count=0;
        // rooms.forEach(function(value,index,array){
        //   if(value.product.identity==that.data.id){
        //     count+=1;
        //   }
        // })
        // if(count==0){
        //   this.addRoom();

        // }else{
        //   console.log(that.data.chatname)

        // }
  },
  async addRoom(){
    var chatroom={
      chatid: this.data.chatid,
      userInfo: this.data.userInfo,
      _openid: this.data.productObj.userid,
      backgroundimage: '',
      product:this.data.productObj
    }
    var chatroom_target={
      chatid: this.data.chatid,
      userInfo: app.globalData.userInfo,
      _openid: this.data.productObj.userid,
      backgroundimage: '',
      product:this.data.productObj
    }
    await db.collection('chats').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        chatid:chatroom.chatid,
        id:app.globalData.openid,
        targetid:chatroom._openid,
        chatroom:chatroom
      }
    })
    await db.collection('chats').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        chatid:chatroom.chatid,
        id:chatroom._openid,
        targetid:app.globalData.openid,
        chatroom:chatroom_target
      }
    })

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
        backgroundimage:that.data.backgroundimage1
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
        url: '/pages/example/chatroom_example/room/room?id=' + that.data.chatid + '&name=' + that.data.chatname+'&backgroundimage='+that.data.backgroundimage+'&haoyou_openid='+haoyouinfo._openid+'&product='+this.data.productObj.identity,
      })
    }
  },
  previewImage: function(e) {
    let id=e.currentTarget.dataset.id
    wx.previewImage({
      current: this.data.productObj.propic.pics[id],
      urls: this.data.productObj.propic.pics
    })
  },
   handlefocus(e){
    if(this.data.productObj.userid==app.globalData.openid){
      wx.showToast({
        title: '无法对自己进行此操作',
        icon: 'none',
        duration: 2000
      });
    }else{
      if(!this.data.isfocus){
        requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res=>{
          res.message[0].friends.push({
            id: app.globalData.openid+this.data.productObj.userid,
            userInfo: this.data.userInfo,
            _openid: this.data.productObj.userid,
              backgroundimage: ''
          })
          let updateFri=res.message[0]
          requestUtil({url:"/user/update",method:"POST",data:updateFri}).then(res=>{
            if(res){
              console.log("result: ",res)
              this.data.isfocus=true;
              app.globalData.friends=updateFri.friends;
              app.globalData.user=updateFri;
              this.setData({
                isfocus:true,
                fvalue:"已关注"
              })
            }
          })
        })

       
      //  wx.cloud.callFunction({
      //    name: 'yunrouter',
      //    data: {
      //      $url: "huoquUserinfo", //云函数路由参数
      //      openid: app.globalData.openid
      //    },
      //    success: res2 => {
      //      console.log("result: ",res2)
      //      this.data.isfocus=true;
      //      app.globalData.friends=res2.result.data[0].friends;
      //      this.setData({
      //        isfocus:true,
      //        fvalue:"已关注"
      //      })
      //    },
      //    fail() {
      //    }
      //  });
     }else{
       requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res=>{
        // res.message[0].friends.splice(0,1)
        // let index=res.message[0].friends.findIndex(v=>v._openid==this.data.user.openid);
        //   console.log("result: ",index)
          
         
         let that=this;
         var newFri = res.message[0].friends.filter(function(element) {
           return element._openid != that.data.user.openid&&element!=null; // 返回 true 以保留元素，返回 false 以删除元素
         });
         console.log(newFri);

       res.message[0].friends=newFri;
          requestUtil({url:"/user/update",method:"POST",data:res.message[0]}).then(res=>{
            console.log(res)
            if(res){
              app.globalData.friends=newFri;
              app.globalData.user.friends=newFri;
              this.setData({
                isfocus:false,
                fvalue:"+关注"
              })
            }
          })
       })

      //  db.collection('user').where({
      //    _openid: app.globalData.openid
      //  }).update({
      //    data: {
      //      friends: db.command.pull({
      //        id: app.globalData.openid+this.data.productObj.userid,
      //        userInfo: this.data.userInfo,
      //        _openid: this.data.productObj.userid,
      //        backgroundimage: ''
      //      })
      //    }
      //  })
       
      //  wx.cloud.callFunction({
      //    name: 'yunrouter',
      //    data: {
      //      $url: "huoquUserinfo", //云函数路由参数
      //      openid: app.globalData.openid
      //    },
      //    success: res2 => {
      //      console.log("result: ",res2)
      //      app.globalData.friends=res2.result.data[0].friends;
      //      this.setData({
      //        isfocus:false,
      //        fvalue:"+关注"
      //      })
      //    },
      //    fail() {
      //    }
      //  });
 
     }


    }





    
  },
  // 点击事件 商品加入购物车
  handleCartAdd(){
    this.setCartadd();


  },

  onUserDetail(e){
    console.log("open the page of user!")
    
    wx.navigateTo({
      url: '/pages/my/detail?userid='+this.data.productObj.userid,
    })
  },

  // 加入购物车
  setCartadd(){
    if(this.data.productObj.userid==app.globalData.openid){
      wx.showToast({
        title: '无法收藏自己发布的物品',
        icon: 'none',
        duration: 2000
      });
    }else{
    
      requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res2 => {
        console.log("result: ",res2)
        if(res2.message[0].favorite!=undefined){
          let index=res2.message[0].favorite.findIndex(v=>v.identity==this.data.productObj.identity);
          console.log("result: ",this.data.productObj.identity)
          console.log(res2.message[0].favorite)
          if(index==-1){
            console.log(index)
            res2.message[0].favorite.push(this.data.productObj);
            app.globalData.user.favorite=res2.message[0].favorite;
            requestUtil({url:"/user/update",method:"POST",data:res2.message[0]}).then(res=>{
              if(res){
                wx.showModal({
                  title: '',
                  content: '收藏成功，请去收藏夹查看～',
                  complete: (res) => {
                    if (res.cancel) {
                      
                    }
                
                    if (res.confirm) {
                      wx.navigateTo({
                        url: '/pages/favorite/index',
                      })
                    }
                  }
                })
              }

            })
            // db.collection('user').where({
            //   _openid: app.globalData.openid
            // }).update({
            //   data: {
            //     favorite: db.command.push([this.data.productObj])
            //   }
            // })

          }else{
            wx.showModal({
              title: '',
              content: '已在收藏夹中，勿重复收藏，去查看',
              complete: (res) => {
                if (res.cancel) {
                  
                }
            
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/favorite/index',
                  })
                }
              }
            })
          }
        }else{
          console.log("result: ",res2.message[0].favorite)
          res2.message[0].favorite.push(this.data.productObj);
          requestUtil({url:"/user/update",method:"GET",data:res2.message[0]}).then(res=>{
            wx.showModal({
              title: '',
              content: '收藏成功，请去收藏夹查看～',
              complete: (res) => {
                if (res.cancel) {
                  
                }
            
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/favorite/index',
                  })
                }
              }
            })
          })
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