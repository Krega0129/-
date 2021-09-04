// pages/LSK/sociality/releaseDynamic/releaseDynamic.js
import { loadingOn, loadingOff, showToast } from '../../../../utils/util'
import { addDynamic } from '../../../../service/socialty'
import {
  BASE_URL,
  K_config
} from '../../../../service/config'
// import { threadId } from 'worker_threads'
const userId = wx.getStorageSync('userId')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    max: 150,
    num: 0,
    textareaAValue: '',
    index: null,
    // 上传图片地址
    imgList: [],
    // 定位校区
    localCampus: '',
    returnImgUrl:'',
    shareContent:''
  },
  // 文字计数
  inputNum(e) {
    let value = e.detail.value;
    // 获取输入框内容的长度
    let len = parseInt(value.length);
    this.setData({
      num: len,
      textareaAValue: e.detail.value
    })
  },

  ChooseImage() {
    let that = this
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        console.log(res.tempFilePaths);
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          const file = res.tempFilePaths;
          this.setData({
            imgList: file
          })
          // that.upload(that, file)
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张照片吗',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  // 上传图片
  upload(page, path) {
    let that = this
    wx.uploadFile({
      url: BASE_URL + "/shareschool/updatePhoto",
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
        let data = JSON.parse(res.data)
        addDynamic({
          userId,
          shareContent:that.data.shareContent,
          sharePicture: data.data.name,
          shareAddress: that.data.localCampus
        }).then((res) => {
          showToast('发布成功，请等待管理员审核',1000)
          loadingOff()
        })
        wx.navigateBack()
      },
      fail: function (res) {
        showToast('图片上传失败，请检查网络')
      },
    })
  },
  // 提交动态
  submitDynamic(e) {
    let { shareContent } = e.detail.value
    this.setData({
      shareContent:shareContent
    })
    wx.showModal({
      title: '发布动态',
      content: '确定发布此动态？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if( this.data.imgList.length !== 0){
          this.upload(this, this.data.imgList) 
        }else if(this.data.shareContent.length !== 0 && this.data.imgList.length === 0){
          addDynamic({
            userId,
            shareContent:this.data.shareContent,
            shareAddress: this.data.localCampus
          }).then((res) => {
            loadingOff()   
            showToast('发布成功，请等待管理员审核',1000)
          })      
          wx.navigateBack()
        }else{
          showToast('上传不能为空',1000)
        }
      }
    })


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      localCampus: wx.getStorageSync('address')
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