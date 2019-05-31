const myRequest=require('../../utils/request')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    doingActivity:null,
    startLoading:true,
    endLoading:true,
    hasNoActivity:true,
    activityOpen:false,
    edit:false,
    che:true,
     activity:{
      id:'',
      name:'第一',
      createtime:'',
      state:'',
      joinme:false,
      repeats:false
    },
    tmpActivity:{
      name: '第一', 
      joinme: false,
      repeats: false
    }
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    // if (app.globalData.userInfo) {
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // } else if (this.data.canIUse){
 
    //   // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //   // 所以此处加入 callback 以防止这种情况
    //   app.userInfoReadyCallback = res => {
      
    //     this.setData({
    //       userInfo: res.userInfo,
    //       hasUserInfo: true
    //     })
    //   }
    // } else {
    //   console.log('else');

    //   // 在没有 open-type=getUserInfo 版本的兼容处理
    //   wx.getUserInfo({
    //     success: res => {
    //       app.globalData.userInfo = res.userInfo
    //       this.setData({
    //         userInfo: res.userInfo,
    //         hasUserInfo: true
    //       })
    //     }
    //   })
    // }
    
    // myRequest({
    //   url: 'http://localhost:8090/master/attendActivityList',
    //   method: 'POST'
    // }).then(res=>{
    //   console.log(res);
    //   if (!res.data.entity){
          // this.startLoading=false;
          // this.endLoading=false;
          // this.hasNoActivity=true;
          // this.setData({
          //   startLoading: false,
          //   endLoading: false,
          //   hasNoActivity:true
          //       });
          //       return;
      //    }
    //     

    //   this.doingActivity = res.data.entity;
    //   this.setData({ doingActivity: res.data.entity });


    //   if (!app.globalData.subscribe.startLucky[this.doingActivity.id]) {
    //     app.globalData.subscribe.startLucky[this.doingActivity.id] = null;
    //   }
    //   if (!app.globalData.subscribe.closeActivity[this.doingActivity.id]) {
    //     app.globalData.subscribe.closeActivity[this.doingActivity.id] = null;
    //   }
    //   app.globalData.subscribe.joinAcvtity[this.doingActivity.id] = null;

    //   //websocket已经建立，需手动调用订阅
    //   console.log('app.globalData.socketConnected:' + app.globalData.socketConnected)
    //   if (app.globalData.socketConnected) {

    //     app.wsSubscribe();
    //   }
        // this.startLoading = false;
        // this.endLoading = false;
        // this.hasNoActivity = false;
        // this.setData({
        //   startLoading: false,
        //   endLoading: false,
        //   hasNoActivity: false
        // });
    // }).then(()=>app.openSocket()).catch(res=>console.log(res));
   

  },    
  
  onShow: function () {
    wx.hideTabBarRedDot({ index: 0, fail: function () { console.log('fail') } });
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  dang() {
    myRequest({
      url: 'http://localhost:8090/master/attendActivityList',
      method: 'POST'}
      )
      .then(res=>{console.log(res)});
  
  },
  bindStartTap(){
    if (this.data.startLoading){
      return;
    }
    console.log('zou');
    this.setData({ startLoading: true });
  },
  openToggle(){
    if(this.data.edit)//编辑模式下点击不会隐藏明细
      return;

    this.setData({ activityOpen: !this.data.activityOpen });
  },
  editActivity(){ 
    this.setData({ edit: true });
    this.data.tmpActivity.name=this.data.activity.name;
    this.data.tmpActivity.joinme = this.data.activity.joinme;
    this.data.tmpActivity.repeats = this.data.activity.repeats;
      
   },
  cancelEdit(){
    this.setData({ edit: false });

    this.setData({ 'activity.name': this.data.tmpActivity.name });
    this.setData({ 'activity.joinme': this.data.tmpActivity.joinme })
    this.setData({ 'activity.repeats': this.data.tmpActivity.repeats })
  },
  nameInputChange(e){
    this.setData({'activity.name': e.detail.value })
  },
  checkJoinme(e){
    this.setData({ 'activity.joinme': e.detail.value});
  },
  checkRepeats(e) {
    this.setData({ 'activity.repeats': e.detail.value });
  },
  activitySave(){
    
  }
})
