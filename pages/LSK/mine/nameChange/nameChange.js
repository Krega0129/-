import{loadingOn,loadingOff,showToast}from '../../../../utils/util'
import { updateUserInfo }from '../../../../service/userInfo'
import {
  K_config,
  BASE_URL
} from '../../../../service/config'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEmpty: false,
    name: ''
  },
  // 监听字数
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
        name:value
      })
    }
  },
  // 清空输入框
  clearInput() {
    this.setData({
      name: '',
      isEmpty: true
    })
  },
  // 修改姓名
  nameModify() {
    let reg = /^[\w\u4e00-\u9fa5]{2,12}$/;
    if(!reg.test(this.data.name)){
      wx.showToast({
        icon:'none',
        title: '姓名格式不正确',
      });
    }
    else{
      const userId=wx.getStorageSync('userId')
      const nickname=this.data.name
      updateUserInfo({userId,nickname}).then((res)=>{
        loadingOff()
        if(res.data.code===K_config.STATECODE_updateUserInfo_SUCCESS || res.data.code===K_config.STATECODE_SUCCESS){
          showToast('修改成功',1000)
          let pages = getCurrentPages();
          let currPage = null; //当前页面
          let prevPage = null; //上一个页面
          if (pages.length >= 2) {
              currPage = pages[pages.length - 1]; //当前页面
              prevPage = pages[pages.length - 2]; //上一个页面
          }
          if(prevPage){
              prevPage.setData({
                'userMsg.nickname':nickname
              });
          }
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });  
          }, 1000);  
        }else{
          showToast('网络异常',1000)
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      name: options.nickname,
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