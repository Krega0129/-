// pages/mine/personInfo/personInfo.js
import{loadingOn,loadingOff,showToast}from '../../../../utils/util'
import { updateUserInfo , updatePhoto }from '../../../../service/userInfo'
import {
  BASE_URL,
  K_config
} from '../../../../service/config'
const app = getApp()
const userId = wx.getStorageSync('userId')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sex: ['男', '女'],
    index:0,
    userMsg:{},
    baseurl:''
  },
  headChange() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const file = res.tempFilePaths;
        // console.log(file);
        
        const name='用户头像'
        that.upload(that, file)
      },
      fail: function (errInfo) { console.info(errInfo) }
    })
  },
  
upload(page, path) {
  let that = this
    wx.uploadFile({
      url: BASE_URL + "/modifyShopInfo/updatePhoto",
      filePath: path[0], 
      name: 'file',
      header: { 
        'userToken': wx.getStorageSync('token'),
        "Content-Type": "multipart/form-data" },
      formData: {
        //和服务器约定的token, 一般也可以放在header中
        'session_token': wx.getStorageSync('session_token')
      },
      success: function (res) {
        let data=JSON.parse(res.data)
        console.log(data);    
        const head=data.data
        updateUserInfo({head,userId}).then((res)=>{
          if(res.data.code===K_config.STATECODE_updateUserInfo_SUCCESS || res.data.code===K_config.STATECODE_SUCCESS){
            showToast('头像更新成功',1000)
          }
        })
        that.setData({
          'userMsg.head':head
        })
      },
      fail: function (res) {
        showToast('头像上传失败，请检查网络')
      },
    })
},

 

  nameChange(e) {
    const name=e.currentTarget.dataset.nickname
    wx.navigateTo({
      url: '/pages/LSK/mine/nameChange/nameChange?nickname='+name
    })
  },
  phoneChange() {
    wx.navigateTo({
      url: '/pages/mine/phoneChange/phoneChange',
    })
  },
  sexChange(e) {
    const sex = e.detail.value    
    updateUserInfo({ sex , userId }).then((res)=>{
      loadingOff()
      if(res.data.code===K_config.STATECODE_updateUserInfo_SUCCESS || res.data.code===K_config.STATECODE_SUCCESS){
        showToast('更新成功',1000)
      }
    })
    this.setData({
      index: e.detail.value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // loadingOn('加载中')
    const userMsg =JSON.parse(options.userMsg)
    this.setData({
      userMsg:userMsg,
      index:userMsg.sex,
      baseurl: BASE_URL
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