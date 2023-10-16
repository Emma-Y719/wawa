// pages/example/chatroom_example/message.js
var util = require('../../styles/util.js');
import {
  getBaseUrl,
  requestUtil
} from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';

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
    systemdisplay:false,
    focuses:[],
    rooms:[],
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.onsubscribe()
    this.getRooms();

    this.watchInfo();
      // 每隔5秒刷新页面一次
    // this.timer = setInterval(() => {
    //   this.refreshPage();
    // }, 5000);
  },
  ontapChat(e){

      this.setData({
        chatdisplay:true,
        focusdisplay:false,
        systemdisplay:false
      })
 
  },
  ontapFocus(e){
    this.setData({
      focusdisplay:true,
      chatdisplay:false,
      systemdisplay:false
    })
    this.data.focuses.forEach(function(value,index,array){
      console.log(value)
      if(value.notRead==true){
        db.collection("chatroom_example").where({sendTimeTS:value.sendTimeTS,textContent:value.textContent}).update({
          data: {
            read: true,
          }
        } );
        value.notRead=false;
      }

    })
    this.setData({
      focuses:this.data.focuses,
      focusnotread:false
    })
  },
  ontapSystem(e){
    this.setData({
      systemdisplay:true,
      chatdisplay:false,
      focusdisplay:false
    })
    this.data.systemList.forEach(function(value,index,array){
      console.log(value)
      if(value.notRead==true){
        db.collection("chatroom_example").where({sendTimeTS:value.sendTimeTS,textContent:value.textContent}).update({
          data: {
            read: true,
          }
        } );
        value.notRead=false;
      }

    })
    this.setData({
      systemList:this.data.systemList,
      systemnotread:false
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
    this.getRooms();


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
  onsubscribe(){
    // 向用户请求订阅消息授权
    wx.requestSubscribeMessage({
      tmplIds: ['yourTemplateId1', 'yourTemplateId2'], // 需要订阅的消息模板ID列表，替换为您自己的模板ID
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
  onUserDetail(e){
    console.log("open the page of user!",e.currentTarget.dataset.id)
    console.log(this.data.rooms[e.currentTarget.dataset.id])
    // let product=this.data.rooms[e.currentTarget.dataset.id].product
    let target=this.data.rooms[e.currentTarget.dataset.id].targetid
    wx.navigateTo({
      url: '/pages/my/detail?userid='+target,
    })
  },  
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },
  mergeCommonCriteria(criteria) {
    return {
      //groupId是你这个聊天室的名字，
      //自己可以利用Id给每个卖家创建一下之类的，用id当名字
      //同一个卖家的大家都进到这个聊天室中

      //或者商品一开始上传的时候给他带一个属性就是聊太的属性就行，正好也可以当作评论的属性
      groupId: this.data.groupId,
      ...criteria,
    }
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
  async getRooms() {
    console.log(app.globalData.openid);
    
    let chatres = await requestUtil({url: '/chats/findid', method: "GET", data: {id: app.globalData.openid}});
    let chats = chatres.message;
    
    let roomPromises = chats.map(async (value) => {
      //console.log("chatId: " + value.chatid);
      let chatroom = value.chatroom;
      let imgurl=""
      if(chatroom.product.propic.pics[0][0]!='h'&&chatroom.product.propic.pics[0][0]!='c'){
        imgurl=app.globalData.baseUrl+"/image/product/"+chatroom.product.propic.pics[0]
      }else{
        imgurl=chatroom.product.propic.pics[0]
      }
      let lastmsgtime=''
      let lastmsgtimeFormat=''
      let lastmsg=''
      let lastsender=''
      let notRead=false
      let splitStrings=[]
      // 使用 Promise 来处理异步操作
      return new Promise(async (resolve, reject) => {
        try {
          const {data: initList} = await db.collection('chatroom_example')
            .where({groupId: value.chatid})
            .orderBy('sendTimeTS', 'desc')
            .get();
  
          // ... (处理数据)
         if(initList[0]!=undefined){
          if(initList[0].msgType=='image'){
            lastmsg="图片"
          }else if(initList[0].msgType=='text'){
            lastmsg=initList[0].textContent
          }
          // lastmsg=initList[0].textContent
          lastmsgtime=initList[0].sendTimeTS
          lastmsgtimeFormat=initList[0].sendTime
          splitStrings= lastmsgtimeFormat.split(" ");
          // const time1 = splitStrings[0];
          // const time2 = splitStrings[1];
          // console.log(string1, string2);
          lastsender=initList[0].nickName
          if(initList[0]._openid!=app.globalData.openid&&!initList[0].read){
            notRead=true;
          }
          //console.log(notRead)
        }
          if (lastmsg !== '') {
            let room = {
                  targetid:value.targetid,
            target:chatroom.userInfo,
            product:{
              pic:imgurl,
              name:chatroom.product.name,
              userid:chatroom.product.userid
            },
            url:'/pages/messages/room/room?id=' + chatroom.chatid + '&name=' + chatroom.userInfo.nickName+'&backgroundimage='+chatroom.backgroundimage+'&haoyou_openid='+value.targetid+'&product='+chatroom.product.identity,
            lastmsg:lastmsg,
            lastmsgtime:splitStrings,
            lastsender:lastsender,
            notRead:notRead
            };
            resolve(room);
          } else {
            resolve(null); // 表示没有合适的数据
          }
        } catch (error) {
          reject(error);
        }
      });
    });
  
    // 使用 Promise.all 来等待所有异步操作完成
    try {
      let roomResults = await Promise.all(roomPromises);
      let rooms = roomResults.filter(result => result !== null);
      var roomsUpdate = rooms.sort((x, y) => y.lastmsgtime - x.lastmsgtime);
      var chatsList=[]
      var focusList=[]
      var systemList=[]
      let chatnotread=false;
      let focusnotread=false;
      let systemnotread=false;
      roomsUpdate.forEach(function(value,index,array){
        //console.log(value.targetid);
   
        if(value.targetid==0){

          focusList.push(value);
          //console.log(value);
          if(value.notRead){
            focusnotread=true;
          }
        }else if(value.targetid==1){
          systemList.push(value);
          if(value.notRead){
            systemnotread=true;
          }
        }else{
          chatsList.push(value);
          if(value.notRead){
            chatnotread=true;
          }
        }
        


      })

      this.setData({
        rooms: chatsList,
        focuses:focusList,
        systemList:systemList,
        chatnotread:chatnotread,
        focusnotread:focusnotread,
        systemnotread:systemnotread
      });
      


    } catch (error) {
      console.error(error);
    }
  },
  async queryAllResult(){
    const res=await this.queryAll("chats",{id:app.globalData.openid});
    return res;
  },
  
  async queryAll(collection,querys){
    const MAX_LIMIT=50;
    // 获取记录总数
    const countResult = await db.collection(collection).where(querys).count();
    const total = countResult.total;
    console.log(total)
    // 计算总共需要的分页次数
    const batchTimes = Math.ceil(total / 50);
  
    // 批量获取所有记录
    const tasks = [];
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection(collection).where(querys)
        .skip(i * 50)
        .limit(50)
        .get();
      tasks.push(promise);
    }
  
    // 等待所有分页查询完成
    const result = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      };
    });
  
    return result;
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
    this.getRooms();
  },
  refreshPage: function() {
    // 执行需要刷新的逻辑，例如重新加载数据
    // 重新加载数据的代码示例：
    this.getRooms();
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
    clearInterval(this.timer);
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