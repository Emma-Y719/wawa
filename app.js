import { requestUtil,getBaseUrl} from "./utils/requestUtil"
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
const db=wx.cloud.database()
// app.js
App({
  onLaunch() {
    let that = this

    // requestUtil({url:"/campus/findCampusList",method:"GET"}).then(result=>{
    //   console.log("campuses: ",result.message)
    //   this.globalData.campuses=result.message
    // })
    this.getList();
    requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
      // console.log("storage",result)
      this.globalData.storageList=result.message
    })
     requestUtil({url:'/bigType/findCategories',method:"GET"}).then(result=>{
      let list=result.message
      console.log(list)
      let typeList=[]
      list.forEach(function(value,index,array){
        let smallList=value.smallTypeList;
        smallList.forEach(function(value1,index,array){
          typeList.push(value.name)
        }) 
      })
      this.globalData.typeList=typeList


    })

    const baseUrl=getBaseUrl();
    this.globalData.baseUrl=baseUrl;
    // console.log("baseUrl: ",baseUrl)

    const db = wx.cloud.database();


  },
  onHide(){
    requestUtil({url:"/user/findid",method:"GET",data:{id:this.globalData.openid}}).then(res=>{
      res.message[0].online=false;
      requestUtil({url:"/user/update",method:"POST",data:res.message[0]})
    })
    // db.collection('user').where({
    //   _openid:this.globalData.user._openid
    // }).update({
    //   data: {
    //     online: false,
    //   }
    // })
  },
  onShow(){
    if(this.globalData.isLogin){
      if(this.globalData.user!=undefined){
        this.globalData.user.online=true;
        requestUtil({url:"/user/update",method:"POST",data:this.globalData.user})
      }
    }
    
  },

  async getList(){
    await requestUtil({url:"/campus/findCampusList",method:"GET"}).then(result=>{
      // console.log("campuses: ",result.message)
      this.globalData.campuses=result.message
    })
  },

  globalData: {
    baseUrl:"",
    useTmp : false ,// 默认不开启
    user: {},
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
    storageList:[],
    typeList:[],
    userInfo:{
    },
    chose:[true,false,false,false,false],
    uid:-1,
    cid:-1,
    locuni:'',
    loccam:''
  }
})
