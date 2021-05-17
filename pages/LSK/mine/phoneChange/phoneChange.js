// pages/mine/phoneChange/phoneChange.js
const app = getApp()
import {
  BASE_URL
} from '../../../../service/config'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEmpty: false,
    phoneNumber: ''
  },
  inputListener(e) {
    let value = e.detail.value;
    if (value.length === 0 || value === null) {
      this.setData({
        isEmpty: true
      })
    }
    else {
      this.setData({
        isEmpty: false,
        phoneNumber:value
      })
    }
  },
  clearInput() {
    this.setData({
      phoneNumber: '',
      isEmpty: true
    })
  },
  phoneModify() {
    let telStr = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/;
    if(!(telStr.test(this.data.phoneNumber))){
      wx.showToast({
        icon:'none',
        title: '手机号码格式不正确',
      });
    }
    else{
      wx.showToast({
        title: '修改成功',
      });
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        });  
      }, 1000);  
      app.globalData.phoneNumber=this.data.phoneNumber;
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      phoneNumber: app.globalData.phoneNumber,
    })
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
  onShareAppMessage(options) {
    return {
      title: '啰咪校园',
      path: '/pages/WCH/home/home',
      imageUrl: BASE_URL + '/images/logo.png'
    }
  }
})