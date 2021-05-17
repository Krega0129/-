import { getUserTotalOrder, getUnpaidOrder, cancelUnpaidOrder, selectUserPaidOrder,updateOrderStatus } from '../../../service/order';
import {
  prePay,
  changeOrderStatus,
  refundOrder
} from '../../../service/bill';
import { loadingOff, showToast } from '../../../utils/util';
import {
  BASE_URL,
  K_config,
  H_config
} from '../../../service/config'
let app = getApp()
let bus = app.globalData.bus
Page({
  /**
   * 页面的初始数据
   */
  data: {
    toTop:null,
    isTriggered:false,
    TabCur: 0,
    scrollLeft: 0,
    modalName: '',
    currentType: 'all',
    TabName: ["全部", "待付款", "已付款"],
    // 模态框绑定对应订单index
    listIndex:null,
    // 状态数组
    statusCode: ['allList', 'obligationList', 'paidList'],
    // 全部订单
    allList: [],
    // 待付款订单
    obligationList: [],
    // 已付款订单
    paidList: [],
    // 监听"全部"的页面信息是否为最新信息
    isFresh: true,
    // 监听是否登录
    isLogin: false,
    // 全部订单页数
    pageNum: 1,
    // 监听是否请求完全部订单信息
    isRequestAll:false,
    // 监听目前所在的tab栏index
    nowIndex:null
  },

  // 进入详情页
  goToOrderDetails(e) {
    console.log(e);
    wx.navigateTo({
      url: '/pages/LSK/orderDetails/orderDetails?item=' + JSON.stringify(e.currentTarget.dataset.item),
    })
  },
  // 打开模态框
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target, 
      listIndex:e.currentTarget.dataset.index
    })
  },
  // 关闭模态框
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  // 复制号码
  copyPhoneNumber(e) {
    console.log(e);
    let that = this;
    wx.setClipboardData({
      //准备复制的数据
      data: e.currentTarget.dataset.phone,
      success: function (res) {
        showToast('内容已复制',1000)
        that.setData({
          modalName: null
        })
      }
    })
  },
  // 选项卡展示
  tabSelect(e) {
    const index = e.currentTarget.dataset.id
    this.setData({
      TabCur: index,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
    if (wx.getStorageSync('token')) {
      if (index === 0 && index != this.data.nowIndex) {  
          this.data.pageNum=1
        this.setUserTotalOrder()
      } else if (index === 1) {
        this.setUnpaidOrder()
      } else if (index === 2) {
        this.setSelectUserPaidOrder()
      }
    }

  },
  // 格式化数组
  listArrayFormate: function (res) {
    const list = []
    for (let item of res.data.data) {
      // 遍历订单信息
      const order = {
        id: item.id,
        orderId: item.orderId,
        orderNumber: item.orderNumber,
        totalAmount: item.totalAmount,
        deliveryAddress: item.deliveryAddress,
        userPhone: item.userPhone,
        userName: item.userName,
        totalQuantity: item.totalQuantity,
        remarks: item.remarks,
        deliveryFee: item.deliveryFee,
        date: item.date,
        completeTime: item.completeTime,
        commodities: [],
        orderStatus: item.orderStatus,
        deliveryStatus: item.deliveryStatus,
        status: item.status,
        shopName: item.shopName,
        shopId: item.shopId,
        isReserved: item.isReserved,
        reservedTime: item.reservedTime,
        businessPhone: item.businessPhone,
        shopPicture: item.shopPicture,
        shopAddress: item.shopAddress,
        statusCode: this.formatStatusCode(item.status),

      }
      // 遍历商品详情
      for (let item of item.commodities) {
        const commoditie = {
          detailsId: item.detailsId,
          picture: item.picture,
          orderId: item.orderId,
          goodsName: item.goodsName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
          specification: item.specification
        }
        // console.log(commoditie);
        order.commodities.push(commoditie)
      }
      list.push(order)
    }
    return list
  },
  // 获取"全部"订单信息
  setUserTotalOrder: function () {
    if(this.data.pageNum==1){
      this.data.allList=[]
    }
    let that = this
    let pageNum = that.data.pageNum
    let size = 5
    let userId = wx.getStorageSync('userId')
    getUserTotalOrder(pageNum, size, userId).then((res) => {
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code == K_config.STATECODE_getUserOrderByStatus_SUCCESS) {
        const  list = []
        let isRequestAll = false
        for (let item of res.data.data.list) {
          // 遍历订单信息
          const order = {
            id: item.id,
            orderId: item.orderId,
            orderNumber: item.orderNumber,
            totalAmount: item.totalAmount,
            deliveryAddress: item.deliveryAddress,
            userPhone: item.userPhone,
            userName: item.userName,
            totalQuantity: item.totalQuantity,
            remarks: item.remarks,
            deliveryFee: item.deliveryFee,
            date: item.date,
            completeTime: item.completeTime,
            commodities: [],
            orderStatus: item.orderStatus,
            deliveryStatus: item.deliveryStatus,
            status: item.status,
            shopName: item.shopName,
            shopId: item.shopId,
            isReserved: item.isReserved,
            reservedTime: item.reservedTime,
            businessPhone: item.businessPhone,
            shopPicture: item.shopPicture,
            shopAddress: item.shopAddress,
            statusCode: this.formatStatusCode(item.status)
          }
          // 遍历商品详情
          for (let item of item.commodities) {
            const commoditie = {
              detailsId: item.detailsId,
              picture: item.picture,
              orderId: item.orderId,
              goodsName: item.goodsName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              specification: item.specification
            }
            // console.log(commoditie);
            order.commodities.push(commoditie)
          }
          list.push(order)
        }
        if(res.data.data.total<=pageNum*size||res.data.data.total===0){
          isRequestAll=true
        }
        this.data.allList.push(...list)
        this.setData({
          isTriggered:false,
          allList: this.data.allList,
          isFresh: true,
          isRequestAll:isRequestAll,
          nowIndex:0
        })
        wx.hideLoading()
      }
      else{
        wx.hideLoading()
        showToast('请求失败',2000)
      }
    })
  },
  // 获取"待付款"订单信息
  setUnpaidOrder() {
    let userId = wx.getStorageSync('userId')
    getUnpaidOrder(userId).then((res) => {
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getUnpaidOrder_SUCCESS) {
        const list = []
        for (let item of res.data.data) {
          // 遍历订单信息
          const order = {
            orderId: item.orderId,
            orderNumber: item.orderNumber,
            totalAmount: item.totalAmount,
            shopName: item.shopName,
            shopId: item.shopId,
            deliveryAddress: item.deliveryAddress,
            userPhone: item.userPhone,
            userName: item.userName,
            remarks: item.remarks,
            paymentTime: item.paymentTime,
            receiveTime: item.receiveTime,
            deliveryTime: item.deliveryTime,
            completeTime: item.completeTime,
            isReserved: item.isReserved,
            reservedTime: item.reservedTime,
            deliveryFee: item.deliveryFee,
            businessPhone: item.businessPhone,
            shopPicture: item.shopPicture,
            shopAddress: item.shopAddress,
            totalQuantity: item.totalQuantity,
            userId: item.userId,
            // date: item.date,
            commodities: [],
            // timeDifference: item.timeDifference,
            // orderStatus: item.orderStatus,
            // deliveryStatus: item.deliveryStatus,
            status: item.status,
            timeStamp: item.timeStamp,
            countDownStamp: null,
            countDown: '',
          }
          // 遍历商品详情
          for (let item of item.orderCommodities) {
            const commodity = {
              detailsId: item.detailsId,
              picture: item.picture,
              orderId: item.orderId,
              goodsName: item.goodsName,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              specification: item.specification
            }
            order.commodities.push(commodity)
          }
          list.push(order)
        }
        this.setData({
          isTriggered:false,
          obligationList: list,
          nowIndex:1
        })
        wx.hideLoading()
        // this.getCountDown()
      }
      else {
        wx.hideLoading()
        showToast('请求失败', 2000)
      }
    })
  },
  // 获取"已付款"订单信息
  setSelectUserPaidOrder() {
    let userId = wx.getStorageSync('userId')
    selectUserPaidOrder(userId).then((res) => {
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_selectUserPaidOrder_SUCCESS) {
        let list = this.listArrayFormate(res)
        this.setData({
          isTriggered:false,
          paidList: list,
          nowIndex:2
        })
        wx.hideLoading()
      }else{
        wx.hideLoading()
        showToast('请求失败',2000)
      }
    })
  },
  // 倒计时格式化
  dateformat: function (micro_second) {
    // 总秒数
    var second = Math.floor(micro_second / 1000);
    // 天数
    var day = Math.floor(second / 3600 / 24);
    // 总小时
    var hr = Math.floor(second / 3600);
    // 小时位
    var hr2 = hr % 24;
    // 分钟位
    var min = Math.floor((second - hr * 3600) / 60);
    // 秒位
    var sec = (second - hr * 3600 - min * 60)// equal to => var sec = second % 60;
    //  var micro_sec = Math.floor((micro_second % 1000) / 10);
    return (min < 10 ? "0" + min : min) + ":" + (sec < 10 ? "0" + sec : sec);
  },
  // 获取倒计时    
  getCountDown() {
    let obligationList = this.data.obligationList
    for (let item of obligationList) {
      let orderTime = item.timeStamp
      let nowTime = new Date().getTime()
      let seconds = (15 * 60 * 1000 + orderTime) - nowTime
      item.countDownStamp = seconds
    }
    this.setData({
      obligationList: obligationList
    })
    this.setCountDown(obligationList)
  },
  setCountDown(obligationList) {
    // for (let item of obligationList) {
    //   let timer= setInterval(() => {
    //     item.countDownStamp-=1000
    //     item.countDown=this.dateformat(item.countDownStamp)
    //     if(item.countDownStamp<=0){
    //       clearInterval(timer)
    //     }
    //     this.setData({
    //       obligationList:obligationList
    //     })
    //   }, 1000);   
    // }
  },
  // 取消订单
  cancelOrder: function (e) {
    let list = this.data.obligationList
    let orderNumber = e.currentTarget.dataset.ordernumber
    let index = e.currentTarget.dataset.id
    cancelUnpaidOrder(orderNumber).then((res) => {
      if (res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_cancelUnpaidOrder_SUCCESS) {
        loadingOff()
        showToast('订单取消成功', 2000)
        // setTimeout(()=> {
        //   this.setUnpaidOrder()
        //  }, 1000)
        list.splice(index - 1, 1)
        this.setData({
          obligationList: list
        })
      }
    })
  },
  // 根据状态码获取状态
  formatStatusCode: function (status) {
    let statusCode = ''
    if (status === 0) {
      statusCode = '待付款'
    } else if (status === 1 || status === 2) {
      statusCode = '待接单'
    } else if (status === 3) {
      statusCode = '待取货'
    } else if (status === 4) {
      statusCode = '待送达'
    } else if (status === 5) {
      statusCode = '已完成'
    } else if (status === 6) {
      statusCode = '已退款'
    } else if (status === 7) {
      statusCode = '订单取消'
    }
    return statusCode
  },
  // 手动刷新"全部"订单
  // refreshAllList: function () {
  //   this.setSelectUserPaidOrder()
  // },
  // 跳转到登录页
  toLogin: function () {
    // wx.navigateTo({
    //   url: '/pages/WCH/login/login',
    // })

    wx.login({
      success: res => {
        const code = res.code
        console.log(res);
        
        wx.navigateTo({
          url: '/pages/WCH/login/login',
          success: res => {
            res.eventChannel.emit('code',{ code: code })
          }
        })
      }
    })  
  },
  //支付订单 
  payOrder:function(e){
    const index=e.currentTarget.dataset.index
    const order=this.data.obligationList[index]
    this.pay({
      deliveryFee: order.deliveryFee,
      orderNumber: order.orderNumber,
      shopName: order.shopName,
      totalAmount: order.totalAmount,
      userId: order.userId,
      shopId: order.shopId
    }, order)
  },
  // 微信支付请求
  pay(data) {
    prePay(data).then(res => {
    if(res && res.data && res.data.code === H_config.STATECODE_prePay_SUCCESS) {
        if (res.data.prepayId != ''){
          const map = res.data.data
          wx.requestPayment({
            'appId': map.appId,
            'timeStamp': map.timeStamp,
            'nonceStr': map.nonceStr,
            'package': map.package,
            'signType': 'MD5',
            'paySign': map.paySign,
            'success':  (res) => {
              if(res.errMsg === 'requestPayment:ok') {
                changeOrderStatus({
                  orderNumber: data.orderNumber,
                  userId: wx.getStorageSync('userId')
                }).then(() => {
                  wx.showToast({
                    title: '支付成功！'
                  })
                  this.setUnpaidOrder()
                })
                
              }
            },
            'fail': () => {
              showToast('取消支付',2000)
            }
          })
        }
      }
    });
  },
  // 退款
  refund:function(e) {
    let orderList=[]
    if(this.data.TabCur===0){
      orderList=this.data.allList
    }else if(this.data.TabCur===2){
      orderList=this.data.paidList
    }
    const index=e.currentTarget.dataset.index
    const orderMsg=orderList[index]
    wx.showActionSheet({
      itemList:['不想点了','点错单了','其他原因'],
      success:(res)=>{
        let  itemList=['不想点了','点错单了','其他原因']
        const tapIndex=res.tapIndex
        const refundDesc=itemList[tapIndex]
        // console.log(orderMsg);
        updateOrderStatus({
          id:orderMsg.id,
          orderId:orderMsg.orderId,
          orderNumber:orderMsg.orderNumber,
          status:orderMsg.status
        }).then((res)=>{
          wx.hideLoading()
          if(res.data.code===K_config.STATECODE_updateOrderStatus_SUCCESS){
            refundOrder({
              deliveryFee:orderMsg.deliveryFee,
              orderNumber:orderMsg.orderNumber,
              refundDesc:refundDesc,
              shopName:orderMsg.shopName,
              totalAmount:orderMsg.totalAmount
            }).then((res)=>{
              if(res.data.code===K_config.STATECODE_refund_SUCCESS){
                wx.hideLoading()
                showToast('退款成功',2000)
                this.setSelectUserPaidOrder()
              }
            })
          }else{
            showToast('退款失败，当前状态不允许修改',2000)
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getStorageSync('token')) {
      this.setUserTotalOrder()
    }
    wx.createSelectorQuery().select('.scrollTop').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      console.log(res); 
      this.setData({
        toTop: res[0].bottom * 2
      })
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
    if (!wx.getStorageSync('token')) {
      this.setData({
        isLogin: false
      })
    } else {
      this.setData({
        isLogin: true
      })
      // this.setUserTotalOrder()
      this.setData({
        isLogin: true
      })
      
      const that = this
      bus.on('orderMsg', function (orderMsg) {
        showToast('有订单信息发生改变', 2000)
        let obligationList = that.data.obligationList
        console.log(obligationList);
        let paidList = that.data.paidList
        let orderNumber = orderMsg.orderNumber
        console.log(orderMsg);
        if (orderMsg.currentStatus === 0) {
          obligationList.unshift(orderMsg.data)
          that.getCountDown()
        }
        else if (orderMsg.currentStatus === 1 && orderMsg.pastStatus === 0) {
          let orderItem = paidList.find(res => res.orderNumber = orderNumber)
          console.log(orderItem);
          orderItem.statusCode = '待接单'
        }
        else if (orderMsg.currentStatus === 2 && orderMsg.pastStatus === 1) {
          let orderItem = paidList.find(res => res.orderNumber = orderNumber)
          console.log(orderItem);
          orderItem.statusCode = '待接单'
          orderItem.status = 2
        }
        else if (orderMsg.currentStatus === 3) {
          let orderItem = paidList.find(res => res.orderNumber = orderNumber)
          console.log(orderItem);
          orderItem.statusCode = '待取货'
        }
        else if (orderMsg.currentStatus === 4) {
          let orderItem = paidList.find(res => res.orderNumber === orderNumber)
          orderItem.statusCode = '待送达'
        }
        else {
          for (let index = 0; index < obligationList.length; index++) {
            if (orderMsg.orderNumber === obligationList[index].orderNumber) {
              obligationList.splice(index - 1, 1)
              return
            }
          }
        }
        that.setData({
          obligationList: obligationList,
          paidList: paidList,
          isFresh: false
        })
      })
    }

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    bus.remove('orderMsg')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
 /**
   * 页面上拉触底事件的处理函数
   */
 
  toLoading:function(){
      if(this.data.TabCur==0&&!this.data.isRequestAll){
        let pageNum=++this.data.pageNum
          this.setData({
            pageNum:pageNum
          })
          this.setUserTotalOrder()
      }
  },
 /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
 
  toRefresh: function () {
    this.setData({
      isTriggered:true
    })
    if(this.data.TabCur===0){
      this.data.allList=[]
      this.setData({
        pageNum:1
      })
      this.setUserTotalOrder()
    }else if(this.data.TabCur===1){
        this.setUnpaidOrder()
    }else if(this.data.TabCur===2){
        this.setSelectUserPaidOrder()
    }
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