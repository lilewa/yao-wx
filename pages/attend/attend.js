const myRequest = require('../../utils/request')
const app=getApp();
const config = require('../../utils/config')

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
      url: config.servPath +'/master/attendActivityList',
      method:'POST'
      })
      .then((res)=>{
        console.log(res.data);
        this.attendActivityList=res.data.list;
        this.setData({attendActivityList: res.data.list});
        this.subscribe();
      })
  },
  subscribe(){
    
    for (let i = 0; i < this.attendActivityList.length; i++) {
      if (this.attendActivityList[i].status !== '2') {
        if (!app.globalData.subscribe.startLucky[this.attendActivityList[i].id]) {
          app.globalData.subscribe.startLucky[this.attendActivityList[i].id] = null;
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
    //设置本页面收到通知的回调 参加活动的通知
    app.globalData.subscribe.joinAcvtity.onReceiver.attend = (mes) => {
      let data = JSON.parse(mes.body);
      if (data.code !== 0) {
        return;
      }
      this.data.attendActivityList.unshift(data.activity);
      this.setData({ 'attendActivityList': this.data.attendActivityList});
   
      //如果当前页不是此tab需要亮红点
    }

    //设置本页面收到通知的回调 抽奖结果的通知
    app.globalData.subscribe.startLucky.onReceiver.attend = (mes) => {
      console.log(mes.body);
      //判断是不是本人发起的活动，不是的话忽略
      this.setData({
        dang: 'haha'
      })
      //如果当前页不是此tab需要亮红点

    }
    //设置本页面收到通知的回调 结束抽奖的通知
    app.globalData.subscribe.closeActivity.onReceiver.attend = (mes) => {
      console.log(mes.body);
      //判断是不是本人发起的活动，不是的话忽略
      this.setData({
        dang: 'haole'
      })
      //如果当前页不是此tab需要亮红点

    }
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo)
      app.setUserinfo(e.detail.userInfo);
  },
  onShow: function () {
    wx.hideTabBarRedDot({ index: 1, fail: function () { console.log('fail') } });
  },
  tapRow: function (e) {
    // 传递的参数
    let id = e.currentTarget.dataset['id'];
    console.log(id);
  },
  attendActivity(activityId) {
    //先订阅，后发消息参加
    if (!app.globalData.subscribe.joinAcvtity[activityId]){
      console.log('mei')
      app.globalData.subscribe.joinAcvtity[activityId] =
        app.globalData.stompClient.subscribe('/sub/joinAcvtity/' + activityId,
        (mes) => { app.dispatch(mes, app.globalData.subscribe.joinAcvtity.onReceiver) }
        );
    }
   
    let activityPlayer = {
      activityId: activityId,
      playerName: this.data.userInfo.nickName,
      avatarUrl: this.data.userInfo.avatarUrl
    };
    app.globalData.stompClient.send("/app/joinAcvtity/" + activityId, {}, JSON.stringify(activityPlayer));
  },
  dang() {
    // if (this.data.attendActivityList.find)
    // if (!app.globalData.subscribe.joinAcvtity[this.data.activity.id]){

    // }
    this.attendActivity('5319b7c0-5385-4545-84d6-eafd1dd8987');
  }
})
