// pages/index/index.js
//导入request请求工具类
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil

}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()

Page({
  data: {
    swiperList:[],
    baseUrl:'',
    bigTypeList:[],
    bigTypeList_row1:[],
    bigTypeList_row2:[],
    hotProductList:[],
    loc:"",
    type:"山地",
    campus:"东南大学-四牌楼校区",

    latitude: "",
    longitude: "",
    scale:8,
    markers: [
    ],
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
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





  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    });
    console.log(baseUrl);

    var that=this;
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        console.log('location:  ',res.latitude,res.longitude);
        //赋值经纬度
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
        })
      }
    })
    const token=wx.getStorageSync('token');
    if(!app.globalData.isLogin){
      wx.showModal({
        title:'友情提示',
        content:'微信授权登录后，才可进入个人中心',
        success:(res)=>{
          Promise.all([getWxLogin(),getUserProfile()]).then((res)=>{
            console.log(res[0].code);
            console.log(res[1].userInfo.nickName,res[1].userInfo.avatarUrl)
            let loginParam={
              code:res[0].code,
              nickName:res[1].userInfo.nickName,
              avatarUrl:res[1].userInfo.avatarUrl
            }
            console.log(loginParam)
            wx.setStorageSync('userInfo', res[1].userInfo);
            this.wxlogin(loginParam);
            app.globalData.userInfo=res[1].userInfo
            app.globalData.isLogin=true;
            wx.cloud.callFunction({
              name: 'yunrouter', // 对应云函数名
              data: {
                $url: "openid", //云函数路由参数
              },
              success: re => {
                console.log("user:"+re.result)
                db.collection('user').where({
                  _openid: re.result
                }).get({
                  success: function (res) {
                    if(res.data[0]==undefined){
                      console.log("尚未注册！")
                      wx.cloud.callFunction({
                        name: 'yunrouter',
                        data: {
                          $url: "login", //云函数路由参数
                          phone: "",
                          campus:"",
                          qqnum: "",
                          email: "",
                          wxnum: "",
                          stamp: new Date(),
                          userInfo: app.globalData.userInfo,
                          nickName:app.globalData.userInfo.nickName,
                          money: 0,
                          dba: 0,
                        },
                        success: res => {
                          console.log("login:  ",res)
                          db.collection('user').where({
                            _openid: re.result
                          }).get({
                            success: function (res) {
                              app.globalData.openid= res.data[0]._openid;
                              app.globalData.userInfo = res.data[0].userInfo;
                              app.globalData.friends=res.data[0].friends;
                              app.globalData.data=res.data[0]
                              console.log(that.globalData)
                            }
        
                          })
                        },
                        fail() {
                          wx.hideLoading();
                          wx.showToast({
                            title: '注册失败，请重新提交',
                            icon: 'none',
                          })
                        }
                      });
                    }else{
                      app.globalData.openid= res.data[0]._openid;
                      app.globalData.userInfo = res.data[0].userInfo;
                      app.globalData.friends=res.data[0].friends;
                      app.globalData.data=res.data[0]
                      console.log(that.globalData)
                    }
        
                  },
                })
              }
            })
          })
        }
      })
    }else{
      console.log("token存在："+token);
      const userInfo=wx.getStorageSync('userInfo')
      this.setData({
        userInfo
      })
    }
    this.searchSwiper();
    this.getBigTypeList();
    this.getHotProductList();
    this.setData({
      loc:app.globalData.location
    })
    console.log(this.loc);
    wx.cloud.init();
    const db=wx.cloud.database()




    // wx.request({
    //   url: 'http://localhost:8080/campus/add',
    //   method:"POST",
    //   data: {
    //     identity: 97,
    //     name: "xxxxx",
    //     image: "xxxxx",
    //   },
    //   success: function (res) {
    //     console.log(res);
    //   }
    // })
  },
  async searchSwiper(e){
    // wx.request({
    //   url: 'http://localhost:8080/product/findSwipers',
    //   method:"GET",
    //   success:(result)=>{
    //     console.log(result);
    //     console.log(result);
    //     for(var i=0;i<result.message.length;i++){
    //       var s=result.message[i];
    //       console.log(s.proPic);
    //     }
        
    //     this.setData({
    //       swiperList:result.message
    //     })
    //   }
    // }) 

    requestUtil({url:'/product/findSwiper',method:"GET"}).then(result=>{
      console.log("swiper",result)
      this.setData({
        swiperList:result.message
      })
    })
    // const result=await requestUtil({url:'/product/findSwiper',method:"GET"});
    // this.setData({
    //   swiperList:result.message
    // })
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
    })
  },
  async getBigTypeList(){
    const result =await requestUtil({
      url:'/bigType/findAll',
      method:"GET"
    });
    console.log(result)
    const bigTypeList=result.message;
    const bigTypeList_row1=bigTypeList.filter((item,index)=>{
      return index<5;
    })
    const bigTypeList_row2=bigTypeList.filter((item,index)=>{
      return index>=5;
    })
    this.setData({
      bigTypeList,
      bigTypeList_row1,
      bigTypeList_row2,
    })
    console.log(bigTypeList_row1)
  },
  onInput:function(e){
    console.log(e.detail.value);
    this.setData({
      type:e.detail.value
    })
    console.log(this.data.type)
  },
  handleSearch(e){
    console.log("datatype: ",this.data.type)
    app.globalData.type=this.data.type;
    console.log(app.globalData.type);
  },
  //点击跳转商品分类页面
  handleTypeJump(e){
    console.log(e);
    const {index}=e.currentTarget.dataset;
    console.log("index: "+index)
    app.globalData.index=index;
    wx.navigateTo({
      url: '/pages/category/index',
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
    const app=getApp();
    const {location}=app.globalData
    console.log("location: "+location)
    if(location!="南京"){//首页跳转而来
      this.getCampusesFromLoc(location);
    }
    console.log(app.globalData)

  },

  async getCampusesFromLoc(location){
    this.setData({
      loc:location
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
