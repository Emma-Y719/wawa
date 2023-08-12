
const config = require("../../../styles/config.js");
const { getBaseUrl,requestUtil } = require("../../../utils/requestUtil.js");
const db = wx.cloud.database();
const app = getApp();
wx.cloud.init();
Page({

  /**
   * 页面的初始数据
   */
  data: {
        ids: -1,
        name: '',
        uid:-1,
        cid:-1,
        university:"",
        campus: "",
        choosed:false,
        loc:"定位位置",
        lat:"",
        log:"",
        avatarUrl:"/icons/student.jpg",
        baseUrl:"",
        userInfo:{},
        isclick:false
  },
  choose(e) {
    wx.navigateTo({
      url: '/pages/search/campus',
    })
        //下面这种办法无法修改页面数据
        /* this.data.ids = e.detail.value;*/
  },
  onLoad(){
    var baseUrl=getBaseUrl();
    this.setData({
      baseUrl:baseUrl
    })
  },
  onShow(){
  },


  nameInput(e){
    console.log(e.detail.value)
    this.data.name = e.detail.value;
    this.data.userInfo.nickName=e.detail.value;
  },
  useDefault(){
    console.log(this.data.avatarUrl)
    this.setData({
      avatarUrl:"/icons/student.jpg"
    })
  },
  choosePic(){
    this.uploadImage();
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.data.avatarUrl = avatarUrl;
    console.log(e.detail.avatarUrl)
    this.setData({
      avatarUrl:avatarUrl
    })
  },
 
  handlelogin(){
    this.data.userInfo.university=this.data.university;
    this.data.userInfo.campus=this.data.campus;
    console.log("openid: ",this.data.userInfo.openid)
    if(!this.data.isclick){
      this.setData({
        isclick:true
      })
      requestUtil({url:"/user/add",method:"POST",data: {
        openid:app.globalData.openid,
        phone: "",
        university:this.data.university,
        campus:this.data.campus,
        qqnum: "",
        email: "",
        wxnum: "",
        stamp: new Date(),
        userInfo: this.data.userInfo,
        nickName:this.data.name,
        money: 0,
        online:false,
        dba: 0,
        friends:[],
        storage:[],
        favorite:[],
        uid:this.data.uid,
        cid:this.data.cid
      },}).then(res=>{
        console.log(res)
        if(res.code=="0"){
          app.globalData.openid= res.message.openid;
          app.globalData.userInfo = res.message.userinfo;
          app.globalData.friends=res.message.friends;
          app.globalData.user=res.message
          console.log(app.globalData)
          wx.showToast({
            title: '注册成功',
            icon: 'none',
          })
          wx.reLaunch({
            url: '/pages/index/index',
          })
        }else{
          wx.showToast({
            title: '注册失败，请重新提交',
            icon: 'none',
          })
          this.setData({
            isclick:false
          })
        }
      })
    }else{
      wx.showToast({
        title: '请勿重复点击，正在注册，请稍候...',
        icon: 'none',
      })
    }

    // wx.cloud.callFunction({
    //   name: 'yunrouter',
    //   data: {
    //     $url: "login", //云函数路由参数
    //     phone: "",
    //     university:this.data.university,
    //     campus:this.data.campus,
    //     qqnum: "",
    //     email: "",
    //     wxnum: "",
    //     stamp: new Date(),
    //     userInfo: this.data.userInfo,
    //     nickName:this.data.name,
    //     money: 0,
    //     dba: 0,
    //     friends:[],
    //     storage:[],
    //     chat:[],
    //     favorite:[],
    //     uid:this.data.uid,
    //     cid:this.data.cid
    //   },
    //   success: res => {
    //     console.log("login:  ",res)
    //     console.log("openid:  ",app.globalData.openid)
    //     db.collection('user').where({
    //       _openid: app.globalData.openid
    //     }).get({
    //       success: function (res) {
    //         app.globalData.openid= res.data[0]._openid;
    //         app.globalData.userInfo = res.data[0].userInfo;
    //         app.globalData.friends=res.data[0].friends;
    //         app.globalData.user=res.data[0]
    //         console.log(app.globalData)
    //         wx.showToast({
    //           title: '注册成功',
    //           icon: 'none',
    //         })
    //         wx.reLaunch({
    //           url: '/pages/index/index',
    //         })
    //       }
  
    //     })
    //   },
    //   fail() {
    //     wx.hideLoading();
    //     wx.showToast({
    //       title: '注册失败，请重新提交',
    //       icon: 'none',
    //     })
    //   }
    // });
  },
        /**上传图片 */
  uploadImage:function(){
    let that=this;
    let pic="";
    wx.chooseMedia({
     count:1,
     sizeType: ['original', 'compressed'],
     sourceType: ['album', 'camera'],
     success: function(res) {
     console.log(res)
     let imgSrc = res.tempFiles;
     console.log(imgSrc)
     let path;

    pic=imgSrc[0].tempFilePath

    
     console.log(pic)

     that.setData({
      pic: pic
     })
     },
    })
    },
  getUserInfo(e) {
        let that = this;
        console.log(e);
        let test = e.detail.errMsg.indexOf("ok");
        if (test == '-1') {
              wx.showToast({
                    title: '请授权后方可使用',
                    icon: 'none',
                    duration: 2000
              });
        } else {
              that.setData({
                    userInfo: e.detail.userInfo
              })
              that.check();
        }
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

  async handleuploadpic(){
    var avatarUrl=""
    if(this.data.avatarUrl!="/icons/student.jpg"){
      try{
        const fileID=await this.uploadFileToCloud(this.data.avatarUrl);
        avatarUrl=fileID;
      }catch (error) {
        console.log('上传图片失败', error);
      }
    }else{
      avatarUrl=this.data.avatarUrl
    }
    console.log("avatarUrl url: ",avatarUrl)
    var datacount=0;
    var that=this;
    this.data.userInfo.avatarUrl=avatarUrl

    console.log(this.data.userInfo)
    this.handlelogin();
  },


      //校检
   handleCreate1(e) {
        let that = this;
        let name = that.data.name;
        console.log(name)
        
        if (name == '') {
          wx.showToast({
            title: '昵称不能为空',
            icon: 'none',
            duration: 2000
          });
          return false
        }
        //校检校区
        let ids = that.data.ids;
        let campus = that.data.campus;
        console.log("campus: "+campus)
        if (campus=="") {
              wx.showToast({
                    title: '请先获取您的校区',
                    icon: 'none',
                    duration: 2000
              });
        }else{
          requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res=>{
            console.log(res.message.code)
            if(res.message.Length>0){
              wx.showToast({
                title: '您的id已注册',
                icon: 'none',
                duration: 2000
              });
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }else{
              that.handleuploadpic();
            }
          })
        }

          
  }
})