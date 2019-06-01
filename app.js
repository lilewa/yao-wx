//app.js
App({
  onLaunch: function () {
 
    this.globalData.sessionId = wx.getStorageSync('sessionId') ;
   // console.log('sessionId:'+this.globalData.sessionId);
     
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

      //  this.openSocket();
      // 展示本地存储能力
    // var logs = wx.getStorageSync('sessionId') || []
    //logs.unshift(Date.now())
    //  wx.setStorageSync('logs', logs)
  },
  onHide(){
    console.log('close socket')
    wx.closeSocket();
  },
 
  globalData: {
    userInfo: null,
    stompClient:null,
    socketConnected:false,
    sessionId:'',
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
        onReceiver:{allPage:null}
      }
    }
  },
  //收到websocket消息后调用每个页面订阅的方法
  dispatch(mes, onReceiver){ 
    for (let method in onReceiver){
      if (onReceiver[method])
        onReceiver[method](mes);
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
            (mes) => {this.dispatch(mes,this.globalData.subscribe[method].onReceiver)}
              );
        }
       
      }
    console.log(this.globalData.subscribe);
  },
  openSocket(){

    //let that = this;
    // socket是否连接
   // let socketConnected = false;
    // 待发送的消息队列
    //let messageQueue = [];
    // 是否断线重连
    let reconnect = true;
    let reconnectCount=3;
    // 发送消息
    function sendSocketMessage(msg) {
      wx.sendSocketMessage({
        data: msg
      })
    }

    // 关闭连接
    function close() {
      if (this.globalData.socketConnected) {
        wx.closeSocket()
        this.globalData.socketConnected = false;
      }
    }
    // 符合WebSocket定义的对象
    var ws = {
      send: sendSocketMessage,
      close: close
    }

    function connect() {
      // 打开信道
      wx.connectSocket({
        url: 'ws://localhost:8090/messageServer',
        success: () => {
          console.log('stomp connect');
          stompClient.connect({},  (callback)=> {
            this.wsSubscribe();
            console.log('ding');
           });
        }
      })
    }


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
          connect();
        }
      }
    })

    wx.onSocketClose(() => {
      console.log('WebSocket 已断开');
      this.globalData.socketConnected = false;
    })

    const Stomp = require('utils/stomp.js').Stomp;

    Stomp.setInterval = function (interval, f) {
      return setInterval(f, interval);
    };
    // 结束定时器的循环调用
    Stomp.clearInterval = function (id) {
      return clearInterval(id);
    };
 
    const stompClient = Stomp.over(ws);

    this.globalData.stompClient = stompClient;

    connect();

  },
  duan() {
    wx.closeSocket({
      success: () => {
        console.log('Socket已断开');
        //this.setData({ socketStatus: 'closed' })
      }
    })
  },
  fa() {
    // 向服务端发送消息
    this.globalData.stompClient.send("/user/joinAcvtity/10", {});
  },
  dang(){
    console.log('socketConnected:' + this.globalData.socketConnected);
  }
  
})