// pages/WCH/express/express.js
const app = getApp()
import {
  selectExpressAgentPrice,
  submitNewForm,
  selectUserOrder,
  payExpress,
  cancelExpressOrder
} from '../../../service/express'
import {
  getAllAddressByCampus
} from '../../../service/bill'
import { 
  H_config,
  BASE_URL
} from '../../../service/config'
import {
  showToast
} from '../../../utils/util'

Page({
  data: {
    TabIndex: 0,
    showEnd: false,
    tabTitleList: ['提交订单', '订单历史'],
    toBottom: null,
    flagBottom: null,
    express: [],
    pickUpTypeList: ['蜂巢柜', '菜鸟驿站', '摆摊'],
    expressStatusName: ['待接单', '待送达', '已完成', '已退款', '已取消'],
    expressStatusColor: ['blue', 'orange', 'green', 'black', 'grey'],
    index: 0,
    specList: [],
    specificationsList: [],
    idx: 0,
    currentPage: 1,
    totalPages: 1,
    distributionFee: '',
    expressContent: '',
    expressType: '',
    pickUpAddress: '',
    pickUpCode: '',
    pickUpType: '',
    specifications: '',
    userId: wx.getStorageSync('userId'),
    orderNum: '',

    chooseLocation: false,
    changeLocation: false,
    user: {},
    locationList: [],
    triggered: false
  },
  onLoad: function (options) {
    wx.createSelectorQuery().select('.nav').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      this.setData({
        toBottom: res[0].bottom
      })
    })
    wx.createSelectorQuery().select('.flag').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      this.setData({
        flagBottom: res[0].bottom
      })
    })

    selectExpressAgentPrice({
      campus: wx.getStorageSync('address')
    }).then(res => {
      wx.hideLoading()
      if(res.data.code === H_config.STATECODE_express_SUCCESS) {
        for(let item of res.data.data) {
          this.data.specificationsList.push(item.specifications)
        }
        this.setData({
          distributionFee: res.data.data[0].price,
          specifications: res.data.data[0].specifications,
          specList: res.data.data,
          specificationsList: this.data.specificationsList,
          pickUpType: this.data.pickUpTypeList[0]
        })
      } else {
        showToast('加载失败')
      }
    })
  },
  onShow: async function () {
    await this.setData({
      userId: wx.getStorageSync('userId')
    })

    this._getAllAddressByCampus()
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
  tapTabIndex(e) {
    const id = e.currentTarget.dataset.id
    if(id === 1) {
      this.data.express = []
      this._selectUserOrder()
    }
    this.setData({
      TabIndex: id
    })
  },
  PickerChange(e) {
    this.setData({
      index: e.detail.value,
      pickUpType: this.data.pickUpTypeList[e.detail.value]
    })
  },
  specificationsChange(e) {
    this.setData({
      idx: e.detail.value,
      specifications: this.data.specificationsList[e.detail.value],
      distributionFee: this.data.specList[e.detail.value].price
    })
  },
  submitOrder() {
    const expressAgent = {
      addresseeName: this.data.user.contactName,
      addresseePhone: this.data.user.contactPhone,
      campus: this.data.user.campus,
      distributionFee: this.data.distributionFee,
      expressContent: this.data.expressContent,
      expressType: this.data.expressType,
      pickUpAddress: this.data.pickUpAddress,
      pickUpCode: this.data.pickUpCode,
      pickUpType: this.data.pickUpType,
      serviceAddress: this.data.user.detailedAddress,
      specifications: this.data.specifications,
      userId: wx.getStorageSync('userId')
    }
    if(!this.data.user.contactName) {
      showToast('请选择收货地址')
    } else if(Object.values(expressAgent).indexOf('') !== -1) {
      showToast('内容不能为空')
    } else {
      submitNewForm(expressAgent).then(res => {
        console.log(res);
        
        if(res.data.code === H_config.STATECODE_express_SUCCESS) {
          this.setData({
            orderNum: res.data.data.orderNumber
          })
          payExpress({
            distributionFee: res.data.data.distributionFee,
            orderNumber: res.data.data.orderNumber,
            riderProfit: res.data.data.riderProfit,
            userId: wx.getStorageSync('userId')
          }).then(result => {
            if (result.data.prepayId != ''){
              const map = result.data.data
              wx.requestPayment({
                'appId': map.appId,
                'timeStamp': map.timeStamp,
                'nonceStr': map.nonceStr,
                'package': map.package,
                'signType': 'MD5',
                'paySign': map.paySign,
                'success':  (response) => {
                  if(response.errMsg === 'requestPayment:ok') {
                    console.log('支付了');
                    this.setData({
                      TabIndex: 1
                    })
                    this._selectUserOrder()
                    wx.showToast({
                      title: '支付成功！',
                    })
                  }
                },
                'fail': () => {
                  console.log('取消支付了');
                  this.cancelOrder(res.data.data.id)
                  wx.showToast({
                    title: '支付已取消！',
                    icon: 'error'
                  })
                },
                complete: () => {
                  this.setData({
                    chooseLocation: false,
                    user: {},
                    expressContent: '',
                    pickUpAddress: '',
                    pickUpCode: '',
                    expressType: '',
                  })
                }
              })
            } else {
              showToast('下单失败，请重试！')
            }
              wx.showToast({
                title: '提交成功',
              })
            })
        } else {
          showToast('提交失败')
        }
      })
    }
  },
  cancelOrder(orderNum) {
    cancelExpressOrder({
      id: orderNum
    }).then(res => {
      console.log(res);
      if(res.data.code === H_config.STATECODE_express_SUCCESS) {
        wx.showToast({
          title: '订单已取消'
        })
      }
    })
  },
  _selectUserOrder() {
    selectUserOrder({
      id: wx.getStorageSync('userId'),
      pageNumber: this.data.currentPage,
      pageSize: 5
    }).then(res => {
      console.log(res);
      wx.hideLoading()
      if(res.data.code === H_config.STATECODE_express_SUCCESS) {
        this.data.express.push(...res.data.data.list)
        this.setData({
          express: this.data.express,
          totalPages: res.data.data.pages,
          showEnd: this.data.currentPage >= this.data.totalPages
        })
      }
    })
  },
  expressDetails(e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/WCH/expressDetails/expressDetails',
      success: res => {
        res.eventChannel.emit('expressDetails', {item})
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
  cancleChangeLocation() {
    this.setData({
      changeLocation: false
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

  scrollToBottom() {
    if(this.data.currentPage < this.data.totalPages) {
      this.data.currentPage++
      this._selectUserOrder()
    } else {
      this.setData({
        showEnd: true
      })
    }
  },
  async onRefresh() {
    this.data.express = [],
    this.setData({
      triggered: true,
      currentPage: 1,
      showEnd: false
    })
    await this._selectUserOrder()
    this.setData({
      triggered: false
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