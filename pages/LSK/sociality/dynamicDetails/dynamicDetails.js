// pages/LSK/sociality/dynamicDetails.js
import{loadingOn,loadingOff,showToast,previewImage}from '../../../../utils/util'
import {
  giveThunbUp,
  cancelThunbUp,
  insertComment,
  getComment,
  deleteComment
} from '../../../../service/socialty'
import {
  deleteDynamicById
} from '../../../../service/socialty'
import {
  BASE_URL,
  K_config
} from '../../../../service/config'
// const userId = wx.getStorageSync('userId')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    toTop:null,
    isTriggered:false,
    // 点赞数量
    likeNum:0,
    // 是否点赞
    // isLike:false,
    //文字内容
    // contain:'我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人我是人',
    containBreak:'',
    // replyTo:'帅比林澍锴',
    // commentName:'阿巴阿巴',
    placeholder:'请留下你的评论吧！',
    dynamicDetails:{},
    baseurl:'',
    userId:wx.getStorageSync('userId'),
    comment:'',
    // 分页查询评论
    pageNum:1,
    pageSize:10,
    maxPage:1,
    showEnd:false,
    userId:null,
    // 是否能够删除动态
    canDelete:false,
    // 是否已经请求过评论
    isRefresh:false
  },
  // 点赞
  likeClick:function(e){
    console.log(e);
    let shareId = e.currentTarget.dataset.id
    let isLike = e.currentTarget.dataset.islike
    let pages = getCurrentPages();
    let userId = this.data.userId
    let prevPage = null; //上一个页面
    if (pages.length >= 2) {
        prevPage = pages[pages.length - 2]; //上一个页面
    }
    if(!isLike){
      giveThunbUp(shareId,userId).then((res)=>{
        loadingOff()
        if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_giveThumbUp_SUCCESS){
          showToast('点赞成功',1000)
          // let item = this.data.dynamicList.find(res => res.shareId === shareId)
          // console.log(item);
          this.data.dynamicDetails.isLike=1
          ++this.data.dynamicDetails.likeNumber
          this.setData({
            dynamicDetails:this.data.dynamicDetails
          })
          if(prevPage){
            let i=this.data.dynamicDetails.index
            console.log(i);
            let isLike='dynamicList['+i+'].isLike'
            let likeNumber='dynamicList['+i+'].likeNumber'
            console.log(1,this.data.dynamicDetails.isLike);
            console.log(1,this.data.dynamicDetails.likeNumber);
            prevPage.setData({
                [isLike]: this.data.dynamicDetails.isLike,
                [likeNumber]: this.data.dynamicDetails.likeNumber,
            });
          }
        }
      })
    }
    else{
      cancelThunbUp(shareId,userId).then((res)=>{
        loadingOff()
        if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_cancelThumbUp_SUCCESS){
          showToast('取消点赞成功',1000)
          // let item = this.data.dynamicList.find(res => res.shareId === shareId)
          // console.log(item);
          this.data.dynamicDetails.isLike=0
          --this.data.dynamicDetails.likeNumber
          this.setData({
            dynamicDetails:this.data.dynamicDetails
          })
          if(prevPage){
            let i=this.data.dynamicDetails.index
            console.log(i);
            let isLike='dynamicList['+i+'].isLike'
            let likeNumber='dynamicList['+i+'].likeNumber'
            console.log(1,this.data.dynamicDetails.isLike);
            console.log(1,this.data.dynamicDetails.likeNumber);
            prevPage.setData({
                [isLike]: this.data.dynamicDetails.isLike,
                [likeNumber]: this.data.dynamicDetails.likeNumber,
            });
          }
        }
      })
    }
  },
  // 删除动态
  deleteDynamic:function(){
    wx.showModal({
      content: '是否删除该动态?',
      showCancel: true,
      title: '提示',
      success: (res) => {
        if(res.confirm){
          deleteDynamicById({
            shareId:this.data.dynamicDetails.shareId
          }).then((res)=>{
            loadingOff()
            if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_deleteDynamic_SUCCESS){
              let pages = getCurrentPages();
              let prevPage = null; //上一个页面
              if (pages.length >= 2) {
                  prevPage = pages[pages.length - 2]; //上一个页面
              }
              if(prevPage){
                let i=this.data.dynamicDetails.index
                // let count='dynamicList['+i+'].count'
                prevPage.setData({
                    // [count]: this.data.dynamicDetails.count
                    deleteIndex:i
                });
                prevPage.refreshPage();
              }
              wx.navigateBack({         //返回上一页  
                delta:1
              })
            }
          })
        }
      }
    })

  },
  //回复评论
  sayTo:function(e){
    const replyTo=e.currentTarget.dataset.name
    this.setData({
      placeholder:'回复 '+replyTo+':'
    })
  },
  // 发布评论
  submitComment(e){
    console.log(e);
    let {comment} = e.detail.value
    let userId = this.data.userId
    if(comment.length === 0){
      showToast('评论不能为空', 1000)
      return
    }
    insertComment({
      content:comment,
      nickName:wx.getStorageSync('nickName'),
      userId,
      shareId:this.data.dynamicDetails.shareId
    }).then((res)=>{
      loadingOff()
      if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_insertComment_SUCCESS){
        showToast('发布成功',1000)
        const commentItem = res.data.data 
        let commentList=this.data.dynamicDetails.commentList
        this.setData({
          comment:'',
          'dynamicDetails.count':++this.data.dynamicDetails.count
        })
        if(this.data.pageNum===this.data.maxPage||this.data.maxPage===0){
          commentList.push(commentItem)
          console.log(commentList);
          this.setData({
            'dynamicDetails.commentList':commentList,
          })
        }
        let pages = getCurrentPages();
        let prevPage = null; //上一个页面
        if (pages.length >= 2) {
            prevPage = pages[pages.length - 2]; //上一个页面
        }
        if(prevPage){
          let i=this.data.dynamicDetails.index
          let count='dynamicList['+i+'].count'
          prevPage.setData({
              [count]: this.data.dynamicDetails.count
          });
        }
      }
    })
  },
  // 获取评论列表
  getCommentList(){
    let pageNum=this.data.pageNum
    let pageSize=this.data.pageSize
    let shareId=this.data.dynamicDetails.shareId
    getComment(pageNum,pageSize,shareId).then((res)=>{
        loadingOff()
        if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_getComment_SUCCESS){
          const commentList=[]
          for(let item of res.data.data.list){
            commentList.push(item)
          }            
          this.data.dynamicDetails.commentList.push(...commentList)
          console.log(this.data.dynamicDetails.commentList);
          this.setData({
            'dynamicDetails.commentList':this.data.dynamicDetails.commentList,
            maxPage:res.data.data.pages,
            isRefresh:true
          })
        }
    })
  },
  // 删除评论
  delete:function(e){
    // console.log(e);
    let commentId=e.currentTarget.dataset.id
    let index=e.currentTarget.dataset.index
    console.log(index);
    
    wx.showModal({
      content: '是否删除该评论?',
      showCancel: true,
      title: '提示',
      success: (res) => {
        if(res.confirm){
          deleteComment(commentId).then((res)=>{
            loadingOff()
            if(res.data.code === K_config.STATECODE_SUCCESS || res.data.code === K_config.STATECODE_deleteComment_SUCCESS){
              showToast('删除评论成功!',1000)
              let commentList = this.data.dynamicDetails.commentList
              commentList.splice(index,1)
              if(this.data.pageNum<this.data.maxPage){
                commentList.splice((this.data.pageNum-1)*10,9)
                this.data.dynamicDetails.commentList=commentList
                this.getCommentList()
              }
              console.log(commentList);
              this.setData({
                'dynamicDetails.commentList': commentList,
                'dynamicDetails.count':--this.data.dynamicDetails.count
              })
              let pages = getCurrentPages();
              let prevPage = null; //上一个页面
              if (pages.length >= 2) {
                  prevPage = pages[pages.length - 2]; //上一个页面
              }
              if(prevPage){
                let i=this.data.dynamicDetails.index
                let count='dynamicList['+i+'].count'
                prevPage.setData({
                    [count]: this.data.dynamicDetails.count
                });
              }
            }
            else{
              showToast('删除评论失败,请检查网络是否连接!',1000)
            }
          })
        }
      }
    })

  },
    // 查看图片
    _previewImage(e){
      console.log(e.currentTarget.dataset.image);
      previewImage( [e.currentTarget.dataset.image], e.currentTarget.dataset.image)
    },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.createSelectorQuery().select('.scrollTop').boundingClientRect().selectViewport().scrollOffset().exec(res => {
      console.log(res); 
      this.setData({
        toTop: res[0].bottom * 2
      })
    })
    loadingOn('加载中')
    const dynamicDetails =JSON.parse(options.item)
    console.log(dynamicDetails);
    this.setData({
      baseurl:BASE_URL,
      // userId:userId,
      dynamicDetails:dynamicDetails
    })
    setTimeout(function () {
      loadingOff()
    }, 1000)   
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
    this.setData({
      userId: wx.getStorageSync('userId')
    })
    let pages = getCurrentPages();
    let prevPage = null; //上一个页面
    if (pages.length >= 2) {
        prevPage = pages[pages.length - 2]; //上一个页面
    }
    if(prevPage.route==='pages/LSK/mine/historyDynamic/historyDynamic'){
      this.setData({
        canDelete:true
      })
    }
    if(!this.data.isRefresh){
      this.getCommentList()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  toLoading:function(){
    if(this.data.pageNum<this.data.maxPage){
      ++this.data.pageNum
      this.getCommentList()
      this.setData({
        showEnd:false
      })
    }else{
      this.setData({
        showEnd:true
      })
    }  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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