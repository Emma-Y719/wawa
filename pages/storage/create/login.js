const db = wx.cloud.database();
const app = getApp();
const config = require("../../../styles/config.js");
const { getBaseUrl,requestUtil } = require("../../../utils/requestUtil.js");

Page({

      /**
       * 页面的初始数据
       */
      data: {
            ids: -1,
            name: '',
            university:"",
            campus: "",
            choosed:false,
            loc:"定位位置",
            lat:"",
            log:"",
            pic:"/icons/ride.jpg",
            baseUrl:""
      },
      choose(e) {
        wx.navigateTo({
          url: '/pages/search/campus',
        })
            //下面这种办法无法修改页面数据
            /* this.data.ids = e.detail.value;*/
      },
      onLoad(){
        var baseUrl=getBaseUrl();
        this.setData({
          baseUrl:baseUrl
        })
      },
      onShow(){
        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        var uni=wx.getStorageSync('university')
        var cam=wx.getStorageSync('campus')
        var uid=wx.getStorageSync('university')
        var cid=wx.getStorageSync('campus')

        var loc=wx.getStorageSync('loc')
        // if(loc!=null){
        //   console.log("university : "+uni)
        //   this.setData({
        //     university:uni,
        //     campus:cam,
        //     uid:uid,
        //     cid:cid,
        //     choosed:true
        //   })
        // }
        console.log(pages)
      },


      nameInput(e){
        console.log(e.detail.value)
        this.data.name = e.detail.value;
      },
      useDefault(){
        console.log(this.data.pic)
        this.setData({
          pic:"/icons/ride.jpg"
        })
      },
      choosePic(){
        this.uploadImage();
      },
        /**上传图片 */
  uploadImage:function(){
    let that=this;
    let pic="";
    wx.chooseMedia({
     count:1,
     sizeType: ['original', 'compressed'],
     sourceType: ['album', 'camera'],
     success: function(res) {
     console.log(res)
     let imgSrc = res.tempFiles;
     console.log(imgSrc)
     let path;

    pic=imgSrc[0].tempFilePath

    
     console.log(pic)

     that.setData({
      pic: pic
     })
     },
    })
    },
      getUserInfo(e) {
            let that = this;
            console.log(e);
            let test = e.detail.errMsg.indexOf("ok");
            if (test == '-1') {
                  wx.showToast({
                        title: '请授权后方可使用',
                        icon: 'none',
                        duration: 2000
                  });
            } else {
                  that.setData({
                        userInfo: e.detail.userInfo
                  })
                  that.check();
            }
      },
      handleCreate(e){
        wx.navigateTo({
          url: '/pages/storage/create/success',
        })
      },
      //校检
      handleCreate1(e) {
        let that = this;
        let name = that.data.name;
        console.log(name)
        
        if (name == '') {
          wx.showToast({
            title: '请先输入物品库名称',
            icon: 'none',
            duration: 2000
          });
          return false
        }
        //校检校区
        let ids = that.data.ids;
        let campus = that.data.campus;
        console.log("campus: "+campus)
        if (campus=="") {
              wx.showToast({
                    title: '请先获取您的校区',
                    icon: 'none',
                    duration: 2000
              });
        }else{
          let loc = that.data.loc;
          console.log("location: "+loc)
          if (loc=="定位位置") {
                wx.showToast({
                      title: '请先获取位置',
                      icon: 'none',
                      duration: 2000
                });
          }
        }



        wx.request({
          url: this.data.baseUrl+'/storage/findName',
          method:"GET",
          data:{
            name:that.data.name
          },
          success:function(res){
            console.log(res);
            if(res.data.message.length!=0){
              wx.showToast({
                title: '该物品库已注册',
                icon: 'none',
                duration: 2000
              });
            }else{
              var pic=""
              if(that.data.pic!="/icons/ride.jpg"){
                wx.cloud.uploadFile({
                  cloudPath:Date.parse(new Date())+"storage"+'.png',//图片上传时名字会覆盖，所以这边用时间戳和索引值拼的
                  //cloudPath:'uploadimage/'+Date.parse(new Date())+index+'.png',//前面加上 文件夹名字/test.png 图片就会上传到指定的文件夹下，否则按上面的会传到根目录下
                  filePath:that.data.pic, // 文件路径
                  success: res => {
                    console.log('上传云',res)
                    console.log(res.fileID)
                    pic=res.fileID
                    console.log("pic:"+pic)
                    var datacount=0;
                    requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
                      datacount=result.message[result.message.length-1].identity+1;
                      console.log("this index",datacount)
      
                      wx.request({
                        url: that.data.baseUrl+'/storage/add',
                        method:"POST",
                        data: {
                          identity: datacount,
                          name: that.data.name,
                          university:that.data.uid,
                          campus:that.data.cid,
                          log:that.data.log,
                          lat:that.data.lat,
                          pic:pic,
                          userid:app.globalData.openid
                        },
                        success: function (res) {
                          console.log(res);
                          wx.showModal({
                            title: '',
                            content: '创建成功！去发布吧～',
                            complete: (res) => {
                              if (res.cancel) {
                                wx.reLaunch({
                                  url: '/pages/storage/index',
                                })
                              }
                              if (res.confirm) {
                                wx.reLaunch({
                                  url: '/pages/promote/index',
                                })
                              }
                            }
                          })
                        }
                      })
      
                    })
                  },
                  fail: err => {
                    console.log('上传云err',err)
                  // handle error
                  }
                  


                })

              }else{
                pic=that.data.pic
              }


            }
          }
        }
        
        
        )

        /////检验这个号码是都有人注册了
        // wx.cloud.callFunction({
        //   name: 'yunrouter',
        //   data: {
        //     $url: "checkname", //云函数路由参数
        //     name: that.data.name,
        //   },
        //   success: res => {
        //     console.log(res)
        //     if(res.result!=null){
        //       if (res.result.data.length!=0) {//如果有人注册

        //         wx.showToast({
  
        //           title: '物品库名称重复',
  
        //           icon: 'none',
  
        //           duration: 2000
  
        //         });
  
        //         return false
  
        //       }
        //     }

        //     ////如果没有重读的话
        //     // wx.showLoading({
        //     //   title: '正在提交',
        //     // })
        //     wx.cloud.callFunction({
        //       name: 'yunrouter',
        //       data: {
        //         $url: "loginstorage", //云函数路由参数
        //         name: that.data.name,
        //         campus: that.data.campus[that.data.ids],
        //         stamp: new Date()
        //       },
        //       success: res => {
        //         console.log(res)
        //         // app.globalData.userInfo = that.data.userInfo;
        //         // app.globalData.openid = res.result.data.OPENID
        //         wx.switchTab({
        //           url: '/pages/storage/create/success',
        //         })
        //       },
        //       fail() {
        //         wx.hideLoading();
        //         wx.showToast({
        //           title: '注册失败，请重新提交',
        //           icon: 'none',
        //         })
        //       }
        //     });
        //   },
        //   fail() {
        //     wx.hideLoading();
        //     wx.showToast({
        //       title: '注册失败，请重新提交',
        //       icon: 'none',
        //     })
        //   }
        // });

      }
})