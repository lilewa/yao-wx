Component({
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: ''
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmText: {
      type: String,
      value: '确定'
    } 
  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
   
    hide() {
      this.setData({
        showModal: false
      })
    },

    show() {
      this.setData({
        showModal: true
      })
    },

    

    _onCancel() {
      this.hide();
      this.triggerEvent("cancel")
    },

    _onConfirm() {
      this.hide();
      this.triggerEvent("confirm")
    }
  }
})