var app=getApp();
const isPage = require('../../utils/util').isPage
const myRequest = require('../../utils/request')
const config = require('../../utils/config')

Page({
  data: {
    attendActivityList: [],
  },
  onShareAppMessage() {
    return {
      title: '发奖了，手慢无',
      path: '/pages/attend/attend?scene=HAHA',
      imageUrl: '/image/share.jpg',
    }
  },
  onLoad: function () {
    myRequest({
      url: config.servPath + '/master/listActivity'
    })
      .then((res) => {
         console.log(res.data);
        if (!res.data.msg || res.data.code !== 0) {
          return Promise.reject(res.data.msg);
        }
        //this.data.attendActivityList = res.data.list;
        this.setData({ attendActivityList: res.data.list });
        //this.subscribe();
      })
   
  },
  onShow: function () {
    wx.hideTabBarRedDot({ index: 2 });
  },
  onUnload: function () {
    
  },
  tapRow(e){
    // 传递的参数
    let id = e.currentTarget.dataset['id'];
    this.data.detailActivityId = id;
    console.log(id);
    wx.navigateTo({ url: '../detail/detail?action=subs&id=' + id });
  }
})