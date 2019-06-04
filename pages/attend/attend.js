const myRequest = require('../../utils/request')
var app=getApp();

Page({
  data: {
    logs: [],
    attendActivityList:[],
    dang:'dang',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
  },
  onLoad: function (query) {
    // this.setData({
    //   logs: (wx.getStorageSync('logs') || []).map(log => {
    //     return util.formatTime(new Date(log))
    //   })
    // })
    const scene= decodeURIComponent(query.scene)
    console.log(scene);
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      app.globalData.subscribeUserInfo.push((userInfo) => {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
      })
    }
    
    let that =this;
    app.globalData.subscribe.startLucky.onReceiver.attend=function(mes){
      console.log(mes);
      that.dang = 'haha';
      that.setData({
        dang: 'haha'
      })
    }
  myRequest({
      url: 'http://localhost:8090/master/attendActivityList',
      method:'POST'
      })
      .then((res)=>{
        console.log(res.data);
        this.attendActivityList=res.data.list;
        this.setData({attendActivityList: res.data.list});
        
        for (let i = 0; i < this.attendActivityList.length;i++){
          if (this.attendActivityList[i].status!=='2'){
            if(!app.globalData.subscribe.startLucky[this.attendActivityList[i].id]){
              app.globalData.subscribe.startLucky[this.attendActivityList[i].id]=null;
            }
            if (!app.globalData.subscribe.closeActivity[this.attendActivityList[i].id]) {
              app.globalData.subscribe.closeActivity[this.attendActivityList[i].id] = null;
            }
          }
        }
        //websocket已经建立，需手动调用订阅
        console.log('app.globalData.socketConnected:' + app.globalData.socketConnected)
        if (app.globalData.socketConnected) {
          console.log('atten');
          app.wsSubscribe();
        }
       
      })
       
 
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo)
      app.setUserinfo(e.detail.userInfo);
  },
  onShow: function () {
    wx.hideTabBarRedDot({ index: 1, fail: function () { console.log('fail') } });
  },
  dang() {
    console.log(this.data.userInfo);
  },
  tapRow: function (e) {
    // 传递的参数
    let id = e.currentTarget.dataset['id'];
    console.log(id);
  }
})
