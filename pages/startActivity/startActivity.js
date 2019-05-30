const myRequest=require('../../utils/request')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    doingActivity:null,
    startLoading:false,
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse){
 
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
      
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   console.log('else');

    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
    
    // myRequest({
    //   url: 'http://localhost:8090/master/attendActivityList',
    //   method: 'POST'
    // }).then(res=>{
    //   console.log(res);
    //   if (!res.data.entity)
    //     return;

    //   this.doingActivity = res.data.entity;
    //   this.setData({ doingActivity: res.data.entity });


    //   if (!app.globalData.subscribe.startLucky[this.doingActivity.id]) {
    //     app.globalData.subscribe.startLucky[this.doingActivity.id] = null;
    //   }
    //   if (!app.globalData.subscribe.closeActivity[this.doingActivity.id]) {
    //     app.globalData.subscribe.closeActivity[this.doingActivity.id] = null;
    //   }
    //   app.globalData.subscribe.joinAcvtity[this.doingActivity.id] = null;

    //   //websocket已经建立，需手动调用订阅
    //   console.log('app.globalData.socketConnected:' + app.globalData.socketConnected)
    //   if (app.globalData.socketConnected) {

    //     app.wsSubscribe();
    //   }
    // }).catch(res=>console.log(res));
   

  },    
  
  onShow: function () {
    wx.hideTabBarRedDot({ index: 0, fail: function () { console.log('fail') } });
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  dang() {
    myRequest({
      url: 'http://localhost:8090/master/attendActivityList',
      method: 'POST'}
      )
      .then(res=>{console.log(res)});
  
  },
  bindStartTap(){
    
    if (this.startLoading){
      return;
    }
    console.log('zou');
    this.startLoading = true;
    this.setData({ startLoading: true });
    
  }
})
