
const app = getApp()
Component({
  /**
   * 组件的初始数据
   */
  data: {
    university:"",
    campus:"",
    uid:-1,
    cid:-1,
    city:"南京"
  },
  /**
   * 组件的生命周期
   */
  pageLifetimes: {
      show() {
        this.setData({

          university:app.globalData.userInfo.university,
          campus:app.globalData.userInfo.campus,
          uid:app.globalData.user.uid,
          cid:app.globalData.user.cid,
        })
      }
  },
  /**
   * 组件的方法列表
   */
  methods: {


  },
})