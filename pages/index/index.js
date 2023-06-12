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
    productList:[],
    loc:"",
    type:"山地",
    campus:"东南大学-四牌楼校区",

    latitude: "",
    longitude: "",
    scale:9,
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


handlelogin(){
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
},
async getUserProfile(e) {
  const res = await wx.getUserProfile({
    desc: '用于完善会员资料',
  });
  console.log("获取的信息："+res);
},

  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl
    });
    console.log(baseUrl);
    wx.cloud.callFunction({
      name: 'yunrouter', // 对应云函数名
      data: {
        $url: "openid", //云函数路由参数
      },
      success: re => {
        console.log("user:"+re.result)
        app.globalData.openid=re.result
        db.collection('user').where({
          _openid: re.result
        }).get({
          success: function (res) {
            if(res.data[0]==undefined){
              console.log("尚未注册！")
              wx.redirectTo({
                url: '/pages/my/create/login',
              })
            }else{
              console.log("data :",res.data[0].userInfo)
              app.globalData.openid= res.data[0]._openid;
              app.globalData.userInfo = res.data[0].userInfo;
              app.globalData.user=res.data[0];
              app.globalData.friends=res.data[0].friends;
              app.globalData.data=res.data[0]
              console.log(app.globalData)
            }

          },
        })
      }
    })
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

    this.searchSwiper();
    this.getBigTypeList();
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
    this.searchProductList();
    
  },
  async searchProductList(e){

    await requestUtil({url:'/product/searchMulti',method:"GET",data:{university:-1,campus:-1,type:''}}).then(result=>{
      console.log("lists",result.message);
      this.setData({
        productList:result.message
      })
      console.log("product: ",this.data.productList)
    var list=this.data.productList;
    var marks=[]
    let that=this;
    list.forEach(function(value,index,array){
      let imgurl=''
      if(value.propic.pics[0][0]!='h'&&value.propic.pics[0][0]!='c'){
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
