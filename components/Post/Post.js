Component({
  properties: {
    // 这里定义了innerText属性，属性值可以在组件使用时指定
    postData: {
      type: Object,
      value:{
        big_picture:null,
        title:'title',
        price:null,
        decription:null,
        distance:'distance',
        university:'university',
        campus:'campus',
        icons:[],
      }
    },
  },
  data: {
    iconList: {
      star: "https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358203237485.png",
      chat: "https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/16927941358704793585.png",
      edit:"https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/3962ccf2e7bd3fbbc8d2c973a7c5998a.png",
      delete:"",
      recover:"https://codefun-proj-user-res-1256085488.cos.ap-guangzhou.myqcloud.com/64e4c32a5a7e3f03100cd3d5/64e5fbe4ab696a00113fcdc0/5d028b81869ca4f681476761e3e33046.png",
    }
  }
});