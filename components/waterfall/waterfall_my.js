// components/waterfall.js
import {getBaseUrl, requestUtil}from '../../utils/requestUtil.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
var util = require('../../styles/util.js');
// 获取应用实例
const app = getApp()
wx.cloud.init()
const db = wx.cloud.database();
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    left_h:0,
    right_h:0,
    leftDatas:[],
    rightDatas:[],
    icons:[]
  },
  /**
   * 组件的生命周期
   */
  pageLifetimes: {
    show() {
      this.setData({
        leftDatas:[],
        rightDatas:[],
        left_h:0,
        right_h:0,
        left_favs:[],
        right_favs:[]
      })

    }
  },
  /**
   * 组件的方法列表
   */
  methods: {

    arrangeDatas(list){
      var that=this;
      list.forEach(function(value,index,array){
        var delta=0;
        if(value.propic.pics[0]){
          delta=2;
        }else{
          delta=1;
        }
        var left_h=that.data.left_h;
        var right_h=that.data.right_h;
        var leftDatas=that.data.leftDatas;
        var rightDatas=that.data.rightDatas;
        if(that.data.left_h<=that.data.right_h){
          leftDatas.push(value);
          left_h+=delta;  
        }else{
          rightDatas.push(value);
          right_h+=delta;
        }
        that.setData({
          left_h:left_h,
          right_h:right_h,
          leftDatas:leftDatas,
          rightDatas:rightDatas
        })
      })
      requestUtil({url:"/user/findid",method:"GET",data:{id:app.globalData.openid}}).then(res2 => {
        console.log("result: ",res2)
        if(res2.message[0].favorite!=undefined){
          let left_favs=[];
          let right_favs=[];
          var that=this;
          // this.data.productList.forEach(function(value,i,array){
          //   let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
          //   if(index!=-1){
          //     favs.push(true);
          //   }else{
          //     favs.push(false);
          //   }
          // })
          this.data.leftDatas.forEach(function(value,i,array){
            let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
            if(index!=-1){
              left_favs.push(true);
            }else{
              left_favs.push(false);
            }
          })
          this.data.rightDatas.forEach(function(value,i,array){
            let index=res2.message[0].favorite.findIndex(v=>v.identity==value.identity);
            if(index!=-1){
              right_favs.push(true);
            }else{
              right_favs.push(false);
            }
          })
          that.setData({
            left_favs:left_favs,
            right_favs:right_favs
          })
        }
      });
    }


    

  }
})