import { loadingOff, showToast } from '../../../../utils/util';
import { getTip }from '../../../../service/userInfo';
import {
  BASE_URL,
  K_config
} from '../../../../service/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    textValue:'',
    type: 'business'
  },

  _getTip(){
    getTip({
      type: this.data.type,
      address: wx.getStorageSync('address')
    }).then((res) => {
      loadingOff()
      console.log(res); 
      if(res.data.code === K_config.STATECODE_getTip_SUCCESS || res.data.code === K_config.STATECODE_SUCCESS){
        this.setData({
          textValue: res.data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getTip()
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