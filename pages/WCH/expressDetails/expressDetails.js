// pages/WCH/expressDetails/expressDetails.js
import {
  cancelExpressOrder
} from '../../../service/express'
import { showToast } from '../../../utils/util'
import {
  BASE_URL
} from '../../../service/config'

Page({
  data: {
    order: {
      expressType: '顺丰速递',
      pickUpType: '菜鸟驿站',
      campus: '广工校区',
      distributionFee: 1.00,
      pickUpAddress: '广东工业大学生活西区7号蜂巢柜',
      serviceAddress: '广东工业大学生活西区3栋433',
      pickUpCode: '123456',
      specifications: '小件',
      expressContent: 'Javascript从入门到放弃',
      addresseeName: '吴昌辉',
      addresseePhone: '18319328003',
      riderName: '李泽强',
      riderPhone: '19120333220',
      status: 3
    },
    status: ['等待骑手接单...', '待送达', '已完成', '已退款', '已取消'],
    statusColor: ['blue', 'orange', 'green', 'black', 'grey']
  },
  onLoad: function (options) {
    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('expressDetails', data => {
      this.setData({
        order: data.item
      })
      console.log(this.data.order);
    })
  },
  onShow: function () {

  },
  copyRiderPhone() {
    wx.setClipboardData({
      data: this.data.order.riderPhone,
      success() {
        wx.showToast({
          title: '复制成功',
        });
      },
      fail: () => {
        showToast('复制失败')
      }
    })
  },
  cancelOrder() {
    wx.showModal({
      content: '确定取消该订单？',
      success: res => {
        if(res.confirm) {
          cancelExpressOrder({
            id: String(this.data.order.id)
          }).then(res => {
            wx.hideLoading()
            if(res.data.code === 3200) {
              wx.showToast({
                title: '取消成功',
              })
              setTimeout(() => {
                wx.navigateBack()
              }, 1000)
            } else {
              showToast('取消失败')
            }
          })
        }
      }
    })
  },
  copyOrderNumber() {
    wx.setClipboardData({
      data: this.data.order.orderNumber,
      success() {
        wx.showToast({
          title: '复制成功',
        });
      },
      fail: () => {
        showToast('复制失败')
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