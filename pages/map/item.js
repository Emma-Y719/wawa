// pages/search/index.js
//导入request请求工具类
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
var util = require('../../styles/util.js');
// 获取应用实例
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indices:[],
    university:"",
    campus:"",
    uid:-1,
    cid:-1,
    storageid:-1,
    type:"",
    baseUrl:'',
    productList:[],
    floatButtonVisible: false,
    left: 0, // 悬浮窗左侧距离
    top: 0, // 悬浮窗顶部距离
    startX: 0, // 手指起始X坐标
    startY: 0, // 手指起始Y坐标，
    curPage:0,
    pageTotal:0,
    isLoading:false,
    campuses:[],
    chatids:"",
    left_favs:[],
    right_favs:[],
    sendFocusMsg:false,
    post_type:0,
    left_h:0,
    right_h:0,
    leftDatas:[],
    rightDatas:[],
    titleInfo:""
  },
  onFloatButtonTap() {
    wx.navigateTo({
      url: '/pages/search/map?uid='+this.data.uid+"&cid="+this.data.cid+"&type="+this.data.type
    });
  },
   // 悬浮窗触摸开始事件
   onTouchStart: function (e) {
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    });
    
    this.setData({
      campuses:app.globalData.campuses
    })
    if(options.post_type!=undefined){
      console.log("option post_type: "+options.post_type)
      var title_info=""
      if(options.post_type==0){
        title_info="好物"
      }else if(options.post_type==1){
        title_info="帖子"
      }else if(options.post_type==2){
        title_info="求购"
      }

      this.setData({
        post_type:options.post_type,
        titleInfo:title_info
      })
    }
    if(options.uid!=undefined){
      console.log(options)
      let uindex=parseInt(options.uid)
      let cindex=parseInt(options.cid)
      let t=''
      if(options.type!=undefined){
        const decodedParam = decodeURIComponent(options.type);
        const de2=decodeURIComponent(decodedParam);
        console.log(de2)
        t=de2
      }
      let u=''
      let c=''
      if(uindex!=-1){
        u=app.globalData.campuses[uindex].name;
      }else{
        u="不限"
      }
      if(cindex!=-1){
        c=app.globalData.campuses[cindex].campus;
      }else{
        c="不限"
      }

      this.setData({
        type:t,
        uid:uindex,
        cid:cindex,
        university:u,
        campus:c
      })
    }else{
      
      this.setData({
        type:"",
        uid:app.globalData.user.uid,
        cid:app.globalData.user.cid,
        university:app.globalData.user.university,
        campus:app.globalData.user.campus
      })
    }

    //this.searchItemList();
    var that = this
  },
  syncDataToComponent: async function () {
    const component = this.selectComponent('#filt_big'); // 替换为你的组件的 ID
    var storages=["不限"]
    if(this.data.uid==-1&&this.data.cid==-1){
      await requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
        console.log("result: ",result);
        result.message.forEach(function(value,index,array){
          //console.log(value);
          storages.push(value.name);
        })
      })
    }else{
      await requestUtil({url:'/storage/findByCampus',method:"GET",data:{uid:this.data.uid,cid:this.data.cid}}).then(result=>{
        console.log("result: ",result);
        result.message.forEach(function(value,index,array){
          //console.log(value);
          storages.push(value.name);
        })
      })
    }


    // app.globalData.user.storage.forEach(function(value,index,array){
    //   //console.log(value);
    //   storages.push(value.name);
    // })
    
    if (component) {
      component.setData({
        university:this.data.university,
        campus:this.data.campus,
        uid: this.data.uid,
        cid:this.data.cid,
        storageList:storages
      });
    }
    
    console.log("storage_id: "+component.data.storageid)
    this.setData({
      storageid:component.data.storageid
    })
    //this.searchItemList();
  },
  async onChildSearch(){
     
    this.setData({
      productList:[],
      curPage:0
    })
    await this.syncDataToComponent();
    console.log("test!!");
    await this.searchItemList();
},
  navigateBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onMarkerTap(e) {
    var markerId = e.markerId;
    var detailInfo = this.data.markers[markerId].detailInfo;

    // 更新详情内容到页面数据
    this.setData({
      detailInfo: detailInfo
    });
  },
  ontypeInput(e){
    this.setData({
      type:e.detail.value,
      curPage:0
    })
    console.log(e.detail)
    console.log(this.data.type)

    this.searchItemList()
  },
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },
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
  },

  async searchItemList(e){
    console.log("indices: "+this.data.uid+" , "+this.data.cid+" , "+this.data.storageid+", "+"type: "+this.data.type);
    await requestUtil({url:'/product/searchMultiItem',method:"GET",data:{p:this.data.curPage,post_type:this.data.post_type,university:this.data.uid,campus:this.data.cid,storage:this.data.storageid,type:this.data.type}}).then(result=>{
      console.log("lists",result.message.records);

      if(this.data.curPage==0){
        this.setData({
          productList:result.message.records,
          pageTotal:result.message.pages,
          curPage:1
        })
      }else{
        var curList=this.data.productList;
        curList.concat(result.message.records)
        result.message.records.forEach(function(value,index,array){
          curList.push(value)
        })
        console.log("curpage: ",result.message.records)
        console.log("curpage: ",curList)
        this.setData({
          productList:curList
        })
       
      }
      this.arrangeDatas(result.message.records);
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


    })
    // if(searchCampusIndex!=-1){
      
    //   requestUtil({url:'/product/searchMulti',method:"GET",data:{university:searchUniversityIndex,campus:searchCampusIndex,type:app.globalData}}).then(result=>{
    //     console.log("ll",result.message.productList);
    //     this.setData({
    //       university:university_,
    //       campus:campus_,
    //       type: app.globalData.type,
    //       productList:result.message.productList
    //     })
    //   })
    // }else if(searchCampusIndex==-1&&searchUniversityIndex!=-1){
    //   requestUtil({url:'/campus/findUniversity',method:"GET",data:{index:searchUniversity}}).then(result=>{
    //     console.log(result.message.schoolList);
    //     this.setData({
    //       university:result.message.name,
    //       campus:"不限",
    //       type:app.globalData.type,
    //       productList:result.message.schoolList
    //     })
    //   })
    // }else if(searchCampusIndex==-1&&searchUniversityIndex==-1){
    //   requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
    //     console.log(result.message);

    //     this.setData({
    //       university:"不限",
    //       campus:"不限",
    //       type:app.globalData.type,
    //       productList:result.message,
    //       scrollTop:0
    //     })
    //   })
    // }


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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.syncDataToComponent();
    this.setData({
      curPage:0,
      productList:[]
    })
    this.searchItemList();
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
    this.loadNextPage();
  },
  loadNextPage: function () {
    console.log("request next page！")
    // // 避免重复加载数据
    if (this.data.isLoading) {
      return;
    }

    // // 获取当前页数和每页请求的数据数量
    const { curPage, pageTotal } = this.data;

    if(curPage<pageTotal){
      // // 更新页数
      this.setData({
        curPage: curPage + 1,
      });
      
      // 显示加载动画
      wx.showLoading({
        title: '加载中...',
      });
      this.setData({
        isLoading:true
      })
  
      // 获取下一页数据
      // 这里使用setTimeout来模拟异步请求
      setTimeout(() => {
        this.searchItemList();
        // 隐藏加载动画
        wx.hideLoading();
        this.setData({
          isLoading:false
        })
      }, 1000);
    }else{
      wx.showToast({
        title: '已经到底啦~',
        icon: 'none',
      })
    }

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    wx.showShareMenu({
      withShareTicket:true,
      menu:['shareAppMessage','shareTimeline']
    })
    var that = this;
    console.log(app.globalData.userInfo)
    var nickName=app.globalData.userInfo.nickName;
    let imgurl="";

    imgurl=that.data.productList[0].propic.pics[0]

    console.log(imgurl)
    return {
      title: nickName+"分享了类别为"+this.data.type+"的一些二手物品",
      imageUrl: ""
    }

    
  }
})