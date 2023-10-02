// pages/index/index.js
//导入request请求工具类
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
wx.cloud.init();
const db=wx.cloud.database()
Page({
  data: {
    swiperList:[],
    baseUrl:'',
    bigTypeList:[],
    bigTypeList_row1:[],
    bigTypeList_row2:[],
    chat_row1:[],
    chat_row2:[],
    displayPost:[],
    displaySeek:[],
    hotProductList:[],
    productList:[],
    storageList:[],
    campuses:[],
    loc:"",
    locuni:"",
    loccam:"",
    type:"显示器",
    latitude: "",
    longitude: "",
    scale:12,
    uid:-1,
    cid:-1,
    markers: [
    ],
    isDefault:true,
    sendFocusMsg:false,
    isFavorite:[]
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  async getWLogin(){
    let that =this;
    if(!app.globalData.isLogin){
      
       wx.showModal({
        title:'友情提示',
        content:'微信授权登录后，才可进入',
        success:(res)=>{
          // wx.login({
          //   success: function(res) {
          //     if (res.code) {
          //       // 登录成功，获取到用户的登录凭证 code
          //       var code = res.code;
          //       console.log(code)
          //       requestUtil({url:"/user/login",method:"GET",data:{code:code}}).then(res=>{
          //         console.log(res)
          //         var openid=res.id;
          //         requestUtil({url:"/user/findid",method:"GET",data:{id:res.id}}).then(res=>{
          //           if(res.message.length==0){
          //             console.log("尚未注册!！")
          //             app.globalData.openid=openid;
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
          //       })
                
          //     }
          //   }
          // })

          wx.cloud.callFunction({
            name: 'yunrouter', // 对应云函数名
            data: {
              $url: "openid", //云函数路由参数
            },
            success: re => {
              console.log("user:"+re.result)
              app.globalData.openid=re.result
              requestUtil({url:"/user/findid",method:"GET",data:{id:re.result}}).then(res=>{

                    if(res.message.length==0){
                      console.log("尚未注册!！")
                     
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
            }
          })

          // Promise.all([getWxLogin(),getUserProfile()]).then((res)=>{
          //   console.log(res[0].code);
          //   console.log(res[1].userInfo.nickName,res[1].userInfo.avatarUrl)
          //   let loginParam={
          //     code:res[0].code,
          //     nickName:res[1].userInfo.nickName,
          //     avatarUrl:res[1].userInfo.avatarUrl
          //   }
          //   console.log(loginParam)
          //   wx.setStorageSync('userInfo', res[1].userInfo);
          //   this.wxlogin(loginParam);
          //   app.globalData.userInfo=res[1].userInfo
          //   app.globalData.isLogin=true;

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
  getcampusLoc(){
    requestUtil({url:"/campus/findId",mothod:"GET",data:{cid:this.data.cid}}).then(res=>{
      console.log(res)
       this.setData({
         latitude:res.message.latitude,
         longitude:res.message.longitude
       })
    })
  },
  onLoad(options) {
    // const component = this.selectComponent('#custom-tabbar');
    // component.on('componentReady', this.loadData);
    this.loadData();
  },
  onComponentReady: function() {
    // Your main page's loading function
    // Executed after the component has finished loading
    this.loadData();
    
  },

loadData(){
  const baseUrl=getBaseUrl();
  this.setData({
    baseUrl
  });
  
  console.log("here!",app.globalData)
  // this.getcampusLoc()
  // this.getWxLogin();
  // wx.getLocation({
  //   type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
  //   success: function (res) {
  //     //console.log('location:  ',res.latitude,res.longitude);
  //     //赋值经纬度
  //     that.setData({
  //       latitude: res.latitude,
  //       longitude: res.longitude,
  //     })
  //   }
  // })
  var that=this;
  if(app.globalData.campuses.length==0){
    requestUtil({url:"/campus/findCampusList",method:"GET"}).then(result=>{
      this.setData({
        campuses:result.message
      })
      this.searchSwiper();
    });
  }else{
    this.searchSwiper();
  }
  this.getBigTypeList();
  this.setData({
    loc:app.globalData.location,
  })
  this.searchDisplay();
  this.getHotProductList();
  console.log(this.loc);
  this.getWLogin();
  const chat_row1=app.globalData.storageList.filter((item,index)=>{
    return index<4;
  })
  const chat_row2=app.globalData.storageList.filter((item,index)=>{
    return index>=4&&index<8;
  })
  this.setData({
    chat_row1:chat_row1,
    chat_row2:chat_row2
  })
},
  async searchDisplay(){
    await requestUtil({url:'/product/displayPost',method:"GET"}).then(result=>{
      console.log("post",result)
      // console.log("campuses",app.globalData.campuses)
 
        this.setData({
          displayPost:result.message
        })

    })
    await requestUtil({url:'/product/displaySeek',method:"GET"}).then(result=>{
      console.log("seek",result)
      // console.log("campuses",app.globalData.campuses)
 
        this.setData({
          displaySeek:result.message
        })

    })
  },
  async searchSwiper(e){
    await requestUtil({url:'/product/findSwiper',method:"GET"}).then(result=>{
      console.log("swiper",result)
      // console.log("campuses",app.globalData.campuses)
 
        this.setData({
          swiperList:result.message,
          // storageList:app.globalData.storageList,
          campuses:app.globalData.campuses
        })
      

    })

  },
  async getHotProductList(e){
    requestUtil({url:'/product/findHot',method:"GET"}).then(result=>{
      this.setData({
        hotProductList:result.message
      })
      result.message.forEach(function(value,index,array){
        　　//code something
        console.log(value.propic.pics[0])
        });
      console.log("Hot: "+result)
      requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res2 => {
        console.log("result: ",res2)
        if(res2.message[0].favorite!=undefined){
          let favs=[];
          var that=this;
          this.data.hotProductList.forEach(function(value,i,array){
            let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
            if(index!=-1){
              favs.push(true);
            }else{
              favs.push(false);
            }
          })
          that.setData({
            isFavorite:favs
          })
        }
      });
    })
  },
  async getBigTypeList(){
    const result =await requestUtil({
      url:'/bigType/findAll',
      method:"GET"
    });
    console.log("bigType: ",result)
    const bigTypeList=result.message;
    const bigTypeList_row1=bigTypeList.filter((item,index)=>{
      return index<4;
    })
    const bigTypeList_row2=bigTypeList.filter((item,index)=>{
      return index>=4;
    })
    this.setData({
      bigTypeList,
      bigTypeList_row1,
      bigTypeList_row2,
    })
  },
  onInput:function(e){
    //console.log(e.detail.value);
    this.setData({
      type:e.detail.value
    })
  },
  handleSearch(e){
    console.log("data-type: ",this.data.type)
    app.globalData.type=this.data.type;
    // console.log(app.globalData.type);
  },
  //点击跳转商品分类页面
  handleTypeJump(e){
    console.log(e);
    const {index}=e.currentTarget.dataset;
    //console.log("type index: "+index)
    // app.globalData.index=index;
    // wx.navigateTo({
    //   url: '/pages/category/index',
    // }) 
    const chineseParam =this.data.bigTypeList_row1[index].name;
    const encodedParam = encodeURIComponent(chineseParam);
    wx.navigateTo({
      url: '/pages/search/index?uid=-1&cid=-1&type='+encodedParam,
    })

    // let rightContext=this.Cates[index].smallTypeList;
    // this.setData({
    //   currentIndex:index,
    //   rightContext,
    //   scrollTop:0
    // })
  },
  handleTypeJump2(e){
    console.log(e);
    const {index}=e.currentTarget.dataset;
    //console.log("type index: "+index)
    // app.globalData.index=index;
    // wx.navigateTo({
    //   url: '/pages/category/index',
    // }) 
    const chineseParam =this.data.bigTypeList_row2[index].name;
    const encodedParam = encodeURIComponent(chineseParam);
    wx.navigateTo({
      url: '/pages/search/index?uid=-1&cid=-1&type='+encodedParam,
    })

    // let rightContext=this.Cates[index].smallTypeList;
    // this.setData({
    //   currentIndex:index,
    //   rightContext,
    //   scrollTop:0
    // })
  },
  onReady(){

  },
  onShow(){
    console.log("onShow")
    // this.seteData({
    //   uid:app.globalData.user.uid,
    //   cid:app.globalData.user.cid,
    //   locuni:app.globalData.userInfo.university,
    //   loccam:app.globalData.userInfo.campus
    // })
    const app=getApp();
    const {location}=app.globalData
    //console.log("location: "+location)
    if(location!="南京"){//首页跳转而来
      this.getCampusesFromLoc(location);
    }
    // console.log(app.globalData)
    this.searchProductList();

    
  },
  async searchProductList(e){

    await requestUtil({url:'/product/searchMulti',method:"GET",data:{p:0,university:-1,campus:-1,storage:-1,type:''}}).then(result=>{
      //console.log("lists",result.message);
      this.setData({
        productList:result.message.records
      })
      //console.log("product: ",this.data.productList)
    var list=this.data.productList;
    var marks=[]
    let that=this;
    list.forEach(function(value,index,array){
      let imgurl=''
      if(value.propic.pics[0][0]!='h'&&value.propic.pics[0][0]!='c'&&value.propic.pics[0][0]!='w'){
        imgurl=that.data.baseUrl+"/image/product/"+value.propic.pics[0]
      }else{
        imgurl=value.propic.pics[0]
      }
      var marker={
        id: index,
        iconPath: imgurl,
        latitude: value.latitude,
        longitude: value.longtitude,
        width: 20,  
        height: 20,
        callout: {
          content: value.price,
          color: '#ffffff',
          fontSize: 30,
          borderRadius: 4,
          bgColor: '#000000',
          padding: 8
        },
        title:value.name,
        detailInfo:value.description,
        propic:value.propic,
        price:value.price,
        identity:value.identity
      }
      marks[index]=marker

    });
    this.setData({
      markers:marks
    })
    })
  },
  onClickMap(){
    wx.navigateTo({
      url: '/pages/search/map',
    })
  },
  onMarkerTap(){
    wx.navigateTo({
      url: '/pages/search/map',
    })
  },
  async getCampusesFromLoc(location){
    this.setData({
      loc:location
    })

  },

  // 点击事件 商品加入购物车
  handleCartAdd(e){
    const {index}=e.currentTarget.dataset;
    console.log(index);
    this.setCartadd(e);
  },

  // 加入购物车
  setCartadd(e){
    const {index}=e.currentTarget.dataset;
    let productObj=this.data.hotProductList[index];
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
                 this.addChat(e);
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

                this.data.isFavorite[index]=true;

                this.setData({
                  isFavorite:this.data.isFavorite
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
                this.data.isFavorite[index]=false;
                this.setData({
                  isFavorite:this.data.isFavorite
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
  addChat(e){
    let id=e.currentTarget.dataset.index;
    let productObj=this.data.hotProductList[id]
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
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage','shareTimeline']
    })
  },
  onShareTimeline: function () {
    return {
      title: '蛙蛙二手群物品库,这里有很多东西在低价出售，欢迎点进来瞧一瞧~',
      imageUrl: ''
    }
  },


  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
}


)
