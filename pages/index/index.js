//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    baseUrl: 'http://127.0.0.1:5000/',
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    langArray: {}, // 语言dict
    langName: [], // 语言数组
    associateData: [], // 联想翻译结果
    fromLang: '中文',
    toLang: '英语',
    fromIndex: 0, // 开始语言数组下标
    toIndex: 1, // 结束语言数组下标
    fromData: '', //翻译内容
    toData: '', // 翻译结果
    isShowToData: false, //是否显示翻译结果
    isShowAssociate: false, //是否显示联想结果
    detailData: '', // 详情结果
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var that = this;
    // 获取翻译的语言
    wx.request({
      url: this.data.baseUrl + 'getLanguage',
      method: 'post',
      success: function (res) {
        that.setData({
          langArray: res.data.data,
          langName: res.data.values,
        })
      }
    })
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  // 选择开始语言
  bindFromPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      fromLang: this.data.langName[e.detail.value],
      fromIndex: e.detail.value
    })
    console.log(this.data.fromLang)
  },
  // 选择结束语言
  bindToPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      toLang: this.data.langName[e.detail.value],
      toIndex: e.detail.value
    })
  },
  // 在输入框中输入内容，触发相应事件
  bindTextAreaBlur: function (e) {
    var that = this;
    this.setData({
      fromData: e.detail.value
    })
    if(e.detail.value == null || e.detail.value == '') {
      this.setData({
        isShowToData: false,
        isShowAssociate: false
      })
    }else {
      this.setData({
        isShowAssociate: true
      })
    }
    wx.request({
      url: this.data.baseUrl + 'getAssociateResult/', 
      method: 'post',
      data: {
        'kw': e.detail.value
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({
          associateData: res.data.data
        })
      }
    })
  },
  // 点击翻译按钮触发时间
  translate: function (e) {
    var that = this;
    wx.request({
      url: that.data.baseUrl + 'translate',
      method: 'post',
      data: {
        'query': that.data.fromData,
        'from': ""+this.data.langArray[this.data.fromLang],
        'to': ""+this.data.langArray[this.data.toLang],
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        that.setData({
          toData: res.data.trans[0].dst,
          isShowToData: true,
          isShowAssociate: false,
          detailData: res.data.dict.length != 0 ?res.data.dict.symbols[0].parts[0].means : ''
        })
      }
    })
    console.log(this.data.detailData)
    
  },
  // 点击叉号重置输入内容
  cancle: function(e) {
    this.setData({
      fromData: '',
      isShowToData: false,
      isShowAssociate: false
    })
  }
})
