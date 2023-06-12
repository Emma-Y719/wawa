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
    name:'',
    discript:"",
    activeNameInput:false,
    activeDisInput:false,
    loc:"请选择您的商品地址：",
    pics:[],
    type:"点选类型",
    typeList:[],
    typeid:"",
    price:"",
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
    id:-1,
    originstatus:-1

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    qqmapsdk = new QQMapWX({
      key: 'W57BZ-JDB6X-XPA4H-Z76MI-73FF2-24BT4'
    });
    console.log("Load:   ",app.globalData.user)
    this.getTypeList();
    if(options.id==undefined){
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
      this.locate();
  
      this.searchStorageList();
    }else{
      console.log("update!")
      this.getProductDetail(options.id);
      console.log(this.data.lat)

      console.log(this.data.campus)


      this.location(this.data.lat,this.data.log);
      
      
    }

  },
  location(latitude,longitude){
    console.log("place: ",longitude,latitude);
    let self=this;
    qqmapsdk.reverseGeocoder({
      // 调用接口
      location: {
        latitude: latitude,
        longitude: longitude,
      },
      
      get_poi: 1,
      poi_options: 'policy=2;radius=3000;page_size=20;page_index=1;keyword='+encodeURIComponent(self.data.defaultKeyword),
      success: function (res) { //搜索成功后的回调
        
        
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
        console.log("data: "+res.result.pois[0].title)
        self.setData({
          selectedId: 0,
          loc: sug[0].title,
          nearList: sug, 
          suggestion: sug,
          lat:sug[0].latitude,
          log:sug[0].longitude
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

  getTypeList(){
    requestUtil({url:'/bigType/findCategories',method:"GET"}).then(result=>{
      let list=result.message
      console.log(list)
      let typeList=[]
      list.forEach(function(value,index,array){
        let smallList=value.smallTypeList;
        smallList.forEach(function(value1,index,array){
          typeList.push(value.name+"-"+value1.name)
        }) 
      })
      this.setData({
        typeList:typeList
      })


    })


  },

  locate(){

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
  },
  /**
   * 获取商品详情
   */
  async getProductDetail(id) {
    const result = await requestUtil({
      url: '/product/detail',
      data:{id},
      method: "GET"
    });
    this.productInfo=result.message;
    let product=result.message;
    console.log(product)
    this.setData({
      id:id,
      name:product.name,
      university:product.campus!=-1?app.globalData.campuses[product.campus].name:app.globalData.userInfo.university,
      campus:product.campus!=-1?app.globalData.campuses[product.campus].campus:app.globalData.userInfo.campus,
      uid:product.campus!=-1?product.university:app.globalData.userInfo.campus,
      cid:product.campus!=-1,
      discript:product.description,
      pics:product.propic.pics,
      inputValue:product.price,
      price:product.price,
      lat:product.latitude,
      log:product.longtitude,
      storageid:product.storage,
      storage:product.storage!=0?app.globalData.storageList[product.storage-1].name:"选取物品库",
      typeid:product.typeid,
      type:product.storage!=0?this.data.typeList[product.typeid-1]:"点选类型",
      originstatus:product.status
    })
    console.log(this.data.lat)
    this.location(this.data.lat,this.data.log);
    wx.cloud.callFunction({
      name: 'yunrouter',
      data: {
        $url: "huoquUserinfo", //云函数路由参数
        openid: result.message.userid
      },
      success: res2 => {
        console.log(res2.result.data[0].userInfo)
        this.setData({
          userInfo:res2.result.data[0].userInfo,
          user:res2.result.data[0]
        })
      },
      fail() {
      }
    });


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
          let temp_storage=''
          if(storages.length==0){
            temp_storage='尚未加入物品库'
          }else if(storages.length==1){
            temp_storage=sall[storages[0]-1].name
          }
          this.setData({
            storage:temp_storage
          })
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

    if(this.data.id!=-1){

      for(let i=0; i<this.data.pics.length; i++ ){
        //图片上传云服务
        if(this.data.pics[i][0]!='c'){
          try {
            const fileID = await this.uploadFileToCloud(id,this.data.pics[i]);
            pictures.push(fileID);
          } catch (error) {
            console.log('上传图片失败', error);
            pictures.push(this.data.pics[i])
          }
        }else{
          pictures.push(this.data.pics[i]);
        }
      }
      console.log(pictures)
      requestUtil({
        url:"/product/update",
        method:"POST",
        data:{
          identity: this.data.id,
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
                wx.reLaunch({
                  url: '/pages/my/index',
                })
              }
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/my/index',
                })
              }
            }
          })
        }else{

        }
          console.log(result)
      })



    }else{
      let datacount=0;

      await requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
        console.log("findAll",result.message[result.message.length-1].identity)
        datacount=result.message[result.message.length-1].identity+1;
        console.log("this index",datacount)
  
      })
      for(let i=0; i<this.data.pics.length; i++ ){
        //图片上传云服务
        try {
          const fileID = await this.uploadFileToCloud(datacount,this.data.pics[i]);
          pictures.push(fileID);
        } catch (error) {
          console.log('上传图片失败', error);
        }
      }
  
      console.log(pictures)
  
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
                  wx.reLaunch({
                    url: '/pages/my/index',
                  })
                }
                if (res.confirm) {
                  wx.reLaunch({
                    url: '/pages/my/index',
                  })
                }
              }
            })
          }else{
  
          }
          console.log(result)
      })
    }


  },
  async handleDraft(){
    
    let discript=this.data.discript
    let loc=this.data.loc
    let price=this.data.price
    let storage=this.data.storageid
    let typeid=this.data.typeid
    let name=this.data.name

    if(this.data.type==''){
      typeid=0
    }
    if(this.data.name==''){
      name=""
    }
    if(this.data.discript==""){
      discript=""
    }
    if(this.data.price==''){
      price=-1
    }
    if(this.data.method==''){
      storage=0
    }

    console.log(this.data.name)

    console.log(loc)
    console.log(price)
    console.log(storage)
    console.log("开始上传")
    let datacount=0;
    await requestUtil({url:'/product/findAll',method:"GET"}).then(result=>{
      console.log("findAll",result.message[result.message.length-1].identity)
      datacount=result.message[result.message.length-1].identity+1;
      console.log("this index",datacount)
    })


    if(this.data.id!=-1){

      var pictures=[];
      console.log(this.data.pics)
      for(let i=0; i<this.data.pics.length; i++ ){
        //图片上传云服务
        if(this.data.pics[i][0]!='c'){
          try {
            const fileID = await this.uploadFileToCloud(id,this.data.pics[i]);
            pictures.push(fileID);
          } catch (error) {
            console.log('上传图片失败', error);
            pictures.push(this.data.pics[i])
          }
        }else{
          pictures.push(this.data.pics[i]);
        }
      }
      console.log(pictures)
      requestUtil({
        url:"/product/update",
        method:"POST",
        data:{
            identity: this.data.id,
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
              title:'',
              content:"保存成功"
            })
          }else{
  
          }
          console.log(result)
      })


    }else{
      var pictures=[];
      console.log(this.data.pics)
      for(let i=0; i<this.data.pics.length; i++ ){
        //图片上传云服务
        if(this.data.pics[i][0]!='c'){
          try {
            const fileID = await this.uploadFileToCloud(datacount,this.data.pics[i]);
            pictures.push(fileID);
          } catch (error) {
            console.log('上传图片失败', error);
            pictures.push(this.data.pics[i]);
          }
        }else{
          pictures.push(this.data.pics[i]);
        }
      }
      console.log(pictures)
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
              title:'',
              content:"保存成功"
            })
          }else{
  
          }
          console.log(result)
      })

    }
  },
  uploadFileToCloud(id,filePath){
    return new Promise((resolve, reject) => {
      wx.cloud.uploadFile({
        cloudPath: "productimg/"+id+"/"+Date.parse(new Date()) + '.png',
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
    if(this.data.university==''||this.data.university==undefined){
      wx.showToast({
        title: '请选择学校校区',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.type=='点选类型'||this.data.type==''||this.data.type==undefined){
      wx.showToast({
        title: '请选择物品类型',
        icon: 'none',
        duration: 2000
      });
    }
    else if(this.data.name==''||this.data.discript==""||this.data.discript==undefined){
      wx.showToast({
        title: '请输入商品名称/描述',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.pics.length==0){
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none',
        duration: 2000
      });
      
    }else if(this.data.price==''){
      wx.showToast({
        title: '请输入商品价格',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.loc==''||this.data.lat==-1||this.data.lat==undefined||this.data.loc==undefined){
      wx.showToast({
        title: '请选择交易位置',
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

    return true;
  },
  handleType(event){
    const {value}=event.detail;
    const type=this.data.typeList[value];
    this.setData({
      type:type
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
 onTab(route){
    wx.showModal({
      title: '',
      content: '是否保存草稿？',
      complete: (res) => {
        if (res.cancel) {
          wx.reLaunch({
            url: '/pages/my/index',
          })
        }
        if (res.confirm) {
          let success=this.onDraft()
          if(success){
            wx.reLaunch({
              url: route,
            })
          }
        }
      }
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
    console.log("hide")
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