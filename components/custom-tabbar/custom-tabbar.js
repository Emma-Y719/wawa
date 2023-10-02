// 导入request请求工具类
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil
} from '../../utils/requestUtil.js';

// components/SearchBar/SearchBar.js
const app = getApp()
wx.cloud.init()
const db=wx.cloud.database()
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
    notRead:false,
    chose:[]

  },
  lifetimes: {
    attached: function() {
      this.onLoad();
    },
    // ready:function(){
    //   console.log("component ready!")
    //   this.triggerEvent('componentReady');
    // }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onNotComplete(){
      wx.showToast({
        title: '正在开发中，仅作展示',
        icon: 'none',
      })
    },
    async try (fn, title) {
      try {
        await fn()
      } catch (e) {
        this.showError(title, e, '', '')
      }
    },
    showError(title, content, confirmText, confirmCallback) {
      console.error(title, content)
      wx.showModal({
        title,
        content: content.toString(),
        showCancel: confirmText ? true : false,
        confirmText,
        success: res => {
          res.confirm && confirmCallback()
        },
      })
    },
    onLoad:function(){
      console.log("Load bar")
      // this.watchInfo();
     this.getWLogin();
     this.setData({
       chose:app.globalData.chose
     })
     console.log(this.data.chose)
      // this.timer = setInterval(() => {
      //   this.refreshPage();
      // }, 5000);
    },
    refreshPage: function() {
      // 执行需要刷新的逻辑，例如重新加载数据
      // 重新加载数据的代码示例：
      this.getInfo();
    },
    async getUserProfile(){
      var res=await getUserProfile();
      console.log("login: ",res)
    },
    async getWLogin(){
      let that =this;
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
      if(route!="pages/index/index"){
        if(!app.globalData.isLogin){
        
          console.log("tab login!")
           wx.showModal({
            title:'友情提示',
            content:'微信授权登录后，才可进入',
            success:(res)=>{
              // that.getUserProfile();
              // wx.login({
              //   success: function(res) {
              //     if (res.code) {
              //       // 登录成功，获取到用户的登录凭证 code
              //       var code = res.code;
              //       console.log(code)
              //       requestUtil({url:"/user/login",method:"GET",data:{code:code}}).then(res=>{
              //         app.globalData.openid=res.id
              //         console.log(res);
              //         requestUtil({url:"/user/findid",method:"GET",data:{id:res.id}}).then(res=>{
              //           if(res.message.length==0){
              //             console.log("尚未注册！")
              //             wx.redirectTo({
              //               url: '/pages/my/create/login',
              //             })
              //           }else{
              //             app.globalData.openid= res.message[0].openid;
              //             app.globalData.userInfo = res.message[0].userinfo;
              //             app.globalData.friends=res.message[0].friends;
              //             app.globalData.user=res.message[0];
              //             app.globalData.isLogin=true;
              //             console.log("data user:",app.globalData.user)
              //             that.setData({
              //               uid:res.message[0].uid,
              //               cid:res.message[0].cid,
              //               locuni:res.message[0].university,
              //               loccam:res.message[0].campus
              //             })
              //             //that.getcampusLoc();
              //             console.log("component ready!")
              //             that.triggerEvent('componentReady');
              //             that.watchInfo();
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
            
            }
          })
        }else{
          that.setData({
            uid:app.globalData.user.uid,
            cid:app.globalData.user.cid,
            locuni:app.globalData.userInfo.university,
            loccam:app.globalData.userInfo.campus
          })
          //that.getcampusLoc();
          that.triggerEvent('componentReady');
          that.watchInfo();
        }
      }else{
        this.watchInfo();
      }

    },
    async getcampusLoc(){
      await requestUtil({url:"/campus/findId",mothod:"GET",data:{cid:this.data.cid}}).then(res=>{
        console.log(res)
         this.setData({
           latitude:res.message.latitude,
           longitude:res.message.longitude
         })
      })
    },
    async watchInfo(){
      console.log("print openid before query: ",app.globalData.openid)
      this.try(async()=>{
        const regExp = new RegExp('.*'+app.globalData.openid+'.*', 'i');
        const messageListener = db.collection('chatroom_example').where({targetId:app.globalData.openid,read:false}).watch({
          onChange: this.onRealtimeMessageSnapshot.bind(this),
          onError: e => {
            console.log("error: ",e)
            // if (!this.inited || this.fatalRebuildCount >= FATAL_REBUILD_TOLERANCE) {
            //   this.showError(this.inited ? '监听错误，已断开' : '初始化监听失败', e, '重连', () => {
            //     this.initWatch(this.data.chats.length ? {
            //       sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
            //     } : {})
            //   })
            // } else {
            //   this.initWatch(this.data.chats.length ? {
            //     sendTimeTS: _.gt(this.data.chats[this.data.chats.length - 1].sendTimeTS),
            //   } : {})
            // }
          },
        })

      }, '初始化失败')

    },
    onRealtimeMessageSnapshot(snapshot) {
      console.warn(`收到消息`, snapshot)
      let infoCount=0;
      for (const docChange of snapshot.docChanges) {
        if(docChange.doc._openid!=app.globalData.openid){
          if(docChange.queueType=='dequeue'){
            infoCount--;
          }else{
            console.log("query unread chat: ",docChange.doc)
            infoCount++;
          }
        }
      }
      if(infoCount>0){
        this.setData({
          notRead:true
        })
        wx.setStorageSync('notRead', true);
      }else{
        this.setData({
          notRead:false
        })
        wx.setStorageSync('notRead', false);
      }
      // if (snapshot.type === 'init') {
      //   // this.setData({
      //   //   chats: [
      //   //     ...this.data.chats,
      //   //     ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS),
      //   //   ],
      //   // })
      //   this.inited = true
      //   for (const docChange of snapshot.docChanges) {
      //     console.log("query chat openid: ",docChange.doc)
      //     // if(docChange.doc._openid==this.data.haoyou_openid){
      //     //   this.db.collection("chatroom_example").where({sendTimeTS:docChange.doc.sendTimeTS}).update({
      //     //     data: {
      //     //       read: true,
      //     //     }
      //     //   } );
      //     // }
      //     // .get().then(res=>{
      //     //   console.log(res.data)
      //     // })
      //   }
      // } else {
      //   let hasNewMessage = false
      //   let hasOthersMessage = false
      //   const chats = [...this.data.chats]
      //   console.log("type: "+snapshot.type)
      //   for (const docChange of snapshot.docChanges) {
      //     console.log("query chat openid: ",docChange.doc)
      //     // switch (docChange.queueType) {
      //     //   case 'enqueue': {
      //     //     hasOthersMessage = docChange.doc._openid !== this.data.openId
      //     //     const ind = chats.findIndex(chat => chat._id === docChange.doc._id)
      //     //     if (ind > -1) {
      //     //       if (chats[ind].msgType === 'image' && chats[ind].tempFilePath) {
      //     //         chats.splice(ind, 1, {
      //     //           ...docChange.doc,
      //     //           tempFilePath: chats[ind].tempFilePath,
      //     //         })
      //     //       } else chats.splice(ind, 1, docChange.doc)
      //     //     } else {
      //     //       hasNewMessage = true
      //     //       chats.push(docChange.doc)
      //     //       if(docChange.doc._openid==this.data.haoyou_openid){
      //     //         this.db.collection(collection).where({sendTimeTS:docChange.doc.sendTimeTS}).update({
      //     //           data: {
      //     //             read: true,
      //     //           }
      //     //         } );
      //     //       }

      //     //     }
      //     //     break
      //     //   }
      //     // }

      //   }
      //   // this.setData({
      //   //   chats: chats.sort((x, y) => x.sendTimeTS - y.sendTimeTS),
      //   // })
      //   // if (hasOthersMessage || hasNewMessage) {
      //   //   this.scrollToBottom(true)
      //   // }

      // }
    },


    getInfo(){
      
      this.try(async () => {
        const regExp = new RegExp('.*'+app.globalData.openid+'.*', 'i');
        const{data:initList}= await db.collection('chatroom_example').where({groupId:regExp}).orderBy('sendTimeTS', 'desc').get()
        //console.log(app.globalData.openid)
        if(initList[0]._openid!=app.globalData.openid&&initList[0].read!=true){
          //console.log("new message: ",initList[0])
          this.setData({
            notRead:true
          })
        }else{
          this.setData({
            notRead:false
          })
        }
       
        //console.log(that.data.rooms)
      },'初始化失败')
    },
    setChose(index){
      var temChose=[]
      for(var i=0;i<5;i++){
        if(i==index){
          temChose.push(true)
        }else{
          temChose.push(false)
        }
      }
      this.setData({
        chose:temChose
      })
      app.globalData.chose=temChose;
    },
    onNavi1(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
      
      if(route!='pages/index/index'){
        this.setChose(0);
        if(route=="pages/promote/index"){

          cur.onTab('/pages/index/index');
        }else{

          wx.reLaunch({
            url: '/pages/index/index',
          })
        }
      }
    },
    onNavi2(){
     
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
      if(route!='pages/map/index'){
        this.setChose(1);
        if(route=="pages/promote/index"){
          cur.onTab('/pages/map/index');
        }else{
          wx.reLaunch({
            url: '/pages/map/index',
          })
        }
      }
    },
    onNavi3(){


      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
      if(route!='pages/messages/message'){
        if(app.globalData.user.subscribe!=true){
          wx.requestSubscribeMessage({
            tmplIds: ['7JWHM7EVLyq5kZjMQGGOHQPFAzRNSqc_yVof-cW1r_k'], // 需要订阅的消息模板ID列表，替换为您自己的模板ID
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
      
        }
        this.setChose(2);
        if(route=="pages/promote/index"){
          cur.onTab('/pages/messages/message');
        }else{
          wx.reLaunch({
            url: '/pages/messages/message',
          })
        }
      }
    },
    onNavi4(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
     
      // if(route!='/pages/my/detail?userid=olD3w5L8bcp1OLV_cAzkejkVRqh4'){
      //   if(route=="pages/promote/index"){
      //     cur.onTab('/pages/my/detail?userid=olD3w5L8bcp1OLV_cAzkejkVRqh4');
      //   }else{
      //     wx.reLaunch({
      //       url: '/pages/my/detail?userid=olD3w5L8bcp1OLV_cAzkejkVRqh4',
      //     })
      //   }
      // }
      if(route!='/pages/my/index'){
        this.setChose(3);
        if(route=="pages/promote/index"){
          cur.onTab('/pages/my/index');
        }else{
          wx.reLaunch({
            url: '/pages/my/index',
          })
        }
      }
    },
    onNavi5(){
      // this.onNotComplete();
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
      if(route!='pages/promote/index'){
        this.setChose(4)
        wx.reLaunch({
          url: '/pages/promote/index',
        })
      }
    },
    ready: function() {
      console.log("component ready!")
      this.triggerEvent('componentReady');
    }
  }
})
