const myRequest = require('../../utils/request')
const app=getApp();
const config = require('../../utils/config')
const isPage = require('../../utils/util').isPage

Page({
  data: {
    detailActivityId:'',
    logs: [],
    attendActivityList:[],
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasUserInfo: false,
  },
  onShareAppMessage() {
    return {
      title: '系兄弟就来砍我玩',
      path: '/pages/attend/attend?scene=' + app.globalData.holdActivityId,
      imageUrl:'/image/share.jpg',
    }
  },
  onLoad: function (query) {
    // this.setData({
    //   logs: (wx.getStorageSync('logs') || []).map(log => {
    //     return util.formatTime(new Date(log))
    //   })
    // })
    let scene;
    if (query.scene){
      scene = decodeURIComponent(query.scene)
    }
    
    console.log('query:' + scene);
      
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
    
    this.setReceiver();
    myRequest({
      url: config.servPath +'/master/attendActivityList' 
      })
      .then((res)=>{
       // console.log(res.data);
        if (!res.data.msg || res.data.code !== 0) {
          return Promise.reject(res.data.msg||'服务异常');
        }
        this.attendActivityList=res.data.list;
        this.setData({attendActivityList: res.data.list});
        return this.subscribe();
      }).then(()=>{ 
        if (scene){
          if(app.globalData.holdActivityId==scene){
            return;
          }
          if (app.globalData.userInfo){
            this.attendActivity(scene);
          }else{
            app.globalData.subscribeUserInfo.push((userInfo) => {
              this.attendActivity(scene);
            })
           }
        } 
      }).catch(res => wx.showToast({ title: res.errMsg, icon: 'none' }));
  },
  setReceiver(){
    //设置本页面收到通知的回调 参加活动的通知
    app.globalData.subscribe.joinAcvtity.onReceiver.attend = (mes) => {
      let data = JSON.parse(mes.body);
      if (data.code !== 0) {
        wx.showToast({ title: data.msg, icon: 'none'})
        return;
      }
      if (app.globalData.holdActivityId && app.globalData.holdActivityId === data.activity.id) {
        if (app.globalData.joinme === '0') {
          return;
        }
        if (app.globalData.isAdd) {
          return;
        } else {
          app.globalData.isAdd = true;
        }
      }
      app.globalData.activityNum++;
      this.data.attendActivityList.unshift(data.activity);
      this.setData({ 'attendActivityList': this.data.attendActivityList });

      //如果当前页不是此tab需要亮红点
      if (!isPage('attend')) {
        wx.showTabBarRedDot({ index: 1 });
      }
    }

    //设置本页面收到通知的回调 抽奖结果的通知
    app.globalData.subscribe.startLucky.onReceiver.attend = (mes) => {

      let data = JSON.parse(mes.body); 
      let activityId = data.listAwardPlayer[0].activityId;
      //本人发起的活动，但本人不参加，返回
      if (app.globalData.holdActivityId && app.globalData.holdActivityId === activityId) {
        if (app.globalData.joinme === '0') {
          return;
        }
      }
      //正在详情页浏览此活动，返回
      if (this.data.detailActivityId === activityId) {
        return;
      }
     
      for (let i = 0; i < this.data.attendActivityList.length; i++) {
        if (this.data.attendActivityList[i].id === activityId) {
          this.data.attendActivityList[i].start = true;
          let row = 'attendActivityList[' + i + ']';
          this.setData({ [row]: this.data.attendActivityList[i] });
          break;
        }
      }

      //如果当前页不是此tab需要亮红点
      if (!isPage('attend')) {
        wx.showTabBarRedDot({ index: 1 });
      }
    }
    //设置本页面收到通知的回调 结束抽奖的通知
    app.globalData.subscribe.closeActivity.onReceiver.attend = (mes) => {
      
      let data = JSON.parse(mes.body);
      //console.log(data);
      let activityId = data.activity.id;
     
      //本人发起的活动，但本人不参加，返回
      if (app.globalData.holdActivityId && app.globalData.holdActivityId === activityId) {
        if (app.globalData.joinme === '0') {
          return;
        } 
       
      }
      app.globalData.activityNum--;

      //正在详情页浏览此活动，返回
      if (this.data.detailActivityId === activityId) {
        return;
      }
      //console.log('hao');
      for (let i = 0; i < this.data.attendActivityList.length; i++) {
        if (this.data.attendActivityList[i].id === activityId) {
          this.data.attendActivityList[i].end = true;
          this.data.attendActivityList[i].state='2';
          this.data.attendActivityList[i].endtime = data.activity.endtime;
          let row = 'attendActivityList[' + i + ']';
          this.setData({ [row]: this.data.attendActivityList[i] });
          break;
        }
      }

      //如果当前页不是此tab需要亮红点
      if (!isPage('attend')) {
        wx.showTabBarRedDot({ index: 1 });
      }
    }
  },
  subscribe(){
    
    for (let i = 0; i < this.attendActivityList.length; i++) {
      if (this.attendActivityList[i].status !== '2') {
        app.globalData.activityNum++;
        if (!app.globalData.subscribe.startLucky[this.attendActivityList[i].id]) {
          app.globalData.subscribe.startLucky[this.attendActivityList[i].id] = null;
        }
        if (!app.globalData.subscribe.closeActivity[this.attendActivityList[i].id]) {
          app.globalData.subscribe.closeActivity[this.attendActivityList[i].id] = null;
        }
      }
    }
    //websocket已经建立，需手动调用订阅
   // console.log('app.globalData.socketConnected:' + app.globalData.socketConnected)
    //if (app.globalData.socketConnected) {
    if(app.globalData.activityNum > 0){
      return app.openSocket().then(() => { app.wsSubscribe() });
    }else{
      return Promise.resolve();
    }
    //}
 
  },
  getUserInfo: function (e) {
    if (e.detail.userInfo)
      app.setUserinfo(e.detail.userInfo);
  },
  onShow: function () {
    wx.hideTabBarRedDot({ index: 1});
    this.data.detailActivityId='';
    console.log('app.globalData.activityNum:' + app.globalData.activityNum)
    if (app.globalData.activityNum > 0)
      app.openSocket();
  },
  tapRow: function (e) {
    // 传递的参数
    let id = e.currentTarget.dataset['id'];
    let index = e.currentTarget.dataset['index'];
    this.data.detailActivityId = id;
    let state = this.data.attendActivityList[index].state;
    this.data.attendActivityList[index].start = false;
    this.data.attendActivityList[index].end = false;

    let row = 'attendActivityList[' + index + ']';
    this.setData({ [row]: this.data.attendActivityList[index] });
    if(state==='0'){
      wx.navigateTo({ url: '../detail/detail?action=subs&id=' + id })
    }else{
      wx.navigateTo({ url: '../detail/detail?id=' + id })
    }
    
  },

  attendActivity(activityId){
    console.log('attendActivity');
    for (let i = 0; i < this.data.attendActivityList.length; i++) {
      if (this.data.attendActivityList[i].id == activityId) {
        wx.showToast({ title: '已经参加过这次活动', icon: 'none' });
        return;
      }
    }
    //console.log(1);
    if (!app.globalData.subscribe.joinAcvtity[activityId]) {
      //参加活动的通知,添加需要订阅的id
      app.globalData.subscribe.joinAcvtity[activityId] = null;
      //结束活动的通知,添加需要订阅的id
      app.globalData.subscribe.closeActivity[activityId] = null;
      //活动抽奖的通知,添加需要订阅的id
      app.globalData.subscribe.startLucky[activityId] = null;
    } 
    console.log(2);

    //订阅
    app.openSocket().then(() => { app.wsSubscribe() }).then(()=>{
      let activityPlayer = {
        activityId: activityId,
        playerName: this.data.userInfo.nickName,
        avatarUrl: this.data.userInfo.avatarUrl
      };
      console.log('socketConnected:' + app.globalData.socketConnected);

      app.globalData.stompClient.send("/app/joinAcvtity/" + activityId, {}, JSON.stringify(activityPlayer));
    });
   
  },
  scanCode(){
    const that = this
    wx.scanCode({
      success:(res)=> {
        console.log(res.result);
        //let scanId='';
        //this.attendActivity(scanId);
      },
      fail() { }
    });
  },
  dang() {
    // if (this.data.attendActivityList.find)
    // if (!app.globalData.subscribe.joinAcvtity[this.data.activity.id]){

    // }
   // this.attendActivity('5319b7c0-5385-4545-84d6-eafd1dd8987');

    this.data.attendActivityList[0].start = true;
    this.data.attendActivityList[0].end=true;
    this.setData({ 'attendActivityList[0]': this.data.attendActivityList[0]});
  }
})
