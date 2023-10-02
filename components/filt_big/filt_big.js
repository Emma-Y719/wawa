
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
    storageid:-1,
    city:"南京",
    storageList:["不限"],
    storage:"不限"
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
    handleStorage(e){
      const selectedIndex = e.detail.value;
      const storage = this.data.storageList[selectedIndex];

      this.setData({
        storage:storage,
        storageid:selectedIndex==0?selectedIndex-1:selectedIndex
      })
      console.log(storage,this.data.storageid);
      this.triggerEvent('customEvent', {}, {});
    }
  },
})