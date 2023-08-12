// pages/storage/index.js
//导入request请求工具类
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()
wx.cloud.init();
const db=wx.cloud.database()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    university:"",
    campus:"",
    uid:-1,
    cid:-1,
    type:"",
    storageList:[],
    searchStorageList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  // // 在页面中定义插屏广告
  // let interstitialAd = null

  // // 在页面onLoad回调事件中创建插屏广告实例
  // if (wx.createInterstitialAd) {
  //   interstitialAd = wx.createInterstitialAd({
  //     adUnitId: 'adunit-9ad07a2514baead3'
  //   })
  //   interstitialAd.onLoad(() => {})
  //   interstitialAd.onError((err) => {})
  //   interstitialAd.onClose(() => {})
  // }

  // // 在适合的场景显示插屏广告
  // if (interstitialAd) {
  //   interstitialAd.show().catch((err) => {
  //     console.error(err)
  //   })
  // }

// 在页面中定义激励视频广告
// let videoAd = null

// // 在页面onLoad回调事件中创建激励视频广告实例
// if (wx.createRewardedVideoAd) {
//   videoAd = wx.createRewardedVideoAd({
//     adUnitId: 'adunit-55f03eb6d9c98f2c'
//   })
//   videoAd.onLoad(() => {})
//   videoAd.onError((err) => {})
//   videoAd.onClose((res) => {})
// }

// // 用户触发广告后，显示激励视频广告
// if (videoAd) {
//   videoAd.show().catch(() => {
//     // 失败重试
//     videoAd.load()
//       .then(() => videoAd.show())
//       .catch(err => {
//         console.log('激励视频 广告显示失败')
//       })
//   })
// }
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    });



    this.setData({
      university:app.globalData.userInfo.university,
      campus:app.globalData.userInfo.campus,
      uid:app.globalData.user.uid,
      cid:app.globalData.user.cid,
    })
    this.searchStorageList();
    this.searchMulti()
  },
  async searchStorageList(e){
    console.log(app.globalData.user.storage)
    if(app.globalData.user.storage[0]==null){
      this.setData({
        storageList:[]
      })
    }else{
      this.setData({
        storageList:app.globalData.user.storage
      })
    }

    // wx.cloud.callFunction({
    //   name: 'yunrouter',
    //   data: {
    //     $url: "HuoquFriends", //云函数路由参数
    //     openid: app.globalData.openid
    //   },
      
    //   success: res2 => {
    //     let that=this;
    //     console.log("res2:   ",res2.result.data[0].storage)
    //     if(res2.result!=null){
    //       var storages=res2.result.data[0].storage
    //       console.log(storages.length)
          
    //       if(storages!=undefined){
    //         var storageList=[]
    //         storages.forEach(function(value,index,array){
    //           requestUtil({url:'/storage/findById',method:"GET",data:{id:value.identity}}).then(result=>{
    //             storageList.push(result.message[0])
    //             that.setData({
    //               storageList:storageList
    //             })
    //           })
              
    //         })

    //       }else{
    //         console.log("清空ta！")
    //         that.setData({
    //           storageList:[]
    //         })
    //       }
    //       if(storages.length==0){
    //         that.setData({
    //           storageList:[]
    //         })
    //       }
    //     }
    //   },
    //   fail() {
    //   }
    // });
  },
  ontypeInput(e){
    this.setData({
      type:e.detail.value
    })
    console.log(e.detail)
    console.log(this.data.type)
    this.searchMulti()
  },
  async searchMulti(e){
    var searchUniversityIndex=app.globalData.searchUniversityIndex;
    var searchCampusIndex=app.globalData.searchCampusIndex;
    console.log("indices: "+this.data.uid+" , "+this.data.cid);
    requestUtil({url:'/storage/searchMulti',method:"GET",data:{university:this.data.uid,campus:this.data.cid,type:this.data.type}}).then(result=>{
      console.log("lists multi",result.message);
      this.setData({
        searchStorageList:result.message
      })
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
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },

  handleCreate(e){
    wx.redirectTo({
      url: '/pages/storage/create/info/index',
    })
  }
  ,
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log("university: ",this.data.university)
    this.searchStorageList();
    this.searchMulti();
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

  }
})