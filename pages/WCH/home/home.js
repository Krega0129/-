// pages/home/home.js
const BACK_TOP = 500
const app = getApp()

import {
  getShopCategory,
  getAllPosters,
  getNotice,
  getAllCampus
} from '../../../service/home'

import {
  _getMultiData,
  showToast
} from '../../../utils/util'
import { H_config, BASE_URL } from '../../../service/config'

Page({
  data: {
    position: '定位',
    BASE_URL: BASE_URL,
    swiperList: [],
    imgUrl: '',
    showImg: false,
    sendPrice: Number(wx.getStorageSync('sendPrice')) / 2,
    minPrice: Number(wx.getStorageSync('minPrice')),
    triggered: false,
    categoryList: [],
    storeList: [],
    showBackTop: false,
    pageNum: 1,
    cateImgList: [
      BASE_URL + '/images/SBCH1.jpg',
      BASE_URL + '/images/SBCH2.jpg',
      BASE_URL + '/images/SBCH3.jpg',
      BASE_URL + '/images/SBCH4.jpg',
      BASE_URL + '/images/SBCH5.jpg',
      BASE_URL + '/images/SBCH6.jpg',
      BASE_URL + '/images/SBCH7.jpg',
      BASE_URL + '/images/SBCH8.jpg'
    ],
    totalPages: 1,
    toBottom: null,
    flagBottom: null,
    showEnd: false,
    setWidth: '',
    ad: '校园生活，这是广告',
    notice: ''
  },
  async onLoad() {
    wx.showLoading({
      title: '加载中...'
    })

    wx.createSelectorQuery().select('.search').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      this.setData({
        toBottom: res[0].bottom
      })
    })

    wx.createSelectorQuery().select('.flag').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      this.setData({
        flagBottom: res[0].bottom
      })
    })

    this.setData({
      position: wx.getStorageSync('address') || '定位'
    })

    if (wx.getStorageSync('address')) {
      await getShopCategory().then(res => {
        if (res && res.data && res.data.code === H_config.STATECODE_getShopCategory_SUCCESS) {
          let cateList = res.data.data
          let i = 0
          for (let item of cateList) {
            item.img = this.data.cateImgList[i++]
          }
          this.data.categoryList = res.data.data || []
        } else {
          wx.hideLoading()
          showToast('服务器异常!')
        }
      }).then(() => {
        this.getShopList()
      })
    } else {
      wx.hideLoading()
    }
  },
  async onShow() {
    if (!wx.getStorageSync('address')) {
      wx.redirectTo({
        url: '/pages/WCH/location/location?canback=' + 0
      })
    } else {
      getAllCampus().then(res => {
        console.log(res);
        if(res.data.code === 3200) {
          const campus = res.data.data.find(item => item.campusId === wx.getStorageSync('campusId'))
          wx.setStorageSync('sendPrice', campus.campusCost)
          wx.setStorageSync('minPrice', campus.campusMinPrice)
        }
      })

      if (wx.getStorageSync('address')) {
        await getAllPosters({
          campus: wx.getStorageSync('address')
        }).then(res => {
          wx.hideLoading()
          this.setData({
            swiperList: res.data.data
          })
        })

        await getNotice({
          address: wx.getStorageSync('address')
        }).then(res => {
          if (res && res.data && res.data.code == 3200) {
            wx.hideLoading()
            this.setData({
              notice: res.data.data ? res.data.data.noticeInfo : '欢迎光临'
            })
          }
        })
      }
    }
      wx.createSelectorQuery().select('.notice').boundingClientRect(res => {
        let setWidth = `--width: -${res.width}px; --wid: ${res.width / this.data.notice.length}s`
        this.setData({
          setWidth: setWidth
        })
      }).exec()

      for (let store of this.data.storeList) {
        store.addCart = false
      }
      for (let item of app.globalData.cartList) {
        let shop = this.data.storeList.find(store => (store.shopId === item.shopId) && item.foodList[0])
        if (shop) {
          let num = 0;
          for (let food of item.foodList) {
            num += food.num
          }
          shop.addCart = true
          shop.num = num
        }
      }
      this.setData({
        storeList: this.data.storeList,
        sendPrice: Number(wx.getStorageSync('sendPrice')) ? (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2) : Number(wx.getStorageSync('sendPrice')),
        minPrice: Number(wx.getStorageSync('minPrice')) ? Number(wx.getStorageSync('minPrice')).toFixed(2) : Number(wx.getStorageSync('minPrice'))
      })
    },
    onPageScroll(options) {
      const scrollTop = options.scrollTop
      const flag = scrollTop >= BACK_TOP

      if (flag !== this.data.showBackTop) {
        this.setData({
          showBackTop: flag
        })
      }
    },
    focusSearch() {
      wx.navigateTo({
        url: '/pages/WCH/search/search',
      })
    },
    tapCategory(e) {
      wx.navigateTo({
        url: '/pages/WCH/storeListPage/storeListPage',
        success(res) {
          res.eventChannel.emit('showStoreList', { title: e.currentTarget.dataset.title })
        }
      })
    },
    showStoreDetails(e) {
      const shopInfo = e.currentTarget.dataset.shopinfo
      wx.navigateTo({
        url: '/pages/WCH/storeDetails/storeDetails',
        success: res => {
          res.eventChannel.emit('sendStoreInfo', { shopId: shopInfo.shopId })
        }
      })
    },
    scrollToBottom() {
      if (this.data.pageNum < this.data.totalPages) {
        _getMultiData(
          this.data.position,
          this.data.storeList,
          {
            pageNum: ++this.data.pageNum
          }
        ).then(res => {
          if (res && res.data && res.data.code === H_config.STATECODE_getMultiData_SUCCESS) {
            this.setData({
              storeList: this.data.storeList
            })
          }
        })
      } else {
        this.setData({
          showEnd: true
        })
      }
    },
    async getShopList() {
      await _getMultiData(
        this.data.position,
        this.data.storeList,
        {
          pageNum: 1
        }
      ).then((res) => {
        wx.hideLoading()
        if (!res.storeList[9]) {
          this.setData({
            showEnd: true
          })
        }

        this.setData({
          storeList: res.storeList || [],
          categoryList: this.data.categoryList,
          totalPages: res.totalPages
        })
      }).catch(err => {
        showToast('服务器异常！')
      })
    },
    async onRefresh() {
      this.data.storeList = [],
        this.setData({
          triggered: true,
          pageNum: 1,
          showEnd: false
        })

      

      await this.getShopList()
      this.onShow()
      this.setData({
        triggered: false
      })
    },
    tapBanner(e) {
      this.setData({
        showImg: true,
        imgUrl: BASE_URL + '/' + e.currentTarget.dataset.url
      })
    },
    hideImg() {
      this.setData({
        showImg: false
      })
    },
    takeExpress() {
      wx.navigateTo({
        url: '/pages/WCH/express/express'
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
