// pages/promote/index.js
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
var QQMapWX = require('../../utils/qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js');
var qqmapsdk;
const app=getApp();
// 在页面中定义插屏广告
let interstitialAd = null
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
    loc:"商品地址：",
    pics:[],
    type:"点选类型",
    typeList:[],
    typeid:0,
    price:"",
    quality:"",
    originprice:"",
    storage:["选取群物品库"],
    storage_sel:"",
    storageid:[0],
    storageList:[],
    storageNames:[],
    log:-1.0,
    lat:-1.0,
    inputValue: '',// 用于保存用户输入的数字值
    qualityValue:"",
    originValue:"",
    currentRegion: {
      province: '城市',
      city: '城市',
      district: '城市',
    },
    defaultKeyword: '学校',
    keyword: '',
    centerData: {},
    nearList: [],
    suggestion: [],
    selectedId: 0,
    id:-1,
    originstatus:-1,
    noStorage:false,
    isconfirmed:false,
    productSelect:true,
    postSelect:false,
    seekSelect:false,
    post_type:0,
    pickerIndex: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    qqmapsdk = new QQMapWX({
      key: 'W57BZ-JDB6X-XPA4H-Z76MI-73FF2-24BT4'
    });
    console.log("Load:   ",app.globalData.user)
      // 在页面onLoad回调事件中创建插屏广告实例
    if (wx.createInterstitialAd) {
      interstitialAd = wx.createInterstitialAd({
        adUnitId: 'adunit-9ad07a2514baead3'
      })
      interstitialAd.onLoad(() => {})
      interstitialAd.onError((err) => {})
      interstitialAd.onClose(() => {})
    }
    // this.getTypeList();
    this.setData({
      typeList:app.globalData.typeList
    })
    if(options.id==undefined){
      this.setData({
        university:app.globalData.user.university,
        campus:app.globalData.user.campus,
        uid:app.globalData.user.uid,
        cid:app.globalData.user.cid
      })
  
      if(options.storage!=undefined){
        const {storage}=options;
        console.log("storage not undefined： "+storage)
        if(storage!=undefined){
          this.setData({
            storageid:storage
          })
        }
      }
      this.locate();
  
      this.searchStorageList();
    }else{
      this.getProductDetail(options.id);     
      // console.log("lat: ",this.data.lat)
      // console.log("log: ",this.data.log)
      // console.log("university: ",this.data.campus)
      // console.log("campus: ",this.data.campus)
      // console.log("storageid: ",this.data.storageid)
    }

  },
  ontapProduct(){
    this.setData({
      productSelect:true,
      postSelect:false,
      seekSelect:false,
      post_type:0
    })
  },
  ontapPost(){
    this.setData({
      productSelect:false,
      postSelect:true,
      seekSelect:false,
      post_type:1
    })
  },
  ontapSeek(){
    this.setData({
      productSelect:false,
      postSelect:false,
      seekSelect:true,
      post_type:2
    })
  },
  ontapAd(){
    if (interstitialAd) {
      console.log("add advertise")
      interstitialAd.show().catch((err) => {
        console.error(err)
        if(err.errCode==2002){
          wx.showToast({
            title: '距离上次点击时间太短，可以先去逛逛再来～',
            icon: 'none',
            duration: 2000
          });
        }
      })
      interstitialAd.onClose(res => {
        console.log('插屏 广告关闭')
        wx.showToast({
          title: '恭喜您，我们会增加您物品的曝光度～',
          icon: 'none',
          duration: 2000
        });
      })
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
        console.log("data location: "+sug[0])
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

  locate(){

    var self=this;
    //定位
requestUtil({url:"/campus/findId",method:"GET",data:{cid:app.globalData.user.cid}}).then(res=>{
  let latitude=res.message.latitude
  let longitude=res.message.longitude
  self.setData({
    lat:latitude,
    log:longitude
  })
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

  })

  },

  async getTypeList(){
    await requestUtil({url:'/bigType/findCategories',method:"GET"}).then(result=>{
      let list=result.message
      console.log(list)
      let typeList=[]
      list.forEach(function(value,index,array){
        let smallList=value.smallTypeList;
        smallList.forEach(function(value1,index,array){
          typeList.push(value.name)
        }) 
      })
      this.setData({
        typeList:typeList
      })


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
    
    let product=result.message;
    this.setData({
      post_type:product.post_type,
      
    })
    if(product.post_type==0){
      this.setData({
        productSelect:true,
        postSelect:false,
        seekSelect:false,
      })
    }else if(product.post_type==1){
      this.setData({
        productSelect:false,
        postSelect:true,
        seekSelect:false,
      })
    }else{
      this.setData({
        productSelect:false,
        postSelect:false,
        seekSelect:true,
      })
    }
    this.searchStorageList();
    // console.log("typelist: ",this.data.typeList);
    let init_storage=[]
    let init_storageid=[]
    product.storage.forEach(function(value,index,array){
       init_storageid.push(value);
       init_storage.push(app.globalData.storageList[value-1].name);
    })
    // console.log("product origin price: ",product);
    this.setData({
      id:id,
      name:product.name,
      university:product.campus!=-1?app.globalData.campuses[product.campus].name:app.globalData.userInfo.university,
      campus:product.campus!=-1?app.globalData.campuses[product.campus].campus:app.globalData.userInfo.campus,
      uid:product.campus!=-1?product.university:app.globalData.user.uid,
      cid:product.campus!=-1?product.campus:app.globalData.user.cid,
      discript:product.description,
      pics:product.propic.pics,
      inputValue:product.price,
      qualityValue:product.quality,
      originValue:product.originprice!=-1?product.originprice:"无",
      quality:product.quality,
      price:product.price,
      originprice:product.originprice,
      lat:product.latitude,
      log:product.longtitude,
      post_type:product.post_type,
      typeid:product.typeid,
      type:product.typeid!=0?this.data.typeList[product.typeid-1]:"点选类型",
      storageid:product.storage,
      storage:init_storage,
      originstatus:product.status
    })
    console.log("product originprice: ",product);
    let temp_product={
      id:id,
      name:product.name,
      university:product.campus!=-1?app.globalData.campuses[product.campus].name:app.globalData.userInfo.university,
      campus:product.campus!=-1?app.globalData.campuses[product.campus].campus:app.globalData.userInfo.campus,
      uid:product.campus!=-1?product.university:app.globalData.user.uid,
      cid:product.campus!=-1?product.campus:app.globalData.user.cid,
      discript:product.description,
      pics:product.propic.pics,
      inputValue:product.price,
      qualityValue:product.quality,
      originValue:product.originprice!=-1?product.originprice:"无",
      quality:product.quality,
      price:product.price,
      originprice:product.originprice,
      lat:product.latitude,
      log:product.longtitude,
      storageid:product.storage,
      storage:init_storage,
      typeid:product.typeid,
      type:product.typeid!=0?this.data.typeList[product.typeid-1]:"点选类型",
      originstatus:product.status
    }
    console.log("temp_product: ",temp_product)

    if(this.data.lat==-1||this.data.log==-1){
      this.locate();
      console.log("get the locate"+this.data.lat)
    }else{
      console.log("locate!")
      this.location(this.data.lat,this.data.log);
    }
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

  handleStorage(event){
    const {value}=event.detail;
   
    let storagevalue=parseInt(value)
    const storage_name=this.data.storageNames[value];
    if(storage_name=="不同步"){
      var that=this;
      this.data.storage.forEach(function(value,array,index){
        that.data.storageNames.unshift(value+"物品库");
        
      })
      this.data.storageid.forEach(function(value,index,array){
        that.data.storageList.unshift(value);
      })
      this.setData({
        isconfirmed:true,
        storageid:[],
        storage:[],
        storageNames:this.data.storageNames,
        storageList:this.data.storageList
      })
    }else{
      console.log("choose id: ",storagevalue,"choose name: ",storage_name)
      let sid=(storagevalue)%(this.data.storageNames.length);
      let tem_sid=0;
      if(sid<this.data.storageList.length){
        tem_sid=this.data.storageList[sid]
      }
      this.data.storageNames.splice(value,1);
      this.data.storageList.splice(sid,1);
      if(storage_name!=undefined){
        let temp_sto_names=this.data.storage;
        let temp_sto_ids=this.data.storageid;
        temp_sto_names.push(storage_name.replace("物品库",""));
        temp_sto_ids.push(tem_sid);
        console.log("curent ids: ",temp_sto_names,"current names: ",temp_sto_ids)
        this.setData({
          storage_sel:storage_name,
          storage:temp_sto_names,
          storageid:temp_sto_ids,
          storageList:this.data.storageList,
          storageNames:this.data.storageNames
        })
        console.log("curent ids: ",this.data.storageid,"current names: ",this.data.storage)
      }else{
        wx.showModal({
          title: '',
          content: '尚未加入物品库,去搜索加入吧',
          complete: (res) => {
            if (res.cancel) {
              isconfirmed=true
            }
        
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/storage/index',
              })
            }
          }
        })
  
      }
    }

 

    console.log("cur storage id: ",this.data.storageid)
  },
  handleType(event){
    const {value}=event.detail;
    console.log(value)
    let typevalue=parseInt(value)
    const type=this.data.typeList[value];
    this.setData({
      type:type,
      typeid:typevalue+1
    })
    console.log(this.data.typeid)
  },
  async searchStorageList(e){
    console.log("cur storageid: "+this.data.storageid)
    if(this.data.storageid[0]==0&&this.data.storage[0]!="不同步"){
      requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
        var sall=result.message
        console.log("all storages",sall);
        var storages=app.globalData.user.storage;
        console.log("i'm in: ",app.globalData.user)
        if(storages!=undefined){
          let temp_storage=[]
          let temp_id=[];
          let temp_nostorage=false;
          console.log(this.data.storageid)
          if(this.data.storageid.length>0){

          }
          if(this.data.storageid.length==0||this.data.storageid[0]==0){
            if(storages.length==0){
              //temp_storage.push('尚未加入物品库')
              temp_nostorage=true
            }else{
              temp_storage.push(storages[0].name.replace("物品库",""))
              temp_id.push(storages[0].identity)
            }
            console.log("temp_storage: ",temp_storage)
            console.log("temp_id: ",temp_id)
          }else{
            this.data.storageid.forEach(function(value,index,array){
              temp_id.push(value)
            })
            this.data.storage.forEach(function(value,index,array){
              console.log(value);
              temp_storage.push(value.replace("物品库",""))
            })
            console.log("temp_storage: ",temp_storage)
            console.log("temp_id: ",temp_id)
          }
          this.setData({
            storage:temp_storage,
            storageid:temp_id,
            noStorage:temp_nostorage
          })
          var storageList=[]
          var storageNames=[]
          var that=this;
          storages.forEach(function(value,index,array){
            if(!that.data.storage.includes(value.name.replace("物品库",""))){
              storageNames.push(value.name)
            }
            if(!that.data.storageid.includes(value.identity)){
              storageList.push(value.identity);
            }
           
            
          })
          storageNames.push("不同步")
          this.setData({
            storageList:storageList,
            storageNames:storageNames
          })
        }
      })
    }else if(this.data.storageid.length>0&&this.data.storageid[0]!=0){
      console.log(this.data.storageid)
      requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
        var sall=result.message
        console.log("all storages",sall)
        var storages=app.globalData.user.storage;
        console.log("i'm in: ",storages)
        console.log(this.data.storageid);
        if(storages!=undefined){
          let temp_storage=[]
          let temp_nostorage=false;
          temp_storage.push(sall[this.data.storageid[0]-1].name.replace("物品库",""))
          console.log("temp_storage: ",temp_storage)
          this.setData({
            storage:temp_storage,
            noStorage:temp_nostorage
          })
          var storageList=[]
          var storageNames=[]
          var that=this;
          storages.forEach(function(value,index,array){

            if(!that.data.storage.includes(value.name.replace("物品库",""))){
              storageNames.push(value.name)
              
            }
            if(!that.data.storageid.includes(value.identity)){
              storageList.push(value.identity);
            }
          })
          storageNames.push("不同步")
          this.setData({
            storageList:storageList,
            storageNames:storageNames
          })
        }
    
      })


    }

  },


  async handleUpload(){
    var pictures=[];

    if(this.data.id!=-1){

      for(let i=0; i<this.data.pics.length; i++ ){
        //图片上传云服务
        if(this.data.pics[i][0]!='c'){
          try {
            const fileID = await this.uploadFileToCloud(this.data.id,this.data.pics[i]);
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
          originprice:this.data.originprice,
          quality:this.data.quality,
          propic: {"pics":pictures},
          ishot:0,
          isswiper:0,
          typeid:this.data.typeid,
          post_type:this.data.post_type,
          hotdatetime:this.formatDateTime(new Date()),
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

      await requestUtil({url:'/product/findMaxId',method:"GET"}).then(result=>{
        console.log("MaxId: ",result.message.identity)
        datacount=result.message.identity+1;
        console.log("this index: ",datacount)
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
          originprice:this.data.originprice,
          quality:this.data.quality,
          propic: {"pics":pictures},
          ishot:0,
          isswiper:0,
          typeid:this.data.typeid,
          post_type:this.data.post_type,
          hotdatetime:this.formatDateTime(new Date()),
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
    let originprice=this.data.originprice
    let quality=this.data.quality
    let storage=this.data.storageid
    let typeid=this.data.typeid
    let name=this.data.name
    let post_type=this.data.post_type
    if(this.data.type==''){
      typeid=0
    }

    if(this.data.discript==""){
      discript=""
    }
    if(this.data.price==''){
      price=-1
    }
    if(this.data.originprice==''){
      originprice=-1
    }

    if(this.data.method==''){
      storage=0
    }
    if(this.data.name==''){
      wx.showToast({
        title: '请至少输入物品名称',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.university==''||this.data.university==undefined){
      wx.showToast({
        title: '请选择学校校区',
        icon: 'none',
        duration: 2000
      });
    }else{
      console.log("name: ",this.data.name)
      console.log("type: ",typeid)
      console.log("loc: ",loc)
      console.log("price: ",price)
      console.log("originprice: ",originprice)
      console.log("quality: ",quality)
      console.log("storage: ",storage)
      console.log("开始上传")
      let datacount=0;
      await requestUtil({url:'/product/findMaxId',method:"GET"}).then(result=>{
        console.log("MaxId: ",result.message.identity)
        datacount=result.message.identity+1;
        console.log("this index: ",datacount)
      })
  
  
      if(this.data.id!=-1){
  
        var pictures=[];
        console.log(this.data.pics)
        for(let i=0; i<this.data.pics.length; i++ ){
          //图片上传云服务
          if(this.data.pics[i][0]!='c'){
            try {
              const fileID = await this.uploadFileToCloud(this.data.id,this.data.pics[i]);
              pictures.push(fileID);
            } catch (error) {
              console.log('上传图片失败', error);
              pictures.push(this.data.pics[i])
            }
          }else{
            pictures.push(this.data.pics[i]);
          }
        }
        console.log(this.formatDateTime(new Date()))
        requestUtil({
          url:"/product/update",
          method:"POST",
          data:{
              identity: this.data.id,
              name: this.data.name,
              price: price,
              originprice:originprice,
              quality:quality,
              propic: {"pics":pictures},
              ishot:0,
              isswiper:0,
              typeid:typeid,
              post_type:post_type,
              hotdatetime:this.formatDateTime(new Date()),
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
            originprice:originprice,
            quality:quality,
            propic: {"pics":pictures},
            ishot:0,
            isswiper:0,
            typeid:typeid,
            post_type:post_type,
            hotdatetime:this.formatDateTime(new Date()),
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

    }
   
  },
  formatLeadingZeroNumber(n, digitNum = 2) {
    n = n.toString()
    const needNum = Math.max(digitNum - n.length, 0)
    return new Array(needNum).fill(0).join('') + n
  },
  formatDateTime(date, withMs = false) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const ms = date.getMilliseconds()
  
    let ret = [year, month, day].map(value => this.formatLeadingZeroNumber(value, 2)).join('-') +
      ' ' + [hour, minute, second].map(value => this.formatLeadingZeroNumber(value, 2)).join(':')
    if (withMs) {
      ret += '.' + this.formatLeadingZeroNumber(ms, 3)
    }
    return ret
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
  
  onPromote(){
    var baseUrl=getBaseUrl()
    console.log("university: "+this.data.university)
    console.log(this.data.campus)
    console.log(this.data.discript)
    console.log(this.data.pics)
    console.log(this.data.loc)
    console.log(this.data.price)
    console.log(this.data.originprice)
    console.log(this.data.quality)
    console.log(this.data.storageid)
    console.log(this.data.post_type)
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
        title: '请输入物品名称/描述',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.pics.length==0){
      wx.showToast({
        title: '请至少上传一张图片',
        icon: 'none',
        duration: 2000
      });
      
    }else if(this.data.price==''||this.data.price==-1){
      wx.showToast({
        title: '请输入物品价格',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.quality==''){
      wx.showToast({
        title: '请输入物品成色',
        icon: 'none',
        duration: 2000
      });
    }else if(this.data.loc==''||this.data.lat==-1||this.data.lat==undefined||this.data.loc==undefined){
      wx.showToast({
        title: '请选择交易位置',
        icon: 'none',
        duration: 2000
      });
    }else if(!this.data.isconfirmed&&this.data.storage.length==0){
      // console.log(this.data.)
      if(this.data.storageNames.length==1){
        wx.showModal({
          title: '',
          content: '尚未加入群聊物品库，需要去添加么？',
          complete: (res) => {
            if (res.cancel) {
              this.setData({
                isconfirmed:true
              })
            }
        
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/storage/index',
              })
            }
          }
        })
      }else{
        wx.showModal({
          title: '',
          content: '可同步到加入的群聊物品库，需要去添加么？',
          complete: (res) => {
            if (res.cancel) {
              this.setData({
                isconfirmed:true
              })
            }
        
            if (res.confirm) {
              
            }
          }
        })
      }

      
    }else{
      this.handleUpload();
    }
  },

  onDraft:function(){
    var pictures=this.data.pics;
    this.handleDraft();

    return true;
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
  onOriginPriceInput: function(e){
    console.log(e.detail.value);
    this.setData({
      originprice:parseFloat(e.detail.value)
    })
  },
  onQualityInput: function(e){
    console.log(e.detail.value);
    this.setData({
      quality:e.detail.value
    })
  },
  isIOS(){
    return wx.getSystemInfo().then(res => {
      return /IOS/ig.test(res.system);
    });
  },
    // 压缩
    compressFile(src, i, size) {
      return new Promise((resolve) => {
        // 获取图片信息
        wx.getImageInfo({
          src,
          success: (img) => {
            let imgWidth = img.width
            let imgHeight = img.height
            // 若宽高都小于4096，则使用canvas
              // 强制压缩
              console.log("image: ",img)
              this.compressImage(src, size).then(res => {
                resolve(res)
              })
            
          },
          fail: () => {
            this.compressImage(src, size).then(res => {
              resolve(res)
            })
          }
        })
      })
    },
 // 强制压缩
 compressImage(src, size) {
  return new Promise((resolve, reject) => {
    let quality = 100
    // ios因为自己有压缩机制，压缩到极致就不会再压，因此往小了写
    if (this.data.isIOS) {
      quality = 0.1
    } else {
      let temp = 30 - parseInt(size / 1024 / 1024)
      quality = temp < 10 ? 10 : temp
    }
    wx.compressImage({
      src, // 图片路径
      quality, // 压缩质量
      success: function (res) {
        console.log("compressed: ",res)
        resolve(res.tempFilePath)
      },
      fail: function (err) {
        resolve(src)
      }
    })
  })
},
  /**上传图片 */
  async uploadImage(){
  let that=this;
  let pics =this.data.pics;
  let sys=await this.isIOS();
  this.setData({
    isIOS:sys
  })
  console.log("system: ",this.data.isIOS)
  const fileLimit = 50 * 1024
  // 选择图片原图或是压缩图
  const sizeType = this.data.isIos ? ['compressed'] : ['original', 'compressed']
  
  wx.chooseMedia({
   count:9- pics.length,
   sizeType: sizeType,
   sourceType: ['album', 'camera'],
   success: async function(res) {

   console.log(res)
   let imgSrc = res.tempFiles;
   console.log(imgSrc)
   let path;
   for(var i =0;i<imgSrc.length;i++){
     console.log(imgSrc[i].tempFilePath)
     let filePath=imgSrc[i].tempFilePath;
     if (imgSrc[i].size > fileLimit) {
      // 手动压缩
      filePath = await that.compressFile(filePath, i, imgSrc[i].size)
     }
     pics.push(filePath)
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
  deleteStorage(e){
    const {index}=e.currentTarget.dataset;
    let sto_del_name=this.data.storage[index];
    let sto_del_id=this.data.storageid[index];
    this.data.storage.splice(index,1);
    this.data.storageid.splice(index,1);
    this.data.storageNames.unshift(sto_del_name);
    this.data.storageList.unshift(sto_del_id);
    this.setData({
      storageNames:this.data.storageNames,
      storageList:this.data.storageList,
      storageid:this.data.storageid,
      storage:this.data.storage,
      isconfirmed:this.data.storage.length==0?true:false
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
  onClickStorage(){
      wx.showModal({
        title: '',
        content: '尚未加入群聊物品库，需要去添加么？',
        complete: (res) => {
          if (res.cancel) {
            this.setData({
              isconfirmed:true
            })
          }
      
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/storage/index',
            })
          }
        }
      })
    
  },
  onTab(route){
    wx.showModal({
      title: '',
      content: '是否保存草稿？',
      complete: (res) => {
        if (res.cancel) {
          wx.reLaunch({
            url: route,
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
    console.log("onshow")
    this.searchStorageList();

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