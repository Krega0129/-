// pages/mine/addressList/addressLIst.js
import{getAllAddress}from '../../../../service/address'
import { loadingOff } from '../../../../utils/util';
import { BASE_URL } from '../../../../service/config'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    addressList: [
      // {
      //   campus: '中山大学',
      //   detailedAddress: '西三433',
      //   name: '吴昌辉',
      //   sex: '先生',
      //   phoneNumber: 2,
      //   isDefault:1
      // },
      // {
      //   campus: '广东工业大学',
      //   detailedAddress: '西三604',
      //   name: '林澍锴',
      //   sex: '女士',
      //   phoneNumber: 3,
      //   isDefault:0
      // }, 
      // {
      //   campus: '广东工业大学',
      //   detailedAddress: '西三639',
      //   name: '李泽强',
      //   sex: '先生',
      //   phoneNumber:4,
      //   isDefault:0
      // }, 
      // {
      //   campus: '广东工业大学',
      //   detailedAddress: '西三604',
      //   name: '林澍锴',
      //   sex: '先生',
      //   phoneNumber: 5,
      //   isDefault:0
      // }
    ],
    // 判断是否登录
    isLogin : true
  },
  // 修改地址
  goToAddressModify: function (e) {
    wx.navigateTo({
      url: '../addressModify/addressModify?item='+JSON.stringify(e.currentTarget.dataset.item)
    })
  },
  // 新增地址
  addAddress:function(){
    wx.navigateTo({
      url: '../addressModify/addressModify'
    })
  },
   // 跳转到登录页
   toLogin: function () {
    wx.navigateTo({
      url: '/pages/WCH/login/login',
    })
  },
  // 获取地址列表
  setAllAddress:function(){
    let userId = wx.getStorageSync('userId')
    getAllAddress(userId).then((res)=>{
      loadingOff()
      // console.log(res.data.data);
      const addressList=[]
      for(const item of res.data.data){
        const addresssItem={
          receiveId:item.receiveId,
          userId:item.userId,
          sex:item.sex,
          campus:item.campus,
          detailedAddress:item.detailedAddress,
          isDefault:item.isDefault,
          contactPhone:item.contactPhone,
          contactName:item.contactName
        }
        addressList.push(addresssItem)
      }
      this.setData({
        addressList:addressList
      })

    })
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
    if(!wx.getStorageSync('token')){
      this.setData({
        isLogin:false
      })
    }else{
      this.setAllAddress()
    }
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