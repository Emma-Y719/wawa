import { requestUtil,getBaseUrl} from "./utils/requestUtil"
// app.js
App({


  onLaunch() {
    let that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'cloud1-4g6bmgze1a238f21',
        traceUser: true,
      })
    }
    const token=wx.getStorageSync('token');
    if(!this.globalData.isLogin){
      wx.showModal({
        title:'友情提示',
        content:'微信授权登录后，才可进入个人中心',
        success:(res)=>{
          wx.cloud.callFunction({
            name: 'yunrouter', // 对应云函数名
            data: {
              $url: "openid", //云函数路由参数
            },
            success: re => {
              console.log("user:"+re.result)
              this.globalData.openid=re.result
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
                    this.globalData.openid= res.data[0]._openid;
                    this.globalData.userInfo = res.data[0].userInfo;
                    this.globalData.friends=res.data[0].friends;
                    this.globalData.data=res.data[0]
                    console.log(this.globalData)
                    wx.reLaunch({
                      url: '/pages/my/create/login',
                    })
                  }
      
                },
              })
            }
          })
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
      console.log("token存在："+token);
      const userInfo=wx.getStorageSync('userInfo')
      this.setData({
        userInfo
      })
    }
    const baseUrl=getBaseUrl();
    this.globalData.baseUrl=baseUrl;
    console.log(baseUrl)
    requestUtil({url:"/campus/findCampusList",method:"GET"}).then(result=>{
      console.log("campuses: ",result.message)
      this.globalData.campuses=result.message
    })
 
    const db = wx.cloud.database();

  },
  globalData: {
    baseUrl:"",
    useTmp : false ,// 默认不开启
    userInfo: null,
    index:-1,
    camIndex:-1,
    curcamIndex:-1,
    searchUniversityIndex:-1,
    searchCampusIndex:-1,
    navifrom:-1,
    campus:"不限-不限",
    type:"不限",
    location:"南京",
    isLogin:false,
    campuses:[],
    userInfo:{
      
    }
  }
})
