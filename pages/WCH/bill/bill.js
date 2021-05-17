// pages/WCH/bill/bill.js
import {
  H_config
} from '../../../service/config'

import {
  getAllAddress,
  getAllAddressByCampus,
  orderNewOrder,
  selectUpdateCondition
} from '../../../service/bill'

import {
  formatTime,
  showToast,
  pay
} from '../../../utils/util'

const app = getApp()
Page({
  data: {
    shopId: null,
    shopName: null,
    imgUrl: null,
    cartList: [],
    totalPrice: 0,
    sendPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2),
    packPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2),
    chooseLocation: false,
    changeLocation: false,
    // 当前地址
    locationList: [],
    user: {},
    takeAway: true,
    // 商家信息
    storeAddress: '',
    storeTelNum: '',
    imgUrl: '',
    // 自提预留手机号
    userTel: null,
    // 配送时间
    index: 0,
    // 显示的时间
    picker: ['立即'],
    // 真实的时间
    realTime: [],
    // 餐具
    // ind: null,
    // tableWare: ['不要餐具', '1份', '2份', '3份'],
    // 用来记录备注信息，以备二次编辑
    remarkObj: null,
    remark: '',
  },
  onLoad: function (options) {
    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('emitStoreAddress', data => {
      app.culPrice(data.cartList, Number(wx.getStorageSync('sendPrice')))
      this.setData({
        shopId: data.shopId,
        shopName: data.shopName,
        storeAddress: data.storeAddress,
        storeTelNum: data.storeTelNum,
        imgUrl: data.imgUrl,
        cartList: data.cartList,
        totalPrice: app.globalData.totalPrice,
        totalCount: app.globalData.totalCount
      })
    })

    let currentTime = new Date()
    for(let i = 1; i < 8; i++) {
      let date = formatTime(currentTime)
      this.data.realTime.push(date)
      let time = date.split(' ')[1].substring(0, 5)
      if(i !== 1) {
        this.data.picker.push(time)
      }
      currentTime = currentTime.getTime() + 900000
      currentTime = new Date(currentTime)
    }

    this.setData({
      picker: this.data.picker,
      sendPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2)
    })
  },
  onShow: function () {
    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('finishRemark', (data) => {
      this.setData({
        remark: data.remark
      })
    })
    wx.getStorageSync('token') && this._getAllAddressByCampus()
    this.setData({
      sendPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2),
      packPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2)
    })
  },
  takeAway() {
    app.culPrice(this.data.cartList, Number(wx.getStorageSync('sendPrice')))
    this.setData({
      takeAway: true,
      sendPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2),
      totalPrice: app.globalData.totalPrice
    })
  },
  selfTake() {
    app.culPrice(this.data.cartList, Number(this.data.packPrice))
    this.setData({
      takeAway: false,
      sendPrice: 0,
      totalPrice: app.globalData.totalPrice
    })
  },
  PickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  // 选餐具
  // tableWareChange(e) {
  //   this.setData({
  //     ind: e.detail.value
  //   })
  // },
  editRemark() {
    wx.navigateTo({
      url: '/pages/WCH/remarks/remarks',
      success: res => {
        if(this.data.remarkObj) {
          res.eventChannel.emit('editRemark', {remarkObj: this.data.remarkObj})
        }
      }
    })
  },
  _getAllAddressByCampus() {
    getAllAddressByCampus({
      campus: wx.getStorageSync('address'),
      userId: wx.getStorageSync('userId')
    }).then(res => {
      if(res && res.data && res.data.code === H_config.STATECODE_getAllAddress_SUCCESS) {
        let addressList = res.data.data
        this.setData({
          locationList: addressList
        })
      }
      wx.hideLoading()
    })
  },
  changeLocation() {
    if(wx.getStorageSync('userId')) {
      this._getAllAddressByCampus()
      this.setData({
        changeLocation: true
      })
    } else {
      this.login()
    }
  },
  login() {
    wx.login({
      success: res => {
        if(res.errMsg == "login:ok") {
          const code = res.code
          wx.navigateTo({
            url: '/pages/WCH/login/login',
            success: res => {
              res.eventChannel.emit('code',{ code: code })
            }
          })
        } else {
          showToast('网络异常，请重试！',)
        }
      }
    })
  },
  cancleChangeLocation() {
    this.setData({
      changeLocation: false
    })
  },
  selectLocation(e) {
    this.setData({
      changeLocation: false,
      chooseLocation: true,
      user: e.currentTarget.dataset.user
    })
  },
  editLocation(e) {
    wx.navigateTo({
      url: '/pages/WCH/editLocation/editLocation',
      success: res => {
        res.eventChannel.emit('editLocation', {user: e.currentTarget.dataset.user, index: e.currentTarget.dataset.index})
      }
    })
  },
  newLocation() {
    wx.navigateTo({
      url: '/pages/WCH/editLocation/editLocation',
      success: res => {
        res.eventChannel.emit('addNewAddress')
      }
    })
  },
  inputTel(e) {
    this.setData({
      userTel: e.detail.value
    })
  },
  order() {
    // 检查手机号码格式
    if(!this.data.takeAway && !/^1\d{10}$/.test(this.data.userTel)) {
      showToast('手机号格式错误，请重新填写!')
    // 检查是否授权
    } else if(!wx.getStorageSync('token')) {
      this.login()
    // 检查是否选择收货地址
    } else if(this.data.takeAway && !this.data.chooseLocation) {
      showToast('请先选择收货地址!')
    } else {
      // 整个订单大对象
      const order = {
        businessPhone: this.data.storeTelNum,
        orderCommodities: [],
        remarks: this.data.remark,
        shopAddress: this.data.storeAddress + '(' + wx.getStorageSync('address') + ')',
        shopId: this.data.shopId,
        shopName: this.data.shopName,
        shopPicture: this.data.imgUrl || '',
        totalAmount: this.data.totalPrice,
        totalQuantity: this.data.totalCount,
        userId: wx.getStorageSync('userId')
      }

      // 是否自提
      if(this.data.takeAway) {
        order.userName = this.data.user.contactName + (this.data.user.sex === 1 ? '（先生）' : '（女士）')
        // 配送费+包装费
        order.deliveryFee = Number(wx.getStorageSync('sendPrice')).toFixed(2)
        order.userPhone = this.data.user.contactPhone
        order.deliveryAddress = this.data.user.campus + '-' + this.data.user.detailedAddress
      } else {
        order.userPhone = this.data.userTel
        // 包装费
        order.deliveryFee = Number(wx.getStorageSync('sendPrice') / 2).toFixed(2)
      } 

      // 每个商品对象
      for(let item of this.data.cartList) {
        let num = item.count ? item.count : item.num
        let food = {
          goodsName: item.name,
          picture: item.imgUrl || '',
          quantity: num,
          specification: item.spec,
          totalPrice: num * item.price,
          unitPrice: Number(item.price + (item.attrPrice ? item.attrPrice : 0)).toFixed(2)
        }
        order.orderCommodities.push(food)
      }

      // 是否预约
      if(this.data.index != 0) {
        order.isReserved = 1
        order.reservedTime = this.data.realTime[this.data.index]
      } else {
        order.isReserved = 0
      }

      orderNewOrder(order).then(res => {
        console.log(res);
        
        // 下单成功
        if(res && res.data && res.data.code === H_config.STATECODE_orderNewOrder_SUCCESS) {
          const obj = res.data.data
          // obj.userId = wx.getStorageSync('userId')
          wx.hideLoading()
          pay.call(this, obj)
          let oldCart = app.globalData.cartList.find(item => item.shopId === this.data.shopId)
          oldCart.foodList = []
         
        }else {
          showToast('下单失败：' + res.data.msg)
        }
      })
    }
  },
})