// pages/location/location.js
import {
  getCampus
} from '../../../service/home'

import {
  BASE_URL
} from '../../../service/config'

const BACK_TOP = 500

Page({
  data: {
    toBottom: 260,
    triggered: false,
    nowLocation: '',
    currentPage: 1,
    schoolList: [],
    canBack: 1,
    totalPages: 1,
    showEnd: false,
    showBackTop: false,
    // 判断定位用于哪个模块
    localJudge:'shop'
  },
  async onLoad(options) {
    const pages=getCurrentPages()
    const prevPage = pages[pages.length - 2]
    if(!prevPage||prevPage.route=='pages/WCH/home/home'){
      this.data.localJudge='shop'
    }else if(prevPage.route=='pages/LSK/sociality/homePage/homePage'){
      this.data.localJudge='socialty'
      let allCampus={
        campusName:'所有校区'
      }
      this.data.schoolList.unshift(allCampus)
      this.setData({
        schoolList:this.data.schoolList
      })
    }
    wx.createSelectorQuery().select('.address').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      if(this.data.localJudge=='shop'){
        this.setData({
          toBottom: res[0].bottom * 2,
          canBack: Number(options ? options.canback : this.data.canBack),
          nowLocation: wx.getStorageSync('address') || '未定位'
        })
      }else if(this.data.localJudge=='socialty'){
        this.setData({
          toBottom: res[0].bottom * 2,
          canBack: Number(options ? options.canback : this.data.canBack),
          nowLocation: wx.getStorageSync('campusSocialName') || '未定位'
        })
      }
    })
    // 获取第一页
    this._getCampus(1)
  },
  _getCampus(currentPage) {
    if(currentPage <= this.data.totalPages) {
      getCampus({
        pageNum: currentPage,
        pageSize: 15
      }).then(res => {
        wx.hideLoading()
        this.data.totalPages = res.data.data.total
        this.data.schoolList.push(...res.data.data.list)
        this.setData({
          schoolList: this.data.schoolList
        })
      })
    } else {
      this.setData({
        showEnd: true
      })
    }
  },
  cancelLocate() {
    wx.navigateBack()
  },
  scrollToLower() {
    if(this.data.currentPage < this.data.totalPages) {
      this._getCampus(++this.data.currentPage)
    }
  },
  reLocate(e) {
    // 提示框
   if(this.data.localJudge=='shop'){
    wx.showModal({
      content: '将' + e.currentTarget.dataset.location.campusName + '设置为当前位置？',
      showCancel: true,
      title: '提示',
      success: (res) => {
        if(res.confirm) {
          // console.log(e.currentTarget.dataset.location);
          wx.setStorageSync('address', e.currentTarget.dataset.location.campusName)
          wx.setStorageSync('campusId', e.currentTarget.dataset.location.campusId)
          wx.setStorageSync('sendPrice', Number(e.currentTarget.dataset.location.campusCost).toFixed(2))
          if(!wx.getStorageSync('campusSocialName')){
            wx.setStorageSync('campusSocialName', '所有校区')
          }
          wx.setStorageSync('minPrice', Number(e.currentTarget.dataset.location.campusMinPrice).toFixed(2))
          // 修改当前定位
          this.setData({
            nowLocation: wx.getStorageSync('address')
          })
          wx.reLaunch({
            url: '/pages/WCH/home/home',
          })
        }
      }
    })
   }
   else if(this.data.localJudge=='socialty'){
    wx.showModal({
      content: '是否切换到' + e.currentTarget.dataset.location.campusName,
      showCancel: true,
      title: '提示',
      success: (res) => {
        if(res.confirm) {
          console.log(e.currentTarget.dataset.location);
          wx.setStorageSync('campusSocialName', e.currentTarget.dataset.location.campusName)
          // 修改当前定位
          this.setData({
            nowLocation: wx.getStorageSync('campusSocialName')
          })
          wx.reLaunch({
            url: '/pages/LSK/sociality/homePage/homePage',
          })
        }
      }
    })
   }
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
  onRefresh() {
    this.data.schoolList = []
    this.setData({
      triggered: true,
      currentPage: 1,
      showEnd: false
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