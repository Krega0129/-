// pages/LSK/mine/dynamicDetail/dynamicDetail.js
import {
  loadingOff,
  loadingOn,
  showToast,
  previewImage
} from '../../../../utils/util'
import {
  deleteDynamicById
} from '../../../../service/socialty'
import {
  BASE_URL,
  K_config
} from '../../../../service/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dynamicDetails: {},
    baseurl: '',
    userId: wx.getStorageSync('userId')
  },
  deleteDynamic: function () {
    wx.showModal({
      content: '是否删除该动态?',
      showCancel: true,
      title: '提示',
      success: (res) => {
        if (res.confirm) {
          deleteDynamicById({
            shareId: this.data.dynamicDetails.shareId
          }).then((res) => {
            
            if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_deleteDynamic_SUCCESS) {
              
              loadingOff()
              let pages = getCurrentPages();
              let prevPage = null; //上一个页面
              if (pages.length >= 2) {
                prevPage = pages[pages.length - 2]; //上一个页面
              }
              if (prevPage) {
                let i = this.data.dynamicDetails.index
                // let count='dynamicList['+i+'].count'
                prevPage.setData({
                  // [count]: this.data.dynamicDetails.count
                  deleteIndex: i
                });
                prevPage.refreshPage();
              }
              showToast('删除成功', 1000)
              setTimeout(() => {
                wx.navigateBack({         //返回上一页  
                 delta: 1
               })
              }, 1000);
              
            }
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    loadingOn('加载中')
    const dynamicDetails = JSON.parse(options.item)
    console.log(dynamicDetails);
    this.setData({
      baseurl: BASE_URL,
      // userId:userId,
      dynamicDetails: dynamicDetails
    })
    setTimeout(function () {
      loadingOff()
    }, 1000)
  },
  // 查看图片
  _previewImage(e){
    console.log(e.currentTarget.dataset.image);
    previewImage( [e.currentTarget.dataset.image], e.currentTarget.dataset.image)
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
    this.setData({
      userId: wx.getStorageSync('userId')
    })
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