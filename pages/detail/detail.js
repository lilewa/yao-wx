const myRequest = require('../../utils/request')
const app = getApp()
const config = require('../../utils/config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityOpen:true,
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
})