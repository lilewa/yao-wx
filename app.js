const config = require('utils/config')
const Stomp = require('utils/stomp.js').Stomp;
App({
  onLaunch: function () {
 
    //this.globalData.sessionId = wx.getStorageSync('sessionId') ;
     
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) { 
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => { 
               // 可以将 res 发送给后台解码出 unionId
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
               
              this.setUserinfo(res.userInfo);
            }
          })
        }
      }
    })
    this.prepareSocket();
    //this.openSocket();
      // 展示本地存储能力
    // var logs = wx.getStorageSync('sessionId') || []
    //logs.unshift(Date.now())
    //  wx.setStorageSync('logs', logs)
  },
  onHide:function(){
   // this.globalData.stompClient.disconnect();
  },
  globalData: {
    promise:null,
    holdActivityId:'',
    isAdd:false,
    joinme:'0',
    userInfo: null,
    stompClient:null,
    socketConnected:false,
    activityNum:0,
    subscribeUserInfo:[],
    subscribe:{
      startLucky:{
        onReceiver:{
          startActivity: null,
          attend:null,
          detailActivity:null,
        }
      },
      joinAcvtity:{
        onReceiver: {
          startActivity: null,
          attend: null,
          detailActivity: null,
        } 
      },
      closeActivity:{
        onReceiver:{
          startActivity: null,
          attend: null,
          detailActivity: null,
        }
      }
    }
  },
  //收到websocket消息后调用每个页面订阅的方法
  dispatch(mes, onReceiver,method){
   // console.log(this.globalData.subscribe);

    for (let page in onReceiver){
      if (onReceiver[page])
        onReceiver[page](mes); 
    }
    //console.log(method);
    mes.ack();
    //结束订阅
    if (method === 'closeActivity') {
    
      let data = JSON.parse(mes.body);  
      //console.log('结束');
      //console.log(this.globalData.subscribe);
      if (this.globalData.subscribe.startLucky[data.activityId]){
        this.globalData.subscribe.startLucky[data.activityId].unsubscribe();
        delete this.globalData.subscribe.startLucky[data.activityId];
      }
      if (this.globalData.subscribe.joinAcvtity[data.activityId]){
        this.globalData.subscribe.joinAcvtity[data.activityId].unsubscribe();
        delete this.globalData.subscribe.joinAcvtity[data.activityId];
      }
      if (this.globalData.subscribe.closeActivity[data.activityId]){
       this.globalData.subscribe.closeActivity[data.activityId].unsubscribe();
       delete this.globalData.subscribe.closeActivity[data.activityId];
     }
      console.log(this.globalData.activityNum);
      if (this.globalData.activityNum<1){
        this.globalData.stompClient.disconnect(function () {
          console.log("websocket closed");
          
        });
      }
      //console.log(this.globalData.subscribe);
     }
   
  },
 setUserinfo(userInfo){
   this.globalData.userInfo = userInfo ;
   for (let func of this.globalData.subscribeUserInfo){
     func(userInfo);
   }
 },
  wsSubscribe(){
    let that=this;
    for (let method in this.globalData.subscribe){
      for (let id in this.globalData.subscribe[method]){
        if (!this.globalData.subscribe[method][id])
          this.globalData.subscribe[method][id] = this.globalData.stompClient.subscribe('/sub/' + method + '/' + id, 
            (mes) => { this.dispatch(mes, this.globalData.subscribe[method].onReceiver, method)}
              );
        }
       
      }
    //console.log(this.globalData.subscribe);
  },
  openSocket(){
    if (this.globalData.socketConnected)
      return Promise.resolve();
    //防止重复调用
    if (this.globalData.promise){
      return this.globalData.promise;
    }
    return this.globalData.promise= new Promise((resolve, reject) => {
      wx.connectSocket({
        url: config.wsPath + '/messageServer',
        success: () => {
          console.log('stomp connect');
          this.globalData.stompClient.connect({}, (callback) => { resolve(); });
        },
        fail: () => { reject('websocket连接失败') }
      })
    });
  },
  prepareSocket(){
 
    let that = this;
    // socket是否连接
   // let socketConnected = false;
    // 待发送的消息队列
    //let messageQueue = [];
    // 是否断线重连
    let reconnect = true;
    let reconnectCount=3;


    // 符合WebSocket定义的对象
    var ws = {
      send: sendSocketMessage,
      close: close
    }
    // 发送消息
    function sendSocketMessage(msg) {
      wx.sendSocketMessage({
        data: msg
      })
    }
    // 关闭连接
    function close() {
      console.log('diaoduan')
      if (that.globalData.socketConnected) {
        wx.closeSocket()
        that.globalData.socketConnected = false;
        that.globalData.promise=null;
      }
    }

    Stomp.setInterval = function (interval, f) {
      return setInterval(f, interval);
    };
    // 结束定时器的循环调用
    Stomp.clearInterval = function (id) {
      return clearInterval(id);
    };

    this.globalData.stompClient = Stomp.over(ws);
 
    wx.onSocketOpen(() => {
      console.log('WebSocket 已连接')
      this.globalData.socketConnected = true;
      ws.onopen();
    })

    // 监听服务器推送消息
    wx.onSocketMessage(message => {
      console.log('socket message:');
      ws.onmessage(message);
    })


    wx.onSocketError(error => {
      console.error('socket error:', error)
      if (!this.globalData.socketConnected) {
        // 断线重连
        if (reconnect && reconnectCount>0) {
          reconnectCount--;
          //connect();
          this.globalData.openSocket();
        }
      }
    })

    wx.onSocketClose(() => {
      console.log('WebSocket 已断开');
      this.globalData.socketConnected = false;
    })
  
  }
 
  
})