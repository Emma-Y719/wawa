// components/SearchBar/SearchBar.js
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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onNavi1(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let route=pages[pages.length-1].route
      if(route!='pages/index/index'){
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }
    },
    onNavi2(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let route=pages[pages.length-1].route
      if(route!='pages/favorite/index'){
        wx.reLaunch({
          url: '/pages/favorite/index',
        })
      }
    },
    onNavi3(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let route=pages[pages.length-1].route
      if(route!='pages/example/chatroom_example/message'){
        wx.reLaunch({
          url: '/pages/example/chatroom_example/message',
        })
      }
    },
    onNavi4(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
     
      if(route!='pages/my/index'){
        if(route=="pages/promote/index"){
          cur.onTab('/pages/my/index');
        }else{
          wx.reLaunch({
            url: '/pages/my/index',
          })
        }
      }
    },
    onNavi5(){
      let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
      let cur=pages[pages.length-1]
      let route=cur.route
      if(route!='pages/promote/index'){
        wx.reLaunch({
          url: '/pages/promote/index',
        })
      }
    }
  }
})
