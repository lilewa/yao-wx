//const Stomp = require('../../utils/stomp.js').Stomp;
//var stompClient ;
var app=getApp();
Page({
  data: {
    logs: [],
    stompClient: null,
    dang:'sha'
  },
  onLoad: function () {
    console.log('list');
    var that=this;
    app.globalData.stompClient.subscribe('/sub/joinAcvtity/10', function (message, headers) {
      console.log("收到joinAcvtity消息：" + message.body);//body中为具体消息内容
      that.dang='haha';
      that.setData({
        dang: 'haha'
      })
    });
   
  },
  onUnload: function () {
    // 取消订阅
    console.log('unload list');
   // subscribeChatGroup.unsubscribe();
  },
  tap(){
     
    //wx.showTabBarRedDot({ index: 2, fail: function () { console.log('fail') } });
    // wx.request({
    //   url: 'http://localhost:8090/master/listActivity',
    //   method:'POST',
    //   data: {
    //     masterId: "123"
    //   },
    //   success: function (res){
    //     console.log(res.data);
    //   },
    // })
  },
  openSocket() {
    // var socket = this.socket = new qcloud.Tunnel(tunnelUrl)

    // 发送消息
    function sendSocketMessage(msg) {
      wx.sendSocketMessage({
        data: msg
      })
    }

    // 关闭连接
    function close() {
      wx.closeSocket();
    }
    // 符合WebSocket定义的对象
    var ws = {
      send: sendSocketMessage,
      close: close 
       
    }

 

    wx.onSocketOpen(() => {
      console.log('WebSocket 已连接')
      ws.onopen();
    })

    // // 监听服务器推送消息
    // wx.onSocketMessage(message => {
    //   console.log('socket message:', message);
    //   ws.onmessage(res);
    // })
    // 监听 WebSocket 接受到服务器的消息事件
    wx.onSocketMessage(function (res) {
      console.log('socket message:');
      ws.onmessage(res);
    })

    wx.onSocketError(error => {
      console.error('socket error:', error)

    })

    wx.onSocketClose(() => {
      console.log('WebSocket 已断开')
    })

    const Stomp = require('../../utils/stomp.js').Stomp;

  

    // Stomp.setInterval = function (interval, f) {
    //   return setInterval(f, interval);
    // };
    // // 结束定时器的循环调用
    // Stomp.clearInterval = function (id) {
    //   return clearInterval(id);
    // };
    Stomp.setInterval = function () { }
    Stomp.clearInterval = function () { }
    const stompClient = Stomp.over(ws);

    this.data.stompClient = stompClient;
    // 打开信道
    wx.connectSocket({
      url: 'ws://localhost:8090/messageServer',
      method: "GET",
      success: ()=> {
        console.log('cheng');
        stompClient.connect({}, function (callback) {
          // 订阅自己的
          console.log('ph');
          stompClient.subscribe('/sub/joinAcvtity/10', function (message, headers) {
            console.log("收到joinAcvtity消息：" + message.body);//body中为具体消息内容
          });
          // 向服务端发送消息
          stompClient.send("/user/joinAcvtity/10", {});
        });
      }

    })
   
  },
  dang(){
    getApp().dang();
  },
  

})