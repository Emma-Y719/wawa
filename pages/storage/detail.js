// pages/search/index.js
//导入request请求工具类
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()
wx.cloud.init()
const db=wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indices:[],
    university:"",
    name:"",
    campus:"",
    type:"",
    baseUrl:'',
    id:-1,
    productList:[],
    floatButtonVisible: false,
    left: 0, // 悬浮窗左侧距离
    top: 0, // 悬浮窗顶部距离
    startX: 0, // 手指起始X坐标
    startY: 0, // 手指起始Y坐标
    pic:"",
    addValue:"加入",
    isAdd:false,
    storageObj:{}
  },
  onFloatButtonTap() {
    wx.navigateTo({
      url: '/pages/search/map'
    });
  },
   // 悬浮窗触摸开始事件
   onTouchStart: function (e) {
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    });
  },

  // 悬浮窗触摸移动事件
  onTouchMove: function (e) {
    let offsetX = e.touches[0].clientX - this.data.startX;
    let offsetY = e.touches[0].clientY - this.data.startY;
    this.setData({
      left: this.data.left + offsetX,
      top: this.data.top + offsetY,
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
    if(options!=null){
      console.log(options)
      let intid=parseInt(options.id)
       requestUtil({url:"/storage/findById",method:"GET",data:{id:intid}}).then(result=>{
        console.log(result.message[0].campus)
        this.setData({
          id:intid,
          university:app.globalData.campuses[result.message[0].campus].name,
          campus:app.globalData.campuses[result.message[0].campus].campus,
          name:result.message[0].name,
          pic:result.message[0].pic,
          storageObj:result.message[0]
        })
                                                                                                // requestUtil({url:"/user/find"})
                                                                                                //app.globalData.user.storage.splice(0,1)
                                                                                                 //requestUtil({url:"/user/update",method:"POST",data:app.globalData.user})                                                                                 
        let index=app.globalData.user.storage.findIndex(v=>v.identity==this.data.id)
          console.log(index)
          if(index!=-1){
            this.setData({
              isAdd:true,
              addValue:"已加入"
            })
        }                                                                                 
        // wx.cloud.callFunction({
        //   name: 'yunrouter',
        //   data: {
        //     $url: "huoquUserinfo", //云函数路由参数
        //     openid: app.globalData.openid
        //   },
        //   success: res2 => {
        //     console.log(res2)
        //     let storages=res2.result.data[0].storage
        //     console.log(storages)
        //     if(storages!=undefined){
        //       let index=storages.findIndex(v=>v.identity==this.data.id)
        //       console.log(index)
        //       if(index!=-1){
        //         this.setData({
        //           isAdd:true,
        //           addValue:"已加入"
        //         })
        //       }
        //     }

        //   },
        //   fail() {
        //   }
        // });
        this.searchProductList();
      })
    }
  },
  handleAdd(e){
    if(!this.data.isAdd){
      app.globalData.user.storage.push(this.data.storageObj)
      requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
        if (res){
          this.setData({
            addValue:"已加入",
            isAdd:true
          })
        }
      })
      // db.collection('user').where({
      //   _openid: app.globalData.openid
      // }).update({
      //   data: {
      //     storage: db.command.push([this.data.storageObj])
      //   }
      // })
      
      // wx.cloud.callFunction({
      //   name: 'yunrouter',
      //   data: {
      //     $url: "huoquUserinfo", //云函数路由参数
      //     openid: app.globalData.openid
      //   },
      //   success: res2 => {
      //     this.setData({
      //       addValue:"已加入",
      //       isAdd:true
      //     })
      //   },
      //   fail() {
      //   }
      // });
    }else{
      wx.showModal({
        title: '',
        content: '确认退出物品库？',
        complete: (res) => {
          if (res.cancel) {
            
          }
      
          if (res.confirm) {

            let that=this;
            var newSto = app.globalData.user.storage.filter(function(element) {
              return element.identity != that.data.id&&element!=null; // 返回 true 以保留元素，返回 false 以删除元素
            });
            console.log(newSto);
            app.globalData.user.storage=newSto
            requestUtil({url:"/user/update",method:"POST",data:app.globalData.user}).then(res=>{
              if(res){
                console.log(res)
                this.setData({
                  isAdd:false,
                  addValue:"加入"
                })
              }
            })
            // db.collection('user').where({
            //   _openid: app.globalData.openid
            // }).update({
            //   data: {
            //     storage: db.command.pull({identity:this.data.storageObj.identity})
            //   }
            // }).then(res=>{
            //   console.log(res)
            //   this.setData({
            //     isAdd:false,
            //     addValue:"加入"
            //   })


            // })
          }
        }
      })
    }
  },


  navigateBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },
  onNotComplete(){
    wx.showToast({
      title: '正在开发中，仅作展示',
      icon: 'none',
    })
  },
  onMarkerTap(e) {
    var markerId = e.markerId;
    var detailInfo = this.data.markers[markerId].detailInfo;

    // 更新详情内容到页面数据
    this.setData({
      detailInfo: detailInfo
    });
  },
  async searchProductList(e){
    console.log("id: ",this.data.id);
    requestUtil({url:'/storage/searchMultiProduct',method:"GET",data:{id:this.data.id,type:this.data.type}}).then(result=>{
      console.log("lists",result);
      this.setData({
        productList:result.message
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
  ontypeInput(e){
    this.setData({
      type:e.detail.value
    })
    console.log(e.detail)
    console.log(this.data.type)
    this.searchProductList()
  },

  //controls控件的点击事件
  bindcontroltap(e) {
    var that = this;
    if (e.controlId == 1) {
      that.setData({
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        scale: 14,
      })
    }
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
  onShareAppMessage: function () {
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
      title: nickName+"分享了"+this.data.name,
      imageUrl: ''
    }



  },

  grid(imgList){
    // 获取待生成九宫格图片的数据，这里假设有一个数组imgList包含九个图片的URL
    // 获取Canvas上下文
    const ctx = wx.createCanvasContext('gridCanvas');

    // 在每个九宫格单元格中绘制图片
    var cellWidth = 100; // 单元格宽度
    var cellHeight = 100; // 单元格高度
    imgList.forEach(function(imgSrc, index) {
      var x = (index % 3) * cellWidth;
      var y = Math.floor(index / 3) * cellHeight;
      ctx.drawImage(imgSrc, x, y, cellWidth, cellHeight);
    });

    // 绘制完成后调用canvasToTempFilePath方法将Canvas内容转换为临时文件路径
    ctx.draw(false, function() {
      wx.canvasToTempFilePath({
        canvasId: 'gridCanvas',
        success: function(res) {
          var tempFilePath = res.tempFilePath;
          console.log("tempFilePath: ",tempFilePath)
          // 调用分享API分享图片到朋友圈
          this.shareToTimeline(tempFilePath);
        },
        fail: function(res) {
          console.log('canvasToTempFilePath failed:', res);
        }
      });
});

// 分享到朋友圈

  },
 shareToTimeline(imageUrl) {
    wx.showLoading({
      title: '生成中...',
      mask: true
    });
  
    // 调用分享API
    wx.updateTimelineShareData({
      title: '九宫格图片分享', // 分享标题
      query: '', // 分享链接中的参数
      imageUrl: imageUrl, // 分享图标
      success: function(res) {
        console.log('分享成功', res);
        wx.hideLoading();
      },
      fail: function(res) {
        console.log('分享失败', res);
        wx.hideLoading();
      }
    });
  }
  


})