const myRequest = require('../../utils/request')
const app = getApp()
const config = require('../../utils/config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityOpen:true,
    subs:false,
    activity: {
      id: '',
      name: '',
      createtime: '',
      state: '',
      joinme: '0',
      repeats: '0',
      masterName: '',
      listAward: [],

    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    myRequest({
      url: config.servPath + '/master/activityDetail',
      data: { id: options.id}
    }).then(res => {
      console.log(res);
      if(res.data.code===0){
        this.setData({ activity: res.data.detail});
      }
    });
    //需要订阅通知
    if (options.action==='subs'){
      this.data.subs=true;
      this.subscribe();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if(this.data.subs){
      app.globalData.subscribe.startLucky.onReceiver.detailActivity = null;
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '来玩啦！靓仔',
      path: '/pages/attend/attend?scene='+this.data.activity.id,
      imageUrl: '/image/share.jpg',
    }
  },

  openToggle() {
    if (this.data.isEdit)//编辑模式下点击不会隐藏明细
      return;

    this.setData({ activityOpen: !this.data.activityOpen });
  },
  toggleAward(e) {

    let index = e.currentTarget.dataset['index'];
    let prop = 'activity.listAward[' + index + '].open';
    this.setData({ [prop]: !this.data.activity.listAward[index].open })
  },

  subscribe() {

    //设置本页面收到通知的回调 抽奖结果的通知
    app.globalData.subscribe.startLucky.onReceiver.detailActivity = (mes) => {
      console.log(mes.body);
      let data = JSON.parse(mes.body);
      let activityId = data.listAwardPlayer[0].activityId;
      let awardId = data.listAwardPlayer[0].awardId;
   
      for (let i = 0; i < this.data.activity.listAward.length; i++) {
        if (this.data.activity.listAward[i].awardId === awardId) {
          this.data.activity.listAward[i].listPlayer = data.listAwardPlayer;
          let row = 'activity.listAward[' + i + ']';
          this.setData({ row: this.data.activity.listAward[i] });
          break;
        }
      }
     
    }
    // //设置本页面收到通知的回调 结束抽奖的通知
    // app.globalData.subscribe.closeActivity.onReceiver.detailActivity = (mes) => {
    //   let data = JSON.parse(mes.body);
    //   console.log(mes.body);
    //   if (data.code !== 0) {
    //     return;
    //   }
    //   //判断是不是本人发起的活动，不是的话忽略
    //   if (data.activityId !== this.data.activity.id) {
    //     return
    //   } 
    // }
  },
})