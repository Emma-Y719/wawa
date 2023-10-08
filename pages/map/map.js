// pages/search/map.js.js
// 获取应用实例
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil

}from '../../utils/requestUtil.js';
const app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    university:"",
    campus:"",
    type:"",
    detailInfo: '', // 用于存储详情内容的数据
    addmissage: '选的位置',
    // markers	 Array	标记点
    stitle:'故宫',
    latitude: "",
    longitude: "",
    scale: 14,
    markers: [
    ],
    //controls控件 是左下角圆圈小图标,用户无论放大多少,点这里可以立刻回到当前定位(控件（更新一下,即将废弃，建议使用 cover-view 代替）)
    controls: [{
      id: 1,
      position: {
        left: 15,
        top: 260 - 50,
        width: 40,
        height: 40
      },
      clickable: true
    }],

    cards: [
      {
        dataInfo:20
      }
      // 这里填充卡片的数据
    ],
    current: 0, // 当前显示的卡片索引
    duration: 500, // 切换卡片的动画时长
    cardHeight: 300, // 卡片的高度
    cardWidth:300,
    scrollLeft: 0, // scroll-view 组件的 scroll-left 属性，用于控制滚动位置
    distanceArr: []
  },
  ontypeInput(e){
    this.setData({
      type:e.detail.value
    })
    console.log(e.detail)
    console.log(this.data.type)
    this.searchProductList()

  },
  async searchProductList(e){
    console.log("indices: "+this.data.uid+" , "+this.data.cid+" "+this.data.type);
    requestUtil({url:'/product/searchMulti',method:"GET",data:{university:this.data.uid,campus:this.data.cid,type:this.data.type}}).then(result=>{
      console.log("lists",result.message);
      this.setData({
        productList:result.message
      })
      let list=this.data.productList
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
          width: 40,  
          height: 40,
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
      this.addMarker();
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



  navigateBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onScrollViewScroll(event) {

    const scrollLeft = event.detail.scrollLeft;
    const cardWidth = this.data.cardWidth; // 获取卡片的宽度，可以通过 setData 更新该值
    const current = Math.round(scrollLeft / cardWidth); // 计算当前滚动到了哪个卡片

    if (this.data.current !== current) {
      this.setData({
        current: current,
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const baseUrl=getBaseUrl();
    this.setData({
      baseUrl

    });
    if(options.uid!=undefined){
      console.log(options)
      let uindex=parseInt(options.uid)
      let cindex=parseInt(options.cid)
      let t=''
      if(options.type!=undefined){
        t=options.type
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
        campus:c,
      })
    }else{
      this.setData({
        type:app.globalData.type,
        uid:app.globalData.user.uid,
        cid:app.globalData.user.cid,
        university:app.globalData.user.university,
        campus:app.globalData.user.campus
      })
    }
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'W57BZ-JDB6X-XPA4H-Z76MI-73FF2-24BT4'
    });
    this.mapCtx = wx.createMapContext('myMap')
    var that = this
    //获取当前的地理位置、速度
    requestUtil({url:"/campus/findId",method:"GET",data:{cid:app.globalData.user.cid}}).then(res=>{
      let latitude=res.message.latitude
      let longitude=res.message.longitude
      this.setData({
        latitude:latitude,
        logitude:longitude
      })
    })
    


  },
  addMarker: function() {
    // 在地图上添加标记
    console.log("adding markers******")
    console.log(this.mapCtx)
    this.mapCtx.addMarkers({
      markers: this.data.markers,
      success: function(res) {
        console.log('添加标记成功', res);
      },
      fail: function(res) {
        console.log('添加标记失败', res);
      }
    });
  },

  onTapSeek(){
    wx.redirectTo({
      url: '/pages/map/item',
    })
  },
  onTapProduct(){

  },
  onTapPost(){

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
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    let prevPage = pages[pages.length - 2]; 
    console.log(prevPage.data.productList)
    var list=prevPage.data.productList;
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
        width: 40,  
        height: 40,
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
    //this.addMarker();

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },
  onMarkerTap(e) {
    var markerId = e.markerId;
    var detailInfo = this.data.markers[markerId].detailInfo;

    // 更新详情内容到页面数据
    this.setData({
      detailInfo: detailInfo
    });
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