// pages/storeListPage/storeListPage.js
import {
  _getMultiData
} from '../../../utils/util'

import {
  getAllCampus
} from '../../../service/home'

import {
  BASE_URL
} from '../../../service/config'

const BACK_TOP = 500

const app = getApp()

Page({
  data: {
    category: null,
    keyWord: null,
    position: wx.getStorageSync('address') || '',
    currentPage: 1,
    storeList: [],
    totalPages: 1,
    showEnd: false,
    toBottom: 100 + 2 * app.globalData.CustomBar,
    triggered: false,
    showBackTop: false,
    sendPrice: Number(wx.getStorageSync('sendPrice')),
    minPrice: Number(wx.getStorageSync('minPrice')),
  },
  async onLoad(options) {
    wx.showLoading({
      title: '加载中...'
    })

    getAllCampus().then(res => {
      if(res.data.code === 3200) {
        const campus = res.data.data.find(item => item.campusId === wx.getStorageSync('campusId'))
        wx.setStorageSync('sendPrice', campus.campusCost)
        wx.setStorageSync('minPrice', campus.campusMinPrice)
        this.setData({
          sendPrice: campus.campusCost,
          minPrice: campus.campusMinPrice
        })
      }
    })

    wx.createSelectorQuery().select('.search').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      this.setData({
        toBottom: res[0].bottom * 2
      })
    })

    let eventChannel = this.getOpenerEventChannel()
    await new Promise((resolve) => {
      eventChannel.on('showStoreList', (data) => {
        this.setData({
          category: data.title,
          position: wx.getStorageSync('address')
        })
        resolve()
      })
      eventChannel.on('showSearchList', (data) => {
        this.setData({
          keyWord: data.title
        })
        resolve()
      })
      if(this.data.category || this.data.keyWord) {
        resolve()
      }
    })

    await _getMultiData(
      wx.getStorageSync('address'),
      this.data.storeList,
      {
        pageNum: 1,
        category: this.data.category,
        keyWord: this.data.keyWord
      }
    ).then(res => {
      if(!this.data.storeList[9]) {
        this.data.showEnd = true
      }

      this.setData({
        storeList: res.storeList,
        totalPages: res.totalPages || 1,
        showEnd: this.data.showEnd
      })
    }).then(() => {
      this.onShow()
    }).catch(err => {
      console.log(err);
    })
    wx.hideLoading()
  },
  onShow() {
    for(let store of this.data.storeList) {
      store.addCart = false
    }
    for(let item of app.globalData.cartList) {
      let shop = this.data.storeList.find(store => (store.shopId === item.shopId) && item.foodList[0])
      if(shop) {
        let num = 0;
        for(let food of item.foodList) {
          num += food.num
        }
        shop.addCart = true
        shop.num = num
      } 
    }
    this.setData({
      storeList: this.data.storeList
    })
  },
  onPageScroll(options) {
    const scrollTop = options.scrollTop
    const flag = scrollTop >= BACK_TOP

    if(flag !== this.data.showBackTop) {
      this.setData({
        showBackTop: flag
      })
    }
  },
  showStoreDetails(e) {
    const shopInfo = e.currentTarget.dataset.shopinfo
    wx.navigateTo({
      url: '/pages/WCH/storeDetails/storeDetails',
      success: res => {
        res.eventChannel.emit('sendStoreInfo', {shopId: shopInfo.shopId})
      }
    })
  },
  focusSearch() {
    let pages = getCurrentPages()
    
    // 判断前一页是否是搜索页面，是则直接返回，否则跳转搜索页面
    if('pages/WCH/search/search' === pages[pages.length - 2].route) {
      wx.navigateBack()
    }else {
      wx.redirectTo({
        url: '/pages/WCH/search/search',
      })
    }
  },
  scrollToBottom() {
    if(this.data.currentPage < this.data.totalPages) {
      _getMultiData(
        this.data.position,
        this.data.storeList,
        {
          pageNum: ++this.data.currentPage,
          category: this.data.category,
          keyWord: this.data.keyWord
        }
      ).then(() => {
        this.setData({
          storeList: this.data.storeList
        })
      })
    } else {
      this.setData({
        showEnd: true
      })
    }
  },
  onRefresh() {
    this.data.storeList = []
    this.setData({
      currentPage: 1,
      totalPages: 1
    })
    this.onLoad().then(() => {
      this.setData({
        triggered: false
      })
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