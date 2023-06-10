import { requestUtil } from "./utils/requestUtil"

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
    requestUtil({url:"/campus/findCampusList",method:"GET"}).then(result=>{
      console.log("campuses: ",result.message)
      this.globalData.campuses=result.message
    })
 
    const db = wx.cloud.database();

  },
  globalData: {
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
