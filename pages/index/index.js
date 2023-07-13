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
wx.cloud.init();
const db=wx.cloud.database()
Page({
  data: {
    swiperList:[],
    baseUrl:'',
    bigTypeList:[],
    bigTypeList_row1:[],
    bigTypeList_row2:[],
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
    scale:9,
    uid:-1,
    cid:-1,
    markers: [
    ],
    isDefault:true
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
      
      console.log("this!")
       wx.showModal({
        title:'友情提示',
        content:'微信授权登录后，才可进入',
        success:(res)=>{
          wx.login({
            success: function(res) {
              if (res.code) {
                // 登录成功，获取到用户的登录凭证 code
                var code = res.code;
                requestUtil({url:"/user/login",method:"GET",data:{code:code}}).then(res=>{
                  console.log(res.token.openid)
                  requestUtil({url:"/user/findid",method:"GET",data:{id:res.token.openid}}).then(res=>{
                    if(res.message.length==0){
                      console.log("尚未注册！")
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
                      //that.getcampusLoc();
                      console.log("component ready!")
                      that.triggerEvent('componentReady');
                      that.watchInfo();
                      app.globalData.user["online"]=true
                      requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
                        console.log(res)
                      })
                    }
                  })
                })
                
              }
            }
          })
          // wx.cloud.callFunction({
          //   name: 'yunrouter', // 对应云函数名
          //   data: {
          //     $url: "openid", //云函数路由参数
          //   },
          //   success: re => {
          //     console.log("user:"+re.result)
          //     app.globalData.openid=re.result
          //     db.collection('user').where({
          //       _openid: re.result
          //     }).get({
          //       success: function (res) {
          //         console.log(res.data[0])
          //         if(res.data[0]==undefined){
          //           console.log("尚未注册！")
          //           wx.redirectTo({
          //             url: '/pages/my/create/login',
          //           })
          //         }else{
          //           app.globalData.openid= res.data[0]._openid;
          //           app.globalData.userInfo = res.data[0].userInfo;
          //           app.globalData.friends=res.data[0].friends;
          //           app.globalData.user=res.data[0];
          //           app.globalData.isLogin=true;
          //           console.log("data user:",res.data[0])
          //           that.setData({
          //             uid:res.data[0].uid,
          //             cid:res.data[0].cid,
          //             locuni:res.data[0].userInfo.university,
          //             loccam:res.data[0].userInfo.campus
          //           })
          //           that.getcampusLoc();
          //           db.collection('user').where({
          //             _openid:this.globalData.user._openid
          //           }).update({
          //             data: {
          //               online: true,
          //             }
          //           })
          //         }
          //       },
          //     })
          //   }
          // })
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
    const component = this.selectComponent('#custom-tabbar');
    // component.on('componentReady', this.loadData);
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
  this.getWLogin();
  //console.log("here!",app.globalData)
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
  console.log(this.loc);
},

  async searchSwiper(e){
    await requestUtil({url:'/product/findSwiper',method:"GET"}).then(result=>{
      console.log("swiper",result)
      // console.log("campuses",app.globalData.campuses)
 
        this.setData({
          swiperList:result.message,
          storageList:app.globalData.storageList,
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
    })
  },
  async getBigTypeList(){
    const result =await requestUtil({
      url:'/bigType/findAll',
      method:"GET"
    });
    console.log("bigType: "+result)
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

    await requestUtil({url:'/product/searchMulti',method:"GET",data:{p:0,university:-1,campus:-1,type:''}}).then(result=>{
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
