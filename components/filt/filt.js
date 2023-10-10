
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
          university:app.globalData.campuses[app.globalData.searchCampusIndex].name,
          campus:app.globalData.campuses[app.globalData.searchCampusIndex].campus,
          uid:app.globalData.searchUniversityIndex,
          cid:app.globalData.searchCampusIndex,
        })
      }
  },
  /**
   * 组件的方法列表
   */
  methods: {


  },
})