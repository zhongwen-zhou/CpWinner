/*
 *  eventPage.js
 */


var Pinned_Tab = null;

/**
 *  插件成功启动后回调
 */
function onInit() {
    beginScheduleAlarm();
    chrome.tabs.query({ pinned: true }, function (tabs) {
        if (tabs) {
            Pinned_Tab = tabs[0];
        }
    });
}

/**
 *  定时任务执行入口
 */
function onAlarm(alarm) {
    if (alarm) {
        switch (alarm.name) {
            case 'startSync':
                startSync();
                break;
            default:
                console.log('未找到该Alarm的处理类型！！！', alarm);
                break;
        }
    }
}

/**
 *  启动定时任务
 */
function beginScheduleAlarm() {
    //1000ms后，每隔5min触发一次
    chrome.alarms.create('startSync', { when: Date.now() + 1000, periodInMinutes: 5 });
}

//  插件前端展示页面，用于插件与用户交互
var popupWindow;

//  接受前端展示页面，绑定执行环境
function acceptPopupWindow(_window){
    popupWindow = _window;
    popupWindow.acceptData({'orderTotalCount' : 37, 'orderWaitPayCount' : 46, 'orderPaiedCount' : 15});
}

/**
 *  同步
 *  会检索整个插件中的订单，按照列表页面分组，如果某一列表页面所有订单详情都收到，则开始传输
 *  供后台定时任务或前端手动触发
 */
function startSync(){
  console.log('start sync order...');
  for(var pageUrl in ordersObj){
    checkSend(pageUrl);
  }
}

/**
 * 
 * 插件的订单管理，数据结构
 *
 * ordersObj = {
 *   'page_1_url' : { //页面url，用于表示 第n页，page_url如果不同，而订单相同，则通过后端去重
 *     'nos' : [123,345,456], //该页一共有的订单编号，添加时进行去重判断
 *     'orders' : {           //该页具体的订单数据
 *       '123' : {            //订单编号，服务器对数组解析不如map方便
 *         'orderId' : '123',
 *         'orderStartedAt' : '2017-08-23 12:32:45',
 *         ...
 *       },
 *       ...
 *     }
 *   }
 * }
 *
 */
var ordersObj = {};
/**
 *  列表抓取页面调用的每一页订单编号
 *  pageUrl，表示该页面是订单列表的第几页
 *  orderNos 表示该页面的订单编号
 */
function acceptOrderNos(pageUrl, orderNos){

  //如果没有定义则初始化
  if(_.isUndefined(ordersObj[pageUrl])){
    ordersObj[pageUrl] = {
      'nos' : [],
      'orders' : {}
    }
  }

  var pageOrdersNos = ordersObj[pageUrl]['nos'];
  if(pageOrdersNos){
    //有该页面的订单编号
    pageOrdersNos = _.concat(pageOrdersNos, orderNos);
  }else{
    //没有该页面的订单编号
    ordersObj[orderNos.pageUrl] = orderNos.orderNos;
  }

  //去重，防止页面刷新引起的订单编号重复加入
  pageOrdersNos = _.uniq(pageOrdersNos);

  ordersObj[pageUrl]['nos'] = pageOrdersNos;
}

/**
 *  清空某页面下的某个订单编号
 *  清空后做检查是否可以推送到服务端的操作
 */
function clearPageOrderNoAndSend(openerUrl, orderId){
    var pageOrdersNos = ordersObj[openerUrl]['nos'];

    // 清空该页面中的这个订单编号
    if(pageOrdersNos){
      _.remove(pageOrdersNos, function(item) {
        return item == orderId;
      });
    }

    //检查是否可以发送该页数据
    checkSend(openerUrl);

}


/**
 *  检查某列表页面订单数据是否可以发送
 *  当列表页面中的所有订单详情数据都已经收到时，则可以发送，在收到服务器成功响应后再删除数据;
 */
function checkSend(pageUrl){
  var pageOrdersObj = ordersObj[pageUrl];
  var pageOrdersNos = pageOrdersObj['nos'];
  if(pageOrdersNos.length == 0){
    //当nos中为空时，就可以发送该页面订单数据
    postOrdersToServer(pageUrl);
  }
}

/**
 *
 *  服务器接受的数据结构
 *  {
 *   'pageUrl' : 'http://tm.orderlist/page_1', //订单列表页面
 *   'sendAt' : '2017-8-23 12:34:12',          //发送时间
 *   'ascCode' : 'fewfawefewafaewfewafaewf',   //md5加密后的摘要
 *   'data' : {
 *     'orderNos' : ['no123', 'no234', 'no345'],  //订单编号列表 
 *     'no23434354545' : {// 订单编号为no23434的订单
 *       'orderId' : 'no23434354545',
 *       'orderStartedAt' : '2018-9-2 12:34:43'
 *     }
 *   } 
 *  }
*/

/**
 *
 *  将数据经过打包和加密之后发送到服务端
 *  并且在服务端返回成功后删除前端该页面数据
 */
function postOrdersToServer(pageUrl){
  var sendData = {};
  sendData['pageUrl'] = pageUrl;
  sendData['sendAt'] = _.now();
  sendData['data'] = ordersObj[pageUrl]['orders'];

  var packageData = packageData(sendData);
  var encryptData = encryptData(packageData);

  $.ajax({
      url: API_HOST + SYNC_ORDER_URL,
      data: encryptData,
      type: 'post',
      dataType: 'json',
      success: function (data) {
          callback.call(null,data);
      },
      error : function(err){
           callback.call(null,{flag:0});
      }
  });  
}



/**
 *  接收订单详情页面抓取的订单数据推送
 *  openerUrl 表示这个订单是来自于哪一页，与上面数据结构结合使用
 *  order 表示具体的订单详情
 */
function acceptOrderDetail(openerUrl, order){
    console.log('接收到新的Order');    
    console.log(order);

    var pageOrders = ordersObj[openerUrl];
    if(_.indexOf(pageOrders.nos, order.orderId)!=-1){
      // nos包含有该订单编号，说明没有被处理，做处理操作
      pageOrders.orders[order.orderId] = order;
    }else{
      // nos没有包含该订单编号，说明已被处理，抛弃
    }
    // 清空nos中的该订单编号，并做是否发送处理
    clearPageOrderNoAndSend(openerUrl, order.orderId);

    // sendResponse({ msg: '成功处理Order'});
}

chrome.runtime.onInstalled.addListener(function () {
    onInit();
});
chrome.alarms.onAlarm.addListener(function (alarm) {
    onAlarm(alarm);
});

/**
 *  接收内嵌页面content_page消息
 */
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  var cmd = request.cmd;
  var data = request.data;
  // 列表页面发送订单编号
  if (cmd == 'request-send-orderNos') {
    acceptOrderNos(data.pageUrl, data.orderNos);
  }

  // 详情页面发送订单详情
  if (cmd == 'request-send-order') {
    acceptOrderDetail(data.openerUrl, data.order);
  }     
});
