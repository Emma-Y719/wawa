// pages/repair/index.js



wx.cloud.init()
const db=wx.cloud.database()

Page({
  
  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // wx.cloud.callFunction({
    //   name: 'yunrouter',
    //   data: {
    //     $url: "repairchats", //云函数路由参数
    //   },
    //   success: res2 => {
    //     console.log(res2)
    //   },
    //   fail() {
    //   }
    // });
    this.queryAllResult()
    this.repairChatsResult()
  },
  async repairChatsResult(){
    const count=await this.repairChats()
    console.log(count)
  },
  async repairChats(){
    const regex = ".*undefined.*" // 正则表达式，替换为你需要的模式
    const queryResult = await db.collection("chats").where({
      chatid: db.RegExp({
        regexp: regex,
        options: 'i' // 'i'表示不区分大小写，可根据需要修改
      })
    }).get()

    // 遍历匹配到的数据，并进行替换
    const promises = queryResult.data.map(async item => {
      // console.log("get item : ",item)
      const replacementValue = item._openid // 替换值，替换为你需要的字段名
      // console.log(replacementValue)
      const restorevalue=item.chatid.replace(/undefined/,replacementValue)
      console.log(restorevalue)
       return db.collection("chats").where({chatid:item.chatid}).update({
         data: {
           chatid: restorevalue // 进行替换，替换为你需要的字段名
         }
       }).then(res=>{
         console.log(res)
       })
    })

    // 等待所有替换操作完成
    const result = await Promise.all(promises)

    return result.length
  },



  async queryAllResult(){
    const res=await this.queryAll("chats",{id:"olD3w5JtzGlvAY4ZtpMyVipWzeKg"});
    console.log(res)
  },
  
  async queryAll(collection,querys){
    const MAX_LIMIT=50;
    // 获取记录总数
    const countResult = await db.collection(collection).where(querys).count();
    const total = countResult.total;
    console.log(total)
    // 计算总共需要的分页次数
    const batchTimes = Math.ceil(total / 50);
  
    // 批量获取所有记录
    const tasks = [];
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection(collection).where(querys)
        .skip(i * 50)
        .limit(50)
        .get();
      tasks.push(promise);
    }
  
    // 等待所有分页查询完成
    const result = (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      };
    });
  
    return result;
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