Component({
  /**
   * 组件的初始数据
   */
  data: {
      privacyContractName: '',
      showPrivacy: false,
      isTextVisible: false
  },
  /**
   * 组件的生命周期
   */
  pageLifetimes: {
      show() {
          const _ = this
          if(this.isBaseLibraryVersionGreaterThan("2.32.3")){
            wx.getPrivacySetting({
              success(res) {
                  if (res.errMsg == "getPrivacySetting:ok") {
                      _.setData({
                          privacyContractName: res.privacyContractName,
                          showPrivacy: true
                      })
                  }
              },
              fail(e){
                console.log(e);
              }
          })
          }else{
            this.setData({
              showPrivacy:true
            })
          }
          

      }
  },
  /**
   * 组件的方法列表
   */
  methods: {
      // 点击按钮切换文本块的显示状态
      toggleText: function () {
        this.setData({
          isTextVisible: !this.data.isTextVisible
        });
      },
      // 判断基础库版本是否大于指定版本
 isBaseLibraryVersionGreaterThan(targetVersion) {
  // 获取微信小程序基础库版本
  const wxVersion = wx.getSystemInfoSync().SDKVersion;
  
  // 将版本号字符串转换为数字并进行比较
  const wxVersionNum = parseFloat(wxVersion);
  const targetVersionNum = parseFloat(targetVersion);

  // 如果基础库版本大于指定版本，则返回 true，否则返回 false
  if (!isNaN(wxVersionNum) && !isNaN(targetVersionNum)) {
    return wxVersionNum > targetVersionNum;
  } else {
    console.error('无效的版本号');
    return false;
  }
},
handleagree(){
  if(!this.isBaseLibraryVersionGreaterThan("2.32.3")){
    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }, 1000); 
  }

},
handledeny(){
  if(!this.isBaseLibraryVersionGreaterThan("2.32.3")){
  // 在按钮的点击事件处理函数中调用 navigateBackMiniProgram 方法
  wx.navigateBackMiniProgram({
    success: function () {
      console.log('退出小程序成功');
    },
    fail: function (err) {
      console.error('退出小程序失败', err);
    }
  });
  }


},
      // 打开隐私协议页面
      openPrivacyContract() {
          const _ = this
          wx.openPrivacyContract({
              fail: () => {
                  wx.showToast({
                      title: '遇到错误',
                      icon: 'error'
                  })
              }
          })
      },
      // 拒绝隐私协议
      exitMiniProgram() {
          // 直接退出小程序
          wx.exitMiniProgram()
      },
      // 同意隐私协议
      handleAgreePrivacyAuthorization() {
          const _ = this

          _.setData({
              showPrivacy: false
          })
          let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
          let cur=pages[pages.length-1]
          let route=cur.route
          
          if(route=='pages/wait/wait'){
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/index/index',
              })
            }, 1000);  
          }
      },
  },
})