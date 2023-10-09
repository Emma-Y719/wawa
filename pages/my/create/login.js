
const config = require("../../../styles/config.js");
const { getBaseUrl,requestUtil } = require("../../../utils/requestUtil.js");
const db = wx.cloud.database();
const app = getApp();
wx.cloud.init();
var zhenzisms = require('../../../utils/zhenzisms.js');
zhenzisms.client.init("https://sms_developer.zhenzikj.com", "113521", "e0382ac6-a92c-4edd-8d49-375c532d0007");
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
        isclick:false,
        gradeid:-1,
        grade:"选择年级",
        gradeList:["大一","大二","大三","大四","大五","研一","研二","研三","博士"],
        years: [],
        yearIndex: 0,
        selectedYear: '',
        isIdVerified:false,
        phone:'',
        id:'',
        code:'',
        isPhoneVerified:false,
        hidden: false,
        btnValue:'获取验证码',
        btnDisabled:false,
        second:60
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
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    this.setData({
      years: years,
      selectedYear: years[11]
    });
  },
  onShow(){
  },
  bindYearChange: function (e) {
    const yearIndex = e.detail.value;
    const selectedYear = this.data.years[yearIndex];

    // 在这里可以处理选择后的年份
    console.log(`选择的年份是：${selectedYear}`);

    this.setData({
      yearIndex: yearIndex,
      selectedYear: selectedYear
    });
  },
  handleIdVerify(){

  },
      //手机号输入
  bindIdInput(e) {
    //console.log(e.detail.value);
    var val = e.detail.value;
    //console.log(val);
    this.setData({
      id: val
    })
    console.log(this.data.id);
    // if(val != ''){
    //   this.setData({
    //     hidden: false,
    //     btnValue: '获取验证码'
    //   })
    // }else{
    //   this.setData({
    //     hidden: true
    //   })
    // }
  },
    //手机号输入
  bindPhoneInput(e) {
    //console.log(e.detail.value);
    var val = e.detail.value;
    //console.log(val);
    this.setData({
      phone: val,
      phoneval:val
    })
    console.log(this.data.phone);
    // if(val != ''){
    //   this.setData({
    //     hidden: false,
    //     btnValue: '获取验证码'
    //   })
    // }else{
    //   this.setData({
    //     hidden: true
    //   })
    // }
  },
 //验证码输入
 bindCodeInput(e) {
  this.setData({
    code: e.detail.value
  })
},
//获取短信验证码
getCode(e) {
  var that = this;
  zhenzisms.client.init('https://sms_developer.zhenzikj.com', '113521', 'e0382ac6-a92c-4edd-8d49-375c532d0007');
  var params = {};
  
  params.number = that.data.phone;
  params.templateId = '12265';
  var code = zhenzisms.client.createCode(4, 60, that.data.phone);
  var templateParams = [code, '5'];
  params.templateParams = templateParams;
  params.messageId = '223232323';
  params.clientIp = '221.221.221.111';
  var that=this;
  zhenzisms.client.send(function (res) {
    console.log(res);
    if(res.data.code==0){
      wx.showToast({
        title: "发送成功",
        icon: 'none',
        duration: 2000
      })
      that.timer();
    }

  }, params);
  
},
timer: function () {
  let promise = new Promise((resolve, reject) => {
    let setTimer = setInterval(
      () => {
        var second = this.data.second - 1;
        this.setData({
          second: second,
          btnValue: second+'秒',
          btnDisabled: true
        })
        if (this.data.second <= 0) {
          this.setData({
            second: 60,
            btnValue: '获取验证码',
            btnDisabled: false
          })
          resolve(setTimer)
        }
      }
      , 1000)
  })
  promise.then((setTimer) => {
    clearInterval(setTimer)
  })
},
showToast(msg){
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
},
//保存
verify(e) {
  //console.log('姓名: ' + this.data.name);
  //console.log('手机号: ' + this.data.phone);
  //console.log('验证码: ' + this.data.code);
  var that = this;
   //检验验证码
  var result = zhenzisms.client.validateCode(this.data.phone, this.data.code);
  if (result == 'ok'){
    that.showToast('验证正确');
    this.setData({
      isPhoneVerified:true
    })
  } else if (result == 'empty'){
    that.showToast('验证错误, 未生成验证码!');
  } else if (result == 'number_error') {
    that.showToast('验证错误，手机号不一致!');
  } else if (result == 'code_error') {
    that.showToast('验证错误，验证码不一致!');
  } else if (result == 'code_expired') {
    that.showToast('验证错误，验证码已过期!');
  }
},
  nameInput(e){
    console.log(e.detail.value)
    this.data.name = e.detail.value;
    this.data.userInfo.nickName=e.detail.value;
    this.setData({
      userInfo:this.data.userInfo,
      name:e.detail.value
    })
    console.log(this.data.name);
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
  handleGrade(event){
    console.log(this.data.campus)
    const {value}=event.detail;
    console.log(value)
    let gradevalue=parseInt(value)
    const grade=this.data.gradeList[value];
    var yearindex=0;
    if(gradevalue<5){
      yearindex=15-gradevalue;
    }else if(gradevalue>=5&&gradevalue<7){
      yearindex=13-(gradevalue-5)
    }else{
      yearindex=11
    }

    this.setData({
      grade:grade,
      gradeid:gradevalue,
      yearIndex:yearindex,
      selectedYear:this.data.years[yearindex]
    })
    console.log(this.data.gradeid)
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
        phone: this.data.phone,
        university:this.data.university,
        campus:this.data.campus,
        studentId: this.data.id,
        email: "",
        grade: this.data.gradeid,
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
          app.globalData.uid=res.message.uid
          app.globalData.cid=res.message.cid
          app.globalData.locuni=res.message.university
          app.globalData.loccam=res.message.campus
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
        let gradeid=that.data.gradeid;
        let phone =that.data.phone;
        let id=that.data.id;
        console.log("name ",name)
        console.log("gradeid ",gradeid)
        console.log("phone ",phone)
        console.log("campus",that.data.campus)
        console.log("openid",app.globalData.openid)
        if (name == '') {
          wx.showToast({
            title: '昵称不能为空',
            icon: 'none',
            duration: 2000
          });
          return false
        }
        if (gradeid == -1) {
          wx.showToast({
            title: '年级不能为空',
            icon: 'none',
            duration: 2000
          });
          return false
        }
        if (id == '') {
          wx.showToast({
            title: '学号不能为空',
            icon: 'none',
            duration: 2000
          });
          return false
        }
        if (phone == '') {
          wx.showToast({
            title: '手机号不能为空',
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
        }
        if(!this.data.isPhoneVerified){
          wx.showToast({
            title: '请先验证手机',
            icon: 'none',
            duration: 2000
          });
        }
        else{
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