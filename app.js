//app.js
import  bus  from './utils/bus'
import {
  getAllCampus
} from './service/home'
import {
  loginByTourist
} from './service/touristLogin'
import {
  K_config,
  API_WEBSOCKET_URL
} from './service/config'
import { showToast } from './utils/util'
import { HeartBeat } from './utils/heartBeat'
App({
  onLaunch: function () {
    this.globalData.bus=bus
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    if(!wx.getStorageSync('token')){
      loginByTourist().then((res) => {
        if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_touristLogin_SUCCESS){
          wx.setStorageSync('touristToken', res.data.data)
        }
      })
    }

    if(!wx.getStorageSync('searchFoodHistoryList')) {
      wx.setStorageSync('searchFoodHistoryList', [])
    }

    if(!wx.getStorageSync('address')) {
      wx.redirectTo({
        url: '/pages/WCH/location/location?canback=' + 0
      })
    }
    

    

    // getAllCampus().then(res => {
    //   if(res.data && res.data.code && res.data.code === 3200) {
    //     let list = res.data.data
    //     let address = list.find(item => item.campusId === wx.getStorageSync('campusId'))
    //     wx.setStorageSync('sendPrice', address.campusCost)
    //     wx.setStorageSync('minPrice', address.campusMinPrice)
    //   }
    // })
    this.wsConnect()
    
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      },
    })
  },
  addToCart(obj, tag, bool) {
    // 1.判断是否已经添加进来
    let old = null
    let oldInfo = null

    // 判断是哪家店铺的购物车
    if(this.globalData.cartList.find((item) => item.shopId === obj.shopId)) {
      old = this.globalData.cartList.find((item) => item.shopId === obj.shopId)
    } else {
      old = {shopId: obj.shopId, foodList:[]}
      this.globalData.cartList.push(old)
    }
    
    // 是否存在规格
    if(tag) {
      oldInfo = old.foodList.find((item) => item.id === obj.id && item.spec === tag)
    } else {
      oldInfo = old.foodList.find((item) => item.id === obj.id)
    }

    // 购物车中存在 && 没有规格 && 不是在详情页加购
    if(oldInfo && !tag && !bool) {
      oldInfo.num++
    } else if(!oldInfo && !tag) {
      // 购物车不存在 && 没有规格
      obj.num = 1
      obj.singlePrice = Number(obj.price).toFixed(2)
      old.foodList.push(obj)
    } else if (oldInfo && tag && tag === oldInfo.spec) {
      // 购物车中存在 && 有规格 && 购物车中存在此规格商品
      oldInfo.num++
      oldInfo.count++
    } else if(!oldInfo || (oldInfo && tag && tag !== oldInfo.spec)){
      // 购物车中不存在该商品 || 规格
      old.foodList.push({...obj, spec: tag, count: 1, singlePrice: Number(obj.price + obj.attrPrice).toFixed(2)})
    }

    if(oldInfo) {
      obj.num = oldInfo.num
    }

    for(let food of old.foodList) {
      if(food.id === obj.id) {
        food.num = obj.num
      }
    }
    this.culPrice(old.foodList);
  },
  culPrice(list, sendPrice) {
    this.globalData.totalPrice = 0
    this.globalData.totalCount = 0
    for(let item of list) {
      const num = item.count ? item.count : item.num
      // this.globalData.totalPrice += (item.price + (item.attrPrice ? item.attrPrice : 0)) * num
      this.globalData.totalPrice += item.singlePrice * num
      this.globalData.totalCount += num
    }
    this.globalData.totalPrice = this.globalData.totalPrice + (sendPrice || 0)
    this.globalData.totalPrice = this.globalData.totalPrice.toFixed(2)
  },
  globalData: {
    StatusBar: null,
    userInfo: null,
    Custom: null,
    CustomBar: null,
    // 购物车列表
    cartList: [],
    // 总价格
    totalPrice: 0,
    // 总数量
    totalCount: 0,
    phoneNum: null,
    token: null
  },
  // async webSocketConnect(uid = wx.getStorageSync('userId'), identity, lastestOrderDate) {
  //   await this.webSocketClose()
  //   if(wx.getStorageSync('userId')) {
  //     wx.connectSocket({
  //       url: 'wss://www.sijie666.com:58080/ws',
  //       timeout: 50000,
  //       header: {
  //         'content-type': 'application/json'
  //       },
  //       success: (res) => {
  //         console.log('connect',res);
  //         this.webSocketOpen(uid, identity = 'user', lastestOrderDate)
  //       },
  //       fail: (res) => {
  //       }
  //     })
  //   }

  // },
  // webSendSocketMessage(uid, identity, lastestOrderDate) {
  //   if(lastestOrderDate){
  //     wx.sendSocketMessage({
  //       data: JSON.stringify({
  //         uid,
  //         identity,
  //         lastestOrderDate
  //       }),
  //       success: res => {
  //         console.log('send',res);
  //         this.webGetSocketMessage()
  //       }
  //     })
  //   }
  //   else{
  //     wx.sendSocketMessage({
  //       data: JSON.stringify({
  //         uid,
  //         identity,
  //       }),
  //       success: res => {
  //         console.log('send',res);
  //         this.webGetSocketMessage()
  //       }
  //     })
  //   }
  // },
  // webGetSocketMessage() {      
  //   wx.onSocketMessage((res) => {
  //   // const a=JSON.parse(res.data)
  //   console.log(res.data);
    
  //     if(res.data!=="服务器连接成功！"){
  //       let orderMsg=JSON.parse(res.data)
  //       bus.emit('orderMsg',orderMsg)
  //     }
  //   })
  // },
  // webSocketOpen(uid, identity, lastestOrderDate) {
  //   wx.onSocketOpen((res) => {
  //     this.webSendSocketMessage(uid, identity, lastestOrderDate)
  //   })
  // },
  // webSocketClose() {
  //   wx.onSocketClose((res) => { 
  //     console.log('close');
  //   })
  // }
  getMessageCb(res) {
    let orderMsg = {}
    if(res.data != '服务器连接成功！') {
      orderMsg = JSON.parse(res.data)
      bus.emit('orderMsg',orderMsg)
      // showToast('订单状态发生改变', 1500)
    }
  },
  wsConnect() {
    if(wx.getStorageSync('userId')) {
      this.globalData.ws = new HeartBeat(API_WEBSOCKET_URL, this.getMessageCb, {uid: wx.getStorageSync('userId'),identity: 'user'}, 'ping')
    }
  }
})
