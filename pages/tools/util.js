// pages/tools/util.js
import {
  getBaseUrl,
  getWxLogin,
  getUserProfile,
  requestPay,
  requestUtil
}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
// 获取应用实例
const app = getApp()
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
    //this.getUsers();

  },
  async getUsers(){
    await requestUtil({url:'/user/findAll',method:"GET"}).then(result=>{
      console.log("all",result)
     // console.log("campuses",app.globalData.campuses)
     const countMap = {}; // 用于存储序号出现次数的对象
       result.message.forEach(function(value,index,array){
           
           var favoriteId=[];
           if(value.favorite.length>0){
            console.log(value.favorite);
            value.favorite.forEach(function(favValue) {
              if (countMap[favValue]) {
                countMap[favValue]++; // 如果已经存在该序号，增加次数
              } else {
                countMap[favValue] = 1; // 如果还没有该序号，初始化为 1
              }
            });
           }
       })
        // 创建一个 Promise 数组来存储所有请求
      const promises = [];
      for (const number in countMap) {
        console.log(`序号 ${number} 出现了 ${countMap[number]} 次`);
        // 发送请求获取产品信息
        const promise = requestUtil({ url: "/product/findId", method: "GET", data: { id: number } })
          .then(res => {
            var product = res.message[0];
            console.log(product.focus);
            // 在这里根据产品信息更新 focus 属性
            product.focus = countMap[number];
            requestUtil({url:"/product/update",method:"POST",data:product}).then(res=>{
              // console.log(res.message)
            })
            return product;
          });
        promises.push(promise);
      }

      // 使用 Promise.all 等待所有请求完成
      Promise.all(promises)
        .then(products => {
          // 在这里可以处理所有产品更新后的操作
          console.log("Updated products:", products);
        })
        .catch(error => {
          console.error("Error updating products:", error);
        });
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