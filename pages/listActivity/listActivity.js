var app=getApp();
const isPage = require('../../utils/util').isPage

Page({
  data: {
    logs: [],
    stompClient: null,
    dang:'sha'
  },
  onShareAppMessage() {
    return {
      title: '发奖了，手慢无',
      path: '/pages/attend/attend',
      imageUrl: '/image/share.jpg',
    }
  },
  onLoad: function () {
 
   
  },
  onShow: function () {
    wx.hideTabBarRedDot({ index: 2 });
  },
  onUnload: function () {
    
  },
 
  dang(){
    getApp().dang();
  },
  

})