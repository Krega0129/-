// pages/WCH/submitOrder/submitOrder.js
const app = getApp()

import {
  H_config,
  BASE_URL
} from '../../../service/config'

import {
  cancelOrder,
  refund,
  selectUpdateCondition
} from '../../../service/bill'

import {
  updateOrderStatus
} from '../../../service/order'

import {
  formatTime,
  showToast,
  pay
} from '../../../utils/util'

Page({
  data: {
    cartList: [],
    totalPrice: null,
    shopName: '',
    sendPrice: 0,
    packPrice: 0,
    totalCount: 0,
    shopId: '',
    user: {},
    storeTelNum: null,
    remark: '',
    takeAway: true,
    orderNum: null,
    payTime: '',
    isPay: true,
    cancel: false,
    isRefund: false,
    obj: {},
    time: '',
    refundDesc: '',
    valueArr: '不想要了',
    audioTag: [
      {
        tag: '不想要了',
        check: true
      },
      {
        tag: '点错了',
        check: false
      },
      {
        tag: '想吃点别的',
        check: false
      },
      {
        tag: '其他',
        check: false
      }
    ],
    modalName: ''
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中...'
    })

    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('submitOrder', data => {
      console.log(data);
      
      let payTime = null
      if(data.payTime) {
        payTime = formatTime(data.payTime)
      }
      app.culPrice(data.cartList, data.obj.deliveryFee)
      data.cartList.map(item => {
        item.singlePrice = Number(item.singlePrice).toFixed(2)
      })

      // 如果不是自取
      if(data.takeAway) {
        this.data.sendPrice = (Number(data.obj.deliveryFee) / 2).toFixed(2)
        this.data.packPrice = (Number(data.obj.deliveryFee) / 2).toFixed(2)
      } else {
        this.data.sendPrice = 0
        this.data.packPrice = Number(data.obj.deliveryFee).toFixed(2)
      }

      this.setData({
        cartList: data.cartList,
        shopName: data.obj.shopName,
        sendPrice: this.data.sendPrice,
        packPrice: this.data.packPrice,
        shopAddress: data.shopAddress,
        totalPrice: Number(data.obj.totalAmount).toFixed(2),
        user: data.user,
        storeTelNum: data.storeTelNum,
        remark: data.remark,
        orderNum: data.obj.orderNumber,
        takeAway: data.takeAway,
        isPay: data.isPay,
        payTime: payTime,
        obj: data.obj
      })
      if(!data.isPay) {
        let t = setInterval(() => {
          let time = wx.getStorageSync('time') - new Date().getTime()
          time -= 1000
          if(time <= 0) {
            this.setData({
              cancel: true
            })
            clearInterval(t)
          }
          time = formatTime(time).split(' ')[1].substring(3, 8)
          this.setData({
            time: time
          })
        }, 1000)
      }
      wx.hideLoading()
    })
  },
  callShop() {
    wx.showActionSheet({
      itemList: [this.data.storeTelNum],
      success: (res) => {
        if(res.tapIndex === 0) {
          wx.setClipboardData({
            data: this.data.storeTelNum,
            success() {
              wx.showToast({
                title: '复制成功',
              });
            },
            fail: () => {
              showToast('复制失败')
            }
          })
        }
      }
    })
  },
  cancelOrder() {
    wx.showModal({
      content: '确定取消该订单？',
      showCancel: true,
      title: '提示',
      success: res => {
        if(res.confirm) {
          cancelOrder({
            orderNumber: this.data.orderNum
          }).then(res => {
            if(res && res.data && res.data.code === H_config.STATECODE_cancelUnpaidOrder_SUCCESS) {
              wx.showToast({
                title: '订单取消成功！'
              })
              this.setData({
                cancel: true
              })
            } else {
              showToast('服务器错误，请再次尝试！')
            }
          })
        }
      }
    })
  },
  orderAgain() {
    wx.navigateBack({
      delta: 2
    })
  },
  toPay() {
    pay.call(this, this.data.obj)
  },
  // toHome() {
  //   wx.reLaunch({
  //     url: '/pages/WCH/home/home',
  //   })
  // },
  chooseAudioTag(e) {
    // 点击第几个标签
    const index = e.currentTarget.dataset.index;
    // 获取标签列表
    let audioList = e.currentTarget.dataset.taglist

    // 单选
    for(let item of audioList) {
      if((audioList.indexOf(item) == index) && !audioList[index].check) {
        item.check = true
        this.data.valueArr = audioList[index].tag
      } else {
        // 其他的不勾选
        item.check = false
        if(this.data.valueArr === item.tag) {
          this.data.valueArr = ''
        }
      }
    }
    this.setData({
      audioTag: audioList
    })
  },
  showModal(e) {
    if(new Date().getTime() > wx.getStorageSync('refundTime')) {
      showToast('已超过3分钟，不能退款')
    } else {
      this.setData({
        modalName: e.currentTarget.dataset.modalname
      })
    }
  },
  hideModal() {
    this.setData({
      modalName: ''
    })
  },
  _refund() {
    refund({
      deliveryFee: this.data.obj.deliveryFee,
      orderNumber: this.data.orderNum,
      refundDesc: this.data.audioTag[3].check ? this.data.refundDesc : this.data.valueArr,
      shopId: this.data.obj.shopId,
      shopName: this.data.shopName,
      totalAmount: this.data.totalPrice,
      userId: wx.getStorageSync('userId')
    }).then(res => {
      wx.hideLoading()
      this.hideModal()
      if(res.data && res.data.code && res.data.code === H_config.STATECODE_refund_SUCCESS) {
        selectUpdateCondition({
          orderNumber: this.data.orderNum
        }).then(result => {
          wx.hideLoading()
          updateOrderStatus({
            id: result.data.data.id,
            orderId: result.data.data.orderId,
            orderNumber: this.data.orderNum,
            status: 1
          }).then((res)=>{
            wx.hideLoading()
            if(res.data.code === 3255) {
              wx.showToast({
                title: '申请成功',
              })
              this.setData({
                isRefund: true
              })
            } else {
              showToast('申请失败')
            }
          })
        })
        
      } else {
        showToast('申请失败')
      }
    })
  },
  onShareAppMessage(options) {
    return {
      title: '啰咪校园',
      path: '/pages/WCH/home/home',
      imageUrl: BASE_URL + '/images/logo.png'
    }
  }
})