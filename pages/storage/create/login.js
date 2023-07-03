const db = wx.cloud.database();
const app = getApp();
const config = require("../../../styles/config.js");
const { getBaseUrl,requestUtil } = require("../../../utils/requestUtil.js");
wx.cloud.init();
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
      uploadFileToCloud(filePath){
        return new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath: Date.parse(new Date()) + '.png',
            filePath: filePath,
            success: res => {
              console.log('上传云', res)
              console.log(res.fileID)
              resolve(res.fileID);
            },
            fail: err => {
              console.log('上传云err', err)
              reject(err);
            }
          });
        });
      },

async handleuploadpic(){
  var pic=""
  if(this.data.pic!="/icons/ride.jpg"){
    try{
      const fileID=await this.uploadFileToCloud(this.data.pic);
      pic=fileID;
    }catch (error) {
      console.log('上传图片失败', error);
    }
  }else{
    pic=this.data.pic
  }
  console.log("pic url: ",pic)
  var datacount=0;
  var that=this;
  requestUtil({url:'/storage/findAll',method:"GET"}).then(result=>{
    datacount=result.message[result.message.length-1].identity+1;
    console.log("this index",datacount)

    requestUtil({
      url: '/storage/add',
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
        db.collection('user').where({
          _openid: app.globalData.openid
        }).update({
          data: {
            storage: db.command.push([datacount])
          }
        })

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
        that.handleuploadpic();
        // requestUtil({
        //   url: '/storage/findName',
        //   method:"GET",
        //   data:{
        //     name:that.data.name
        //   },
          
        //   success:function(res){
        //     let self=that;
        //     console.log(res);
        //     if(res.data.message.length!=0){
        //       wx.showToast({
        //         title: '该物品库已注册',
        //         icon: 'none',
        //         duration: 2000
        //       });
        //     }else{
        //       console.log("upload!")
        //      self.handleuploadpic();

        //     }
        //   }
        // }
        
        
        // )

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