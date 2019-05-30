
module.exports = function (obj){

  return new Promise( (resolve, reject) =>{
    obj.success = function (res) {
      resolve(res);
    };
    obj.fail = function (res) {
      reject("系统异常，请重试！")
    };
    wx.request(obj);
  }).catch(res=>res).then(
    res=>{
      if (res.data.code !== 401.1){
        //已经登录直接返回
        return res;
      }else{
        //未登录，从微信服务器获取code后再次请求
        return new Promise((resolve, reject) => {
          //{errMsg: "login:ok", code: "0614Drl70nsnRE1Yp7n709dtl704Drlh"}
          console.log('获取 code');
          wx.login({success: res => {resolve(res.code)}})
        })
        .then(code=>{ 
          console.log('再发请求');
          obj.url+='?code='+code;
          return new Promise((resolve, reject) => {
            obj.success = function (res) {
              resolve(res);
            };
            obj.fail = function (res) {
              reject("系统异常，请重试！")
            };
             wx.request(obj);
             })
        })
      }
    }
  )
}