const myRequest=require('../../utils/request')
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    doingActivity:null,
    disableStartActivity:true,
    disableEndActivity:true,
    hasNoActivity:true,
    activityOpen:false,
    isEdit:false,
    isNew:false,
    activity:{
      id:'',
      name:'第一',
      createtime:'',
      state:'',
      joinme:'0',
      repeats:'1',
      masterName:'mastterna',
      listAward:[],
      
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
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      app.globalData.subscribeUserInfo.push((userInfo)=>{
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
      })
    }
    
    myRequest({
      url: 'http://localhost:8090/master/doingActivity',
      method: 'POST'
    }).then(res=>{
      console.log(res);
      if (!res.data.entity){
        this.setData({
          disableStartActivity: false,
          disableEndActivity: true,
          hasNoActivity:true
                });
          return;
         } 
      this.setData({ activity: res.data.entity });

      if (!app.globalData.subscribe.startLucky[this.data.activity.id]) {
        app.globalData.subscribe.startLucky[this.data.activity.id] = null;
      }
      if (!app.globalData.subscribe.closeActivity[this.data.activity.id]) {
        app.globalData.subscribe.closeActivity[this.data.activity.id] = null;
      }
      app.globalData.subscribe.joinAcvtity[this.data.activity.id] = null;

      //websocket已经建立，需手动调用订阅
      console.log('app.globalData.socketConnected:' + app.globalData.socketConnected)
      if (app.globalData.socketConnected) {

        app.wsSubscribe();
      }
 
      this.setData({
        disableStartActivity: true,
        disableEndActivity: false,
        hasNoActivity: false
      });
    })
    //.then(()=>app.openSocket()).catch(res=>console.log(res));
   

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
  
    console.log('zou');
    this.setData({ 
      disableStartActivity: true,
      isNew:true,
      isEdit:true,
      activityOpen:true
     });
  },
  openToggle(){
    if (this.data.isEdit)//编辑模式下点击不会隐藏明细
      return;

    this.setData({ activityOpen: !this.data.activityOpen });
  },
  editActivity(){ 
    this.setData({ isEdit: true });
    this.data.tmpActivity.name=this.data.activity.name;
    this.data.tmpActivity.joinme = this.data.activity.joinme;
    this.data.tmpActivity.repeats = this.data.activity.repeats;
   },
  cancelEdit(){

    if(this.data.isNew){
      this.setData({
        disableStartActivity: false,
        isNew: false,
        isEdit: false,
        activityOpen: false
      });
    }else{
      this.setData({
        isEdit: false,
        'activity.name': this.data.tmpActivity.name,
        'activity.joinme': this.data.tmpActivity.joinme,
        'activity.repeats': this.data.tmpActivity.repeats
      });
    }
  
 
  },
  nameInputChange(e){
    this.setData({'activity.name': e.detail.value })
  },
  checkJoinme(e){
    this.setData({ 'activity.joinme': e.detail.value?'1':'0'});
    console.log(this.data.activity.joinme);
  },
  checkRepeats(e) {
    this.setData({ 'activity.repeats': e.detail.value ? '1' : '0' });
  },
  activitySave(){
    let method=null;
    let notify=null;
    if(this.data.isNew){
      method ='insertActivity';
      notify='发起成功';
    }else{
      method='updateActivity';
      notify='修改成功';
    }
    myRequest({
      url: 'http://localhost:8090/master/' + method,
      method: 'POST',
      data:this.data.activity
    }).then(res => {
      console.log(res);
      if (this.data.isNew) {
        //this.data.activity.id = res.data.id;
        this.setData({
          'activity.id': res.data.id,
          isEdit:false,
          isNew: false,
          hasNoActivity: false
        });
      }else{
        this.setData({
          isEdit: false
        });
      }
    
      wx.showToast({ // 显示Toast
        title: notify,
        icon: 'success',
        duration: 1500
      })
    });
  }
})
