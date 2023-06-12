// pages/promote/index.js
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
var QQMapWX = require('../../utils/qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js');
var qqmapsdk;
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    university:'',
    campus:'',
    uid:-1,
    cid:-1,
    name:'输入商品名称，例：凤凰',
    discript:"输入商品描述：品牌，渠道等",
    activeNameInput:false,
    activeDisInput:false,
    loc:"请选择您的商品地址：",
    pics:[],
    type:"点选类型",
    typeid:"",
    price:"键入商品价格",
    storage:"选取群物品库",
    storageid:0,
    storageList:[],
    log:-1.0,
    lat:-1.0,
    inputValue: '',// 用于保存用户输入的数字值

    currentRegion: {
      province: '选择城市',
      city: '选择城市',
      district: '选择城市',
    },
    defaultKeyword: '学校',
    keyword: '',
    centerData: {},
    nearList: [],
    suggestion: [],
    selectedId: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    console.log("Load:   ",app.globalData.user)

    this.setData({
      university:app.globalData.user.university,
      campus:app.globalData.user.campus
    })

    if(options!=undefined){
      const {storage}=options;
      console.log("storage"+storage)
      if(storage!=undefined){
        this.setData({
          storage:storage
        })
      }
    }




    qqmapsdk = new QQMapWX({
      key: 'W57BZ-JDB6X-XPA4H-Z76MI-73FF2-24BT4'
    });
    var self=this;
    //定位
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy:true,
      success(res) {
        //console.log(res)
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy
        console.log("userlat:",latitude,"userlon:",longitude)

        //逆地址解析

          qqmapsdk.reverseGeocoder({
            // 调用接口
            location: {
              latitude: latitude,
              longitude: longitude,
            },
            get_poi: 1,
            poi_options: 'policy=2;radius=3000;page_size=20;page_index=1;keyword='+encodeURIComponent(self.data.defaultKeyword),
            success: function (res) { //搜索成功后的回调
              console.log("data: "+res.result.pois[0].title)
              var sug = [];
              for (var i = 0; i < res.result.pois.length; i++) {
                sug.push({ // 获取返回结果，放到sug数组中
                  title: res.result.pois[i].title,
                  id: res.result.pois[i].id,
                  addr: res.result.pois[i].address,
                  city: res.result.pois[i].city,
                  district: res.result.pois[i].district,
                  latitude: res.result.pois[i].location.lat,
                  longitude: res.result.pois[i].location.lng,
                });
              }
              
              self.setData({
                selectedId: 0,
                loc: sug[0].title,
                nearList: sug, 
                suggestion: sug
              })
            },
            fail: function (res) {
              //console.log(res);
            },
            complete: function (res) {
              console.log(res);
            }
            });
    
      },
      fail(err) {
        //console.log(err)
        wx.hideLoading({});
        wx.showToast({
          title: '定位失败',
          icon: 'none',
          duration: 1500
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
    this.searchStorageList();
  },
  async searchStorageList(e){
    requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
      var sall=result.message
      console.log(sall)
      wx.cloud.callFunction({
        name: 'yunrouter',
        data: {
          $url: "HuoquFriends", //云函数路由参数
          openid: app.globalData.openid
        },
        success: res2 => {
          console.log(sall)
          var storages=res2.result.data[0].storage
          var storageList=[]
          storages.forEach(function(value,index,array){
            storageList.push(sall[value-1])
          })
          this.setData({
            storageList:storageList
          })
        },
        fail() {
        }
      });
  
    })


  },
  async handleUpload(){
    var pictures=[];
    for(let i=0; i<this.data.pics.length; i++ ){
      //图片上传云服务
      try {
        const fileID = await this.uploadFileToCloud(this.data.pics[i]);
        pictures.push(fileID);
      } catch (error) {
        console.log('上传图片失败', error);
      }
    }
    console.log(pictures)
    let datacount=0;
    requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
      console.log("findAll",result.message[result.message.length-1].identity)
      datacount=result.message[result.message.length-1].identity+1;
      console.log("this index",datacount)
      requestUtil({
        url:"/product/add",
        method:"POST",
        data:{
          identity: datacount,
          name: this.data.name,
          price: this.data.price,
          propic: {"pics":pictures},
          ishot:0,
          isswiper:0,
          typeid:this.data.typeid,
          description:this.data.discript,
          university:this.data.uid,
          campus:this.data.cid,
          longtitude:this.data.log,
          latitude:this.data.lat,
          userid:app.globalData.openid,
          status:0,
          storage:this.data.storageid
        }
      }).then(result=>{
          if(result){
            wx.showModal({
              title: '',
              content: '创建成功！',
              complete: (res) => {
                if (res.cancel) {
                  wx.navigateTo({
                    url: '/pages/my/index',
                  })
                }
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/my/index',
                  })
                }
              }
            })
          }else{

          }
          console.log(result)
      })
      // wx.request({
      //   url: baseUrl+'/product/add',
      //   method:"POST",
      //   data: {
      //     identity: datacount,
      //     name: this.data.name,
      //     price: this.data.price,
      //     propic: {"pics":pictures},
      //     ishot:0,
      //     isswiper:0,
      //     typeid:this.data.typeid,
      //     description:this.data.discript,
      //     university:this.data.uid,
      //     campus:this.data.cid,
      //     longtitude:this.data.log,
      //     latitude:this.data.lat,
      //     userid:app.globalData.openid,
      //     status:0,
      //     storage:this.data.storageid
      //   },
      //   success: function (res) {
      //     console.log(res);

      //   }
      // })
    })
  },
  async handleDraft(){
    
    let discript=this.data.discript
    let loc=this.data.loc
    let price=this.data.price
    let storage=this.data.storageid
    let typeid=this.data.typeid
    let name=this.data.name

    if(this.data.type=='点选类型'||this.data.type==''){
      typeid=0
    }
    if(this.data.name=='输入商品名称，例：凤凰'||this.data.name==''){
      name=""
    }
    if(this.data.discript=="输入商品描述：品牌，渠道等"||this.data.discript==""){
      discript=""
    }
    if(this.data.price=='键入商品价格'||this.data.price==''){
      price=-1
    }
    if(this.data.storage=='选取群物品库'||this.data.method==''){
      storage=0
    }

    console.log(this.data.name)

    console.log(loc)
    console.log(price)
    console.log(storage)
    console.log("开始上传")
    var pictures=[];
    for(let i=0; i<this.data.pics.length; i++ ){
      //图片上传云服务
      try {
        const fileID = await this.uploadFileToCloud(this.data.pics[i]);
        pictures.push(fileID);
      } catch (error) {
        console.log('上传图片失败', error);
      }
    }
    console.log(pictures)
    requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
      console.log("findAll",result.message[result.message.length-1].identity)
      let datacount=result.message[result.message.length-1].identity+1;
      console.log("this index",datacount)
      requestUtil({
        url:"/product/add",
        method:"POST",
        data:{
          identity: datacount,
          name: this.data.name,
          price: price,
          propic: {"pics":pictures},
          ishot:0,
          isswiper:0,
          typeid:typeid,
          description:this.data.discript,
          university:this.data.uid,
          campus:this.data.cid,
          longtitude:this.data.log,
          latitude:this.data.lat,
          userid:app.globalData.openid,
          status:1,
          storage:storage
        }
      }).then(result=>{
          if(result){
            wx.showModal({
              title: '',
              content: '保存成功！进入主页查看',
              complete: (res) => {
                if (res.cancel) {
                }
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/my/index',
                  })
                }
              }
            })
          }else{

          }
          console.log(result)
      })
      // wx.request({
      //   url: baseUrl+'/product/add',
      //   method:"POST",
      //   data: {
      //     identity: datacount,
      //     name: this.data.name,
      //     price: this.data.price,
      //     propic: {"pics":pictures},
      //     ishot:0,
      //     isswiper:0,
      //     typeid:this.data.typeid,
      //     description:this.data.discript,
      //     university:this.data.uid,
      //     campus:this.data.cid,
      //     longtitude:this.data.log,
      //     latitude:this.data.lat,
      //     userid:app.globalData.openid,
      //     status:0,
      //     storage:this.data.storageid
      //   },
      //   success: function (res) {
      //     console.log(res);

      //   }
      // })
    })
  },
  uploadFileToCloud(filePath){
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: Date.parse(new Date()) + '.png',
        filePath: filePath,
        success: res => {
          console.log('上传云', res)
          console.log(res.fileID)
          resolve(res.fileID);
        },
        fail: err => {
          console.log('上传云err', err)
          reject(err);
        }
      });
    });
  },
  
  onPromote: function(){
    var baseUrl=getBaseUrl()
    console.log("university: "+this.data.university)
    console.log(this.data.campus)
    console.log(this.data.discript)
    console.log(this.data.pics)
    console.log(this.data.loc)
    console.log(this.data.price)
    console.log(this.data.method)
    if(this.data.university==''){
      wx.showToast({
        title: '请选择学校校区',
        icon: 'none',
        duration: 2000
      });
    }    else if(this.data.type=='点选类型'||this.data.type==''){
      wx.showToast({
        title: '请选择物品类型',
        icon: 'none',
        duration: 2000
      });
    }
    else if(this.data.name=='输入商品名称，例：凤凰'||this.data.name==''||this.data.discript=="输入商品描述：品牌，渠道等"||this.data.discript==""){
      wx.showToast({
        title: '请输入商品名称/描述',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.price=='键入商品价格'||this.data.price==''){
      wx.showToast({
        title: '请输入商品价格',
        icon: 'none',
        duration: 2000
      });
    }else{
      this.handleUpload();
    }
  },




  onDraft:function(){
   
    var pictures=this.data.pics;
    this.handleDraft();
    // requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
    //   console.log("findAll",result.message[result.message.length-1].identity)
    //   datacount=result.message[result.message.length-1].identity+1;
    //   console.log("this index",datacount)
      
    //   for(let i=0; i<this.data.pics.length; i++ ){
    //     //图片上传云服务
    //     wx.cloud.uploadFile({
    //       cloudPath:Date.parse(new Date())+i+'.png',//图片上传时名字会覆盖，所以这边用时间戳和索引值拼的
    //       //cloudPath:'uploadimage/'+Date.parse(new Date())+index+'.png',//前面加上 文件夹名字/test.png 图片就会上传到指定的文件夹下，否则按上面的会传到根目录下
    //       filePath:this.data.pics[i], // 文件路径
    //       success: res => {
    //         console.log('上传云',res)
    //         console.log(res.fileID)
    //         pictures[i]=res.fileID
    //       },
    //       fail: err => {
    //         console.log('上传云err',err)
    //       // handle error
    //       }
    //     })
    //     //这个可以页面展示或者传给自己接口的后台如果要base64的话 转成base64 可以不加
    //     //_t.zhuanImage(res.tempFilePaths[i],i)
    //   }
    //   console.log(pictures)
    //   wx.request({
    //     url: baseUrl+'/product/add',
    //     method:"POST",
    //     data: {
    //       identity: datacount,
    //       name: this.data.name,
    //       price: price,
    //       propic: {"pics":this.data.pics},
    //       ishot:0,
    //       isswiper:0,
    //       typeid:typeid,
    //       description:this.data.discript,
    //       university:this.data.uid,
    //       campus:this.data.cid,
    //       longtitude:this.data.log,
    //       latitude:this.data.lat,
    //       userid:app.globalData.openid,
    //       status:1,
    //       storage:storage
    //     },
    //     success: function (res) {
    //       console.log(res);
    //       wx.showModal({
    //         title: '',
    //         content: '保存草稿成功,进入主页查看',
    //         complete: (res) => {
    //           if (res.cancel) {
    //           }
    //           if (res.confirm) {
    //             wx.navigateTo({
    //               url: '/pages/my/index',
    //             })
    //           }
    //         }
    //       })
    //     }
    //   })
    // })
  },
  handleType(){


    requestUtil({url:'/bigType/findAll',method:"GET"}).then(result=>{
      let list=result.message
      console.log(list)
      let typeList=[]
      list.forEach(function(value,index,array){
        typeList.push(value.name)
      })
      var that = this; // 保存页面上下文
      wx.showActionSheet({
        itemList: typeList,
        success: function (res) {
          // 用户点击了选项后的回调函数
          console.log('用户点击了第' + (res.tapIndex + 1) + '个选项');
          // 这里可以根据用户选择的选项执行相应的业务逻辑
          result=typeList[res.tapIndex]
          that.setData({
            type:result,
            typeid:res.tapIndex+1
          })
          console.log(result+that.data.typeid)
        },
        fail: function (res) {
          console.log(res.errMsg)
        }
      })
    })


  },

  showActionSheet: function () {
    console.log(this)
    let result="";
    let list=this.data.storageList;
    console.log(list)
    let strList=[]
    list.forEach(function(value,index,array){
      strList.push(value.name)
    })
    var that = this; // 保存页面上下文
    wx.showActionSheet({
      itemList: strList,
      success: function (res) {
        // 用户点击了选项后的回调函数
        console.log('用户点击了第' + (res.tapIndex + 1) + '个选项');
        // 这里可以根据用户选择的选项执行相应的业务逻辑
        result=strList[res.tapIndex]
        that.setData({
          storage:result,
          storageid:list[res.tapIndex].identity
        })
        console.log(result)
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  }, 
  onDisInput: function(e){
    console.log(e.detail.value);
    this.setData({
      discript:e.detail.value
    })
    console.log(this.data.discript)
  },
  onNameInput: function(e){
    console.log(e.detail.value);
    this.setData({
      name:e.detail.value
    })
    console.log(this.data.name)
  },
  onPriceInput: function(e){
    console.log(e.detail.value);
    this.setData({
      price:e.detail.value
    })
  },
  onclickNameInput: function(){
    console.log("input",this.data.name);
    if(this.data.name=="输入商品名称，例：凤凰"){
      this.setData({
        name:"",
        activeNameInput:true
      })
    }
  },
  onclickDisInput: function(){
    console.log("input",this.data.discript);
    if(this.data.discript=="输入商品描述：品牌，渠道等"){
      this.setData({
        discript:"",
        activeDisInput:true
      })
    }
  },
  /**上传图片 */
  uploadImage:function(){
  let that=this;
  let pics =[];
  wx.chooseMedia({
   count:3 - pics.length,
   sizeType: ['original', 'compressed'],
   sourceType: ['album', 'camera'],
   success: function(res) {
   console.log(res)
   let imgSrc = res.tempFiles;
   console.log(imgSrc)
   let path;
   for(var i =0;i<imgSrc.length;i++){
     console.log(imgSrc[i].tempFilePath)
     pics.push(imgSrc[i].tempFilePath)
   }
  
   console.log(pics)
   if (pics.length >= 3){
    that.setData({
    isShow: false
    })
   }
   that.setData({
    pics: pics
   })
   },
  })
  
  },
  
  /**删除图片 */
  deleteImg:function(e){
  let that=this;
  console.log(e)
  let deleteImg=e.currentTarget.dataset.img;
  let pics = that.data.pics;
  let newPics=[];
  for (let i = 0;i<pics.length; i++){
   //判断字符串是否相等
   if(pics[i]!=deleteImg){
     newPics.push(pics[i])
   }
  }
  that.setData({
   pics: newPics,
   isShow: true
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
    console.log("show: "+this.data.university)
    // let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
    // let prevPage = pages[pages.length - 2]; 
    // if(prevPage.route=="pages/search/campus"){
    //   this.setData({
    //     university:prevPage.data.university,
    //     campus:prevPage.data.campus,
    //     uid:prevPage.data.uid,
    //     cid:prevPage.data.cid
    //   })
    //   console.log(prevPage.data)
    // }

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