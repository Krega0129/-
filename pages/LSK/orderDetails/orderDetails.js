// pages/orderDetails/orderDetails.js
import{loadingOn,loadingOff}from '../../../utils/util'
import {
  BASE_URL
} from '../../../service/config'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // // 订单信息
    // orderDetails: {
    //   // 店铺名
    //   shopName: '阿巴阿巴',
    //   // 店铺号码
    //   shopNumber: '156 0232 9916',
    //   // 货物信息
    //   orderItem: [{
    //     itemName: '海贼王三兄弟奶茶',
    //     itemImg: '../../assets/img/LSK/MilkTea.jpg',
    //     itemNum: 1,
    //     itemPrice: 9.9,
    //     specification:'正常糖/少冰'
    //   }, {
    //     itemName: '超级汉堡王',
    //     itemImg: '../../assets/img/LSK/hamburger.jpg',
    //     itemNum: 3,
    //     itemPrice: 8.8,
    //     specification:null
    //   }, {
    //     itemName: '海贼王无敌薯条',
    //     itemImg: '../../assets/img/LSK/French-fries.jpg',
    //     itemNum: 2,
    //     itemPrice: 19.99,
    //     specification:null
    //   }],
    //   // totalMoney:233,
    //   // 订单号
    //   orderNumber: '1111 2222 3333 4444 555',
    //   // 支付方式
    //   payMethod: '微信支付',
    //   // 下单时间
    //   orderTime: '2020-10-16 21:33',
    //   // 订单备注
    //   remarks:'阿巴阿巴'
    // },
    // // 配送信息
    // diliveryMsg: {
    //   diliveryPrice: 3.5,
    //   diliveryAddress: '广东工业大学大学城校区西生活区三栋326',
    //   diliveryMethod: '送货上楼',
    //   diliverTime: '2020-10-16 22:23',
    //   diliverPhoneNumber:'152 1860 2709'
    // },
    // // 收货人信息
    // consigneeMsg: {
    //   name: '林澍锴',
    //   phoneNumber: '156 0232 9916'
    // }
    orderDetails:[],
    status:'',
  },
  // 计算总价
  // totalMoney() {
  //   let that = this.data.orderDetails;
  //   let totalPrice = 0;
  //   let itemPrice = 0;
  //   for (let i = 0; i < that.orderItem.length; i++) {
  //     itemPrice = that.orderItem[i].itemPrice * that.orderItem[i].itemNum;
  //     totalPrice = totalPrice + itemPrice;
  //   }
  //   totalPrice=totalPrice+this.data.diliveryMsg.diliveryPrice
  //   this.setData({
  //     totalMoney: totalPrice
  //   })
  // },
  // 复制订单号
  copyMsg: function () {
    let that = this;
    wx.setClipboardData({
      //准备复制的数据
      data: that.data.orderDetails.orderNumber,
      success: function (res) {
        wx.showToast({
          title: '内容已复制',
        });
      }
    })
  },
  // 打开模态框
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  // 关闭模态框
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  copyPhoneNumber(){
    let that = this;
    let phoneNumber=that.data.orderDetails.businessPhone
    // if(that.data.modalName==='bottomModalDili'){
    //  phoneNumber=that.data.orderDetails.shopNumber
    // }
    // else if(that.data.modalName==='bottomModalShop'){
    //   phoneNumber=that.data.diliveryMsg.diliverPhoneNumber
    // }  
    wx.setClipboardData({
      //准备复制的数据
      data:phoneNumber,
      success: function (res) {
        wx.showToast({
          title: '内容已复制',
        });
        that.setData({
          modalName: null
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
      loadingOn('加载中')
      const orderDetails =JSON.parse(options.item)
      console.log(orderDetails);
      let status=''
      if(orderDetails.status===0){
        status='订单待支付'
      }else if(orderDetails.status===1||orderDetails.status===2){
        status='商家待接单'
      }else if(orderDetails.status===3){
        status='商家已接单'
      }else if(orderDetails.status===4){
        status='订单待送达'
      }else if(orderDetails.status===5){
        status='订单已完成'
      }else if(orderDetails.status===6){
        status='已退款'
      }else if(orderDetails.status===7){
        status='订单已取消'
      }
      this.setData({
        orderDetails:orderDetails,
        status:status
      }) 
      setTimeout(function () {
        loadingOff()
      }, 1000)   

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