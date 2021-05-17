import { loadingOff, showToast } from '../../../../utils/util';
import { commitAdvise }from '../../../../service/userInfo';
import {
  BASE_URL,
  K_config
} from '../../../../service/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    max: 150,
    num: 0,
    textareaAValue:''
  },
  // 评论文字计数
  inputNum(e) {
    let value = e.detail.value;
    // 获取输入框内容的长度
    let len = parseInt(value.length);
    this.setData({
      num:len,
      textareaAValue: e.detail.value
    })
  },
  // 表单提交
  formSuggest(){
    // console.log(this.data.textareaAValue);
    if(this.data.textareaAValue==""){
      wx.showToast({
        icon:'none',
        title: '内容不能为空',
      });
    }
    else{
    commitAdvise({
      advise: this.data.textareaAValue,
      userId: wx.getStorageSync('userId')
    }).then((res) => {
        loadingOff()
        if(res.data.code===K_config.STATECODE_commitAdvise_SUCCESS || res.data.code===K_config.STATECODE_SUCCESS){
          wx.showToast({
            title: '提交成功',
          });
          setTimeout(function () {
            wx.navigateBack({
              delta: 1
            });  
          }, 1000);  
        }else if(res.data.code === K_config.STATECODE_commitAdvise_FALSE){
          showToast('每天只能提交一次', 1000)
        }  
    })
 
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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