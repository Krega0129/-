// pages/storeDetails/storeDetails.js
import {
  getShopInfo,
  getShopDetail,
  shopIdGetShopLicense
} from '../../../service/shop'
import {
  BASE_URL, H_config
} from '../../../service/config'
import { showToast, previewImage } from '../../../utils/util';
const app = getApp()

Page({
  data: {
    shopId: null,
    totalPrice: app.globalData.totalPrice,
    totalCount: app.globalData.totalCount,
    sendPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2),
    storeName: '店家名称',
    storeDesc: '商家简介',
    storeImgURL: '',
    storeAddress: '商家地址',
    storeTelNum: '',
    storeNotice: '暂无公告',
    showShopLicense: false,
    licenseImg: [],
    licenseName: ['营业证书', '其他证书', '商铺内部', '商铺外部'],
    TabCur: 0,
    TabIndex: 0,
    tabTitleList: ['点餐', '商家'],
    showStoreIntro: false,
    showFoodDetails: false,
    showCartList: false,
    showSpecification: false,
    showImg: false,
    imgUrl: '',
    // 商品的详情信息
    foodDetails: {},
    chooseFood: {},
    // 垂直导航栏当前id
    MainCur: 0,
    VerticalNavTop: 0,
    // 选规格时的商品id
    foodId: null,
    // 购物车列表
    // cartList: app.globalData.cartList,
    cartList: [],
    // 商品信息
    goodsCategoryList: [],
    // 规格当前商品规格
    specificationList: [],
    // 垂直导航的标题
    list: [],
    load: true
  },
  onLoad() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 接收首页传过来的shopId
    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('sendStoreInfo', data => {
      this.setData({
        shopId: data.shopId
      })
      this.renewCartList()
      // 获取店铺信息
      getShopInfo({
        shopId: this.data.shopId,
        userId: wx.getStorageSync('userId')
      }).then(res => {
        if(res && res.data && res.data.code === H_config.STATECODE_getShopInfo_SUCCESS) {
          const shopInfo = res.data.data
        
          this.setData({
            storeName: shopInfo.shopName,
            storeDesc: shopInfo.shopIntroduce,
            storeAddress: shopInfo.detailAddress,
            storeImgURL: BASE_URL + '/' + shopInfo.shopHead,
            storeTelNum: shopInfo.contactPhone,
            sendPrice: (Number(wx.getStorageSync('sendPrice')) / 2).toFixed(2)
          })
        } else {
          showToast('网络异常')
        }
        wx.hideLoading()
      }).then(() => {
        // 获取商品信息
        getShopDetail({
          shopId: this.data.shopId
        }).then(res => {
          if(res && res.data && res.data.code === H_config.STATECODE_getShopDetails_SUCCESS) {
            let List = res.data.data

            // 处理后台返回的数据
            for(let item of List) {
              let foodList = {
                categoryId: null,
                categoryName: null,
                foodsList: []
              }

              foodList.categoryId = item.categoryId
              foodList.categoryName = item.categoryName

              for(let food of item.dates) {
                // foodItem
                let foodListItem = {
                  id: null,
                  name: null,
                  intro: null,
                  saleNumber: null,
                  specification: [],
                  price: null,
                  // 规格字符串
                  specStr: '',
                  num: 0
                }

                foodListItem.id = food.commodityId
                foodListItem.shopId = food.shopId
                foodListItem.name = food.commodityName
                foodListItem.imgUrl = BASE_URL + '/' + food.commodityPhoto
                foodListItem.price = food.commodityPrice
                foodListItem.intro = food.commodityDetail
                foodListItem.saleNumber = food.saleNumber
                // 有规格
                if(food.specs.length) {
                  for(let specs of food.specs) {
                    if(specs) {
                      // 规格
                      let specListItem = {
                        specName: null,
                        id: null,
                        specId: null,
                        list: []
                      }

                      specListItem.specName = specs.specName
                      specListItem.id = specs.specCommodityId
                      specListItem.specId = specs.specId
                      
                      for(let list of specs.attributes) {
                        // 规格列表
                        let spec = {
                          attributeName: null,
                          specId: null,
                          attributeId: null,
                          attributePrice: 0,
                          check: false
                        }

                        spec.attributeName = list.attributeName
                        spec.attributePrice = list.attributePrice ? list.attributePrice : 0

                        // 压入规格列表
                        specListItem.list.push(spec)
                        specListItem.list[0].check = true
                      }

                      // 压入规格
                      foodListItem.specification.push(specListItem)
                    }
                  }
                }
                // 压入食物
                foodList.foodsList.push(foodListItem)
              }
              this.data.goodsCategoryList.push(foodList)
            }
            
            this.setData({
              goodsCategoryList: this.data.goodsCategoryList
            })
          } else {
            showToast('网络异常')
          }
          wx.hideLoading()
        }).then(() => {
          // 加载购物车
          if(this.data.cartList[0]) {
            console.log(this.data.cartList);
            for(let item of this.data.goodsCategoryList) {
              for(let food of this.data.cartList) {
                let cartFood = item.foodsList.find(goods => goods.id === food.id)
                if(cartFood) {
                  cartFood.num = food.num
                }
              }
            }
            app.culPrice(this.data.cartList)
            this.renewCartList()
            this.setData({
              totalCount: app.globalData.totalCount,
              goodsCategoryList: this.data.goodsCategoryList,
              totalPrice: app.globalData.totalPrice
            })
          }
        }).then(() => {
          // 分类列表
          let list = [{}];
          for (let i = 0; i < this.data.goodsCategoryList.length; i++) {
            list[i] = {};
            list[i].name = this.data.goodsCategoryList[i].categoryName;
            list[i].id = i;
          }

          this.setData({
            list: list,
            listCur: list[0]
          })
        })
      }).then(() => {
        wx.hideLoading()
      })
    })
  },
  onShow() {
    // 更新购物车
    if(app.globalData.cartList.find(item => item.shopId === this.data.shopId)) {
      this.data.cartList = app.globalData.cartList.find(item => item.shopId === this.data.shopId).foodList
      this.setData({
        cartList: this.data.cartList
      })
    }

    // 支付完后返回
    if(!this.data.cartList[0]) {
      for(let item of this.data.goodsCategoryList) {
        for(let food of item.foodsList) {
          food.num = 0
        }
      }
      app.culPrice(this.data.cartList)
      this.setData({
        totalCount: app.globalData.totalCount,
        goodsCategoryList: this.data.goodsCategoryList,
        totalPrice: app.globalData.totalPrice
      })
    }
  },
  renewCartList() {
    let foodList= app.globalData.cartList.find(item => item.shopId === this.data.shopId)
    if(foodList) {
      this.setData({
        cartList: foodList.foodList
      })
    }
  },
  // 商家简介
  showStoreIntro() {
    this.setData({
      showStoreIntro: true
    })
  },
  // copyPhoneNum() {
  //   wx.setClipboardData({
  //     //准备复制的数据
  //     data: this.data.storeTelNum,
  //     success() {
  //       wx.showToast({
  //         title: '复制成功',
  //       });
  //     }
  //   })
  // },
  hideStoreIntro() {
    this.setData({
      showStoreIntro: false
    })
  },
  // 商品列表滑倒底部
  reachBottom() {
      let list = this.data.list
      this.setData({
        TabCur: list[list.length - 1].id
      })
  },
  // 水平导航
  tapTabIndex(e) {
    this.setData({
      TabIndex: e.currentTarget.dataset.id
    })
  },
  // 垂直导航
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },
  // 在详情页面首次添加无规格商品 / 添加含规格商品
  addSingleFood(food, tag, attributePrice) {
    // 在商品详情页首次添加
    if(typeof food.id !== 'number') food = this.data.foodDetails

    food = {...food, attrPrice: attributePrice || 0}
    
    let foodInfo = null
    // 改变对象里的数据
    for(let item of this.data.goodsCategoryList) {
      foodInfo = item.foodsList.find(item => item.id === food.id)
      if(foodInfo) {
        if(!tag) {
          // 嵌入shopId
          foodInfo.shopId = this.data.shopId
          // foodInfo.attrbutePrice = attributePrice
          app.addToCart(foodInfo, tag)
        } else {
          foodInfo.num++
          food.num++

          // 嵌入shopId
          food.shopId = this.data.shopId

          app.addToCart(food, tag)
        }
        this.setData({
          foodDetails: foodInfo
        })
      }
    }
    // 更新购物车 
    this.renewCartList()
    this.setData({
      goodsCategoryList: this.data.goodsCategoryList,
      totalPrice: app.globalData.totalPrice,
      totalCount: app.globalData.totalCount
    })
   
  },
  // 添加无规格商品 / 在购物车添加无规格商品
  addGoods(e) {
    // 选中的商品
    const goodsItem = e.currentTarget.dataset.food ? e.currentTarget.dataset.food : this.data.foodDetails
    // 规格
    const tag = goodsItem.spec
    let foodInfo = null
    // 改变对象里的数据
    for(let item of this.data.goodsCategoryList) {
      foodInfo = item.foodsList.find(item => item.id === goodsItem.id)
      if(foodInfo) {
        // 嵌入shopId
        foodInfo.shopId = this.data.shopId
        if(!this.data.foodDetails) {
          this.data.foodDetails.num++
          app.addToCart(foodInfo, tag, true)
        } else {
          app.addToCart(foodInfo, tag)
        }
      }
    }
    this.renewCartList()
    this.setData({
      goodsCategoryList: this.data.goodsCategoryList,
      totalPrice: app.globalData.totalPrice,
      totalCount: app.globalData.totalCount,
      foodDetails: this.data.foodDetails
    })
  },
  // 在购物车添加含规格商品
  addGoodsInCartList(e) {
    const cartFood = e.currentTarget.dataset.food
    
    if(cartFood.spec) {
      this.addSingleFood(cartFood, cartFood.spec, cartFood.attrPrice)
    } else {
      this.addGoods(e)
    }
  },
  // 减商品数量
  removeGoods(e) {
    const goodsItem = e.currentTarget.dataset.food ? e.currentTarget.dataset.food : this.data.foodDetails

    let foodInfo = null
    let cartFood = null

    // 有规格，购物车对象
    if(goodsItem.spec) {
      cartFood = this.data.cartList.find(item => item.id === goodsItem.id && item.spec === goodsItem.spec)
    }
    else {
      cartFood = this.data.cartList.find(item => item.id === goodsItem.id)
    }

    for(let item of this.data.goodsCategoryList) {
      // 商品列表对象
      foodInfo = item.foodsList.find(item => item.id === goodsItem.id)
      if(foodInfo && (foodInfo.num > 0 || foodInfo.count > 0) ) {
        if(cartFood.count) {
          cartFood.count--
        }
        foodInfo.num--
        // 同步相同商品不同规格的总数量
        for(let food of this.data.cartList) {
          if(food.id === foodInfo.id) {
            food.num = foodInfo.num
          }
        }
        // 数量为0，删除商品
        if(cartFood.num <= 0 || cartFood.count <= 0) {
          const index = this.data.cartList.indexOf(cartFood)
          this.data.cartList.splice(index, 1)
        }
      }
    }

    app.culPrice(this.data.cartList)
    this.renewCartList()
    this.setData({
      goodsCategoryList: this.data.goodsCategoryList,
      totalPrice: app.globalData.totalPrice,
      totalCount: app.globalData.totalCount,
      foodDetails: this.data.foodDetails
    })
  },
  callStore() {
    wx.showActionSheet({
      itemList: [this.data.storeTelNum],
      success: res => {
        if(res.tapIndex === 0) {
          wx.setClipboardData({
            data: this.data.storeTelNum,
            success() {
              wx.showToast({
                title: '复制成功',
              });
            },
            fail:() => {
              showToast('复制失败')
            }
          })
        }
      }
    })
  },
  hiddenBottomDialog() {
    this.setData({
      showBottomDialog: false
    })
  },
  //商品详情
  showFoodDetails(e) {
    let food = null
    for(let item of this.data.goodsCategoryList) {
      food = item.foodsList.find(res => res.id === e.currentTarget.dataset.food.id)
      if(food) {
        this.setData({
          foodDetails: food,
          showFoodDetails: true
        })
      }
    }
  },
  hideFoodDetails() {
    this.setData({
      foodDetails: {},
      showFoodDetails: false
    })
  },
  // 购物车
  showCartList() {
    this.setData({
      showCartList: true
    })
  },
  hideCartList() {
    this.setData({
      showCartList: false
    })
  },
  // 删除购物车的商品
  deleteCartListItem(e) {
    // 删除目标
    const goodsItem = e.currentTarget.dataset.food
    let cartFood = null
    // 在购物车中查找
    if(goodsItem.spec) cartFood = this.data.cartList.find(item => item.id === goodsItem.id && item.spec === goodsItem.spec)
    else cartFood = this.data.cartList.find(item => item.id === goodsItem.id)

    let foodInfo = null
    // 用于splice删除购物车商品
    const index = this.data.cartList.indexOf(cartFood)

    for(let item of this.data.goodsCategoryList) {
      foodInfo = item.foodsList.find(item => item.id === cartFood.id)

      if(foodInfo) {
        let num = cartFood.num - cartFood.count
        for(let food of this.data.cartList) {
          if(food.id === cartFood.id) {
            food.num = num
            foodInfo.num = food.num
          } else {
            foodInfo.num = 0
          }
        }
        this.data.cartList.splice(index, 1)
        app.culPrice(this.data.cartList)
      }
    }
    this.renewCartList()
    this.setData({
      totalPrice: app.globalData.totalPrice,
      totalCount: app.globalData.totalCount,
      goodsCategoryList: this.data.goodsCategoryList
    })
  },
  // 提示清空购物车
  showDeleteCartTip() {
    wx.showModal({
      title: '提示',
      content: '清除购物车所有内容？',
      success: res => {
        if(res.confirm) {
          this.clearCartList()
        }
      }
    })
  },
  // 清空购物车
  clearCartList() {
    app.globalData.cartList = []
    app.globalData.totalCount = 0
    app.globalData.totalPrice = 0

    // 清空数量
    for(let item of this.data.goodsCategoryList) {
      for(let food of item.foodsList) {
        food.num = 0
      }
    }

    this.setData({
      cartList: app.globalData.cartList,
      totalPrice: app.globalData.totalPrice,
      totalCount: app.globalData.totalCount,
      goodsCategoryList: this.data.goodsCategoryList
    })
  },
  bill() {
    if(this.data.cartList[0]) {
      wx.navigateTo({
        url: '/pages/WCH/bill/bill',
        success: res => {
          res.eventChannel.emit('emitStoreAddress', 
          {
            shopId: this.data.shopId,
            shopName: this.data.storeName,
            storeAddress: this.data.storeAddress, 
            storeTelNum: this.data.storeTelNum, 
            imgUrl: this.data.storeImgURL,
            cartList: this.data.cartList,
            totalPrice: this.data.totalPrice,
            totalCount: this.data.totalCount
          })
        }
      })
    }
    this.hideCartList()
  },
  // 选规格
  chooseSpecification(e) {
    this.data.foodDetails = e.currentTarget.dataset.food
    
    if(e.currentTarget.dataset.food.specification[0]) {
      this.data.specificationList = e.currentTarget.dataset.food.specification
      this.setData({
        specificationList: this.data.specificationList
      })
    }

    this.culAttrPrice()

    this.data.foodDetails.singlePrice = Number(this.data.foodDetails.price + this.data.foodDetails.attributePrice).toFixed(2)

    this.setData({
      foodDetails: this.data.foodDetails,
      foodId: e.currentTarget.dataset.id,
      showSpecification: true
    })
  },
  closeSpecification() {
    this.setData({
      showSpecification: false
    })
  },
  chooseTag(e) {
    console.log(this.data.foodDetails);
    
    // 第几个规格数组
    const index = e.currentTarget.dataset.index
    // 数组中第几个规格
    const ind = e.currentTarget.dataset.ind

    // 单选
    for(let item of this.data.specificationList[index].list) {
      // 其他的不勾选
      item.check = false
    }

    this.data.specificationList[index].list[ind].check = !this.data.specificationList[index].list[ind].check

    this.culAttrPrice()
    
    this.setData({
      foodDetails: this.data.foodDetails,
      specificationList: this.data.specificationList
    })
    
  },
  addSpecification() {
    // 规格列表
    let list = null
    // 规格拼接字符串
    let specStr = ''

    for(let item of this.data.goodsCategoryList) {
      list = item.foodsList.find(it => it.id === this.data.foodId)
      if(list) {
        let tagList = {}
        for(let tag of this.data.specificationList) {
          // tag是每个规格对象
          for(let tags of tag.list) {
            // tags是规格选项
            if(tags.check) {
              // 规格对象
              tagList[tag.specName] = tags.tag
              specStr += tags.attributeName + '/'
            }
          }
        }
        // 添加含规格的商品
        specStr = specStr.substring(0, specStr.length - 1)
        this.addSingleFood(list, specStr, this.data.foodDetails.attributePrice)
      }
    }
    this.closeSpecification()
    this.setData({
      goodsCategoryList: this.data.goodsCategoryList
    })
  },
  culAttrPrice() {
    let price = 0;
    // 计算选中的规格的价格
    for(let attr of this.data.specificationList){
      for(let apr of attr.list) {
        if(apr.check) {
          price += apr.attributePrice
        }
      }
    }
    // 将选中的价格放在对象中
    this.data.foodDetails.attributePrice = price
    this.data.foodDetails.singlePrice = (this.data.foodDetails.price + this.data.foodDetails.attributePrice).toFixed(2)
  },
  checkCer() {
    shopIdGetShopLicense({
      shopId: this.data.shopId
    }).then(res => {
      if(res.data.code == H_config.STATECODE_getShopInfo_SUCCESS) {
        let imgArr = res.data.data
        let keys = Object.keys(imgArr)
        this.data.licenseImg = []
        for(let i in keys) {
          this.data.licenseImg.push(BASE_URL + '/' + imgArr[keys[i]])
        }
        this.setData({
          showShopLicense: true,
          licenseImg: this.data.licenseImg
        })
        wx.hideLoading()
      } else {
        showToast('加载失败')
      }
    })
  },
  hideLicense() {
    this.setData({
      showShopLicense: false
    })
  },
  _previewImage(e) {
    // previewImage(e.currentTarget.dataset.imgurl)
    previewImage(this.data.licenseImg, e.currentTarget.dataset.imgurl)
  },
  onShareAppMessage(options) {
    return {
      title: '啰咪校园',
      path: '/pages/WCH/home/home',
      imageUrl: BASE_URL + '/images/logo.png'
    }
  }
})