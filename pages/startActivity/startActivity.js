const myRequest=require('../../utils/request')
const app = getApp()

Page({
  data: {
    dang:'niu',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    disableStartActivity:true,
    disableEndActivity:true,
    hasNoActivity:true,
    activityOpen:false,
    isEdit:false,
    isNew:false,
    popup: null,
    popupAward: { name: '', amount: 1, index:-1},
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
  // //事件处理函数
  // bindViewTap: function() {
  //   wx.navigateTo({
  //     url: '../logs/logs'
  //   })
  // },
  onLoad: function () {

    //获取页面弹出框
    this.data.popup=this.selectComponent('#popup');
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      //订阅获得用户信息回调
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

      //没在其他页面订阅过
      if (!app.globalData.subscribe.startLucky[this.data.activity.id]) {
        app.globalData.subscribe.startLucky[this.data.activity.id] = null;
      }
       //没在其他页面订阅过
      if (!app.globalData.subscribe.closeActivity[this.data.activity.id]) {
        app.globalData.subscribe.closeActivity[this.data.activity.id] = null;
      }
      app.globalData.subscribe.joinAcvtity[this.data.activity.id] = null;

      //websocket已经建立，需手动调用订阅
      console.log('app.globalData.socketConnected:' + app.globalData.socketConnected)
      if (app.globalData.socketConnected) {

        app.wsSubscribe();
      }

      //设置 参加活动的websocket通知 回调
      app.globalData.subscribe.joinAcvtity.onReceiver.startActivity =  (mes)=> {
        console.log(mes.body);
         
        this.setData({
          dang: 'haha'
        })
        //如果当前页不是此tab需要亮红点
      }
      app.globalData.subscribe.startLucky.onReceiver.startActivity = (mes) => {
        console.log(mes.body);
        //判断是不是本人发起的活动，不是的话忽略
        this.setData({
          dang: 'haha'
        })
       //如果当前页不是此tab需要亮红点

      }
      app.globalData.subscribe.closeActivity.onReceiver.startActivity = (mes) => {
        console.log(mes.body);
        //判断是不是本人发起的活动，不是的话忽略
        this.setData({
          dang: 'haha'
        })
        //如果当前页不是此tab需要亮红点

      }

      this.setData({
        disableStartActivity: true,
        disableEndActivity: false,
        hasNoActivity: false
      });
    })
    .then(()=>app.openSocket()).catch(res=>console.log(res));
   

  },    
  
  onShow: function () {
    wx.hideTabBarRedDot({ index: 0, fail: function () { console.log('fail') } });
  },
  getUserInfo: function(e) {
    if(e.detail.userInfo)
      app.setUserinfo(e.detail.userInfo);
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
  },
  setpopupAwardName(e){
    this.data.popupAward.name = e.detail.value;
  },
  setpopupAwardNum(e) {
    this.data.popupAward.amount=e.detail.value;
  },
  newAword() {
    this.data.popup.show();
  },
  //弹出框输入名称人数，确定后增加奖项
  confirmAward(){
    if(!this.data.popupAward.name){
      return;
    }
    //修改
    if (this.data.popupAward.index>-1){
      let index = this.data.popupAward.index;
      let award = {
        id: this.data.activity.listAward[index].id,
        name: this.data.popupAward.name,
        amount: this.data.popupAward.amount
      }
      myRequest({
        url: 'http://localhost:8090/master/updateAward',
        method: 'POST',
        data: award
      }).then(res => {
        let name = 'activity.listAward[' + index + '].name';
        let amount = 'activity.listAward[' + index + '].amount';
        this.setData({
          [name]: this.data.popupAward.name,
          [amount]: this.data.popupAward.amount,
          'popupAward.name': '',
          'popupAward.amount': 1,
          'popupAward.index': -1,
        });
      

        // 显示Toast
        wx.showToast({ 
          title: '修改成功',
          icon: 'success',
          duration: 1500
        });
      });
    
    }else{
      //增加
      let award = {
        activityId: this.data.activity.id,
        name: this.data.popupAward.name,
        amount: this.data.popupAward.amount,
        state: '0',
        open: true
      };
      myRequest({
        url: 'http://localhost:8090/master/insertAward',
        method: 'POST',
        data: award
      }).then(res => {
        award.id = res.data.id;
        //console.log(award);
        this.data.activity.listAward.unshift(award);
        //成功
        this.setData({
          'activity.listAward': this.data.activity.listAward,
          'popupAward.name': '',
          'popupAward.amount': 1,
          'popupAward.index': -1,
        });
        // 显示Toast
        wx.showToast({
          title: '增加成功',
          icon: 'success',
          duration: 1500
        });
      });
    }
   
  },
  cancelAward(){
    this.setData({
      'popupAward.name':'',
      'popupAward.amount': 1,
      'popupAward.index': -1,
    });
  },
  toggleAward(e){
   
    let index = e.currentTarget.dataset['index'];
    let prop = 'activity.listAward[' + index + '].open';
    this.setData({ [prop]: !this.data.activity.listAward[index].open})
  },
  startLucky(e){
    let id = e.currentTarget.dataset['id'];
    console.log(id);
  },
  updateAward(e) {
    let index = e.currentTarget.dataset['index'];
    this.data.popupAward.index = index;
    this.setData({
      'popupAward.name':this.data.activity.listAward[index].name,
      'popupAward.amount': this.data.activity.listAward[index].amount
    })
    this.data.popup.show();

  },
  deleteAward(e) {
    
    let index = e.currentTarget.dataset['index'];
    myRequest({
      url: 'http://localhost:8090/master/deleteAward',
      method: 'POST',
      data: this.data.activity.listAward[index]
    }).then(res => {
      this.data.activity.listAward.splice(index, 1)
      this.setData({
        'activity.listAward': this.data.activity.listAward
        })
      // 显示Toast
      wx.showToast({
        title: '删除成功',
        icon: 'success',
        duration: 1500
      });
    });
  },
  dang() {
    this.data.popup.show();
  },
})
