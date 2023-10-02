// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:"cloud1-4g6bmgze1a238f21"
})

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
  console.log(context);
  try {
    const result = await cloud.openapi.cloudbase.sendSms({
      env: 'cloud1-4g6bmgze1a238f21',//在云开发控制台中的环境ID
      content: '有内奸！！！停止交易', //短信内容
      phoneNumberList: [
        "+86"+event.name   //要发送的手机号码，我这是方法中传过来的号码，可以先写死测试
      ]
    })
    return result
  } catch (err) {
    return err
  }
}