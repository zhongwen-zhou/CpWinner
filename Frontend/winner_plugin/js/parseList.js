console.log('parseOrderList plugin start work...');

var xinmiOrderNos = [];

var orderDetailUrl = 'https://trade.taobao.com/detail/orderDetail.htm?bizOrderId=';
var orderListMapper = {
    'orderId' : {
        'selector' : "[name='orderid']",
        'remark' : "订单编号",
    },
    'pervPage' : {
        'selector' : "[data-reactid='.0.5.0.2.0.0']",
        'remark' : '上一页'
    },
    'nextPage' : {
        'selector' : "[data-reactid='.0.5.0.2.0.1']",
        'remark' : '下一页'
    }
}


/**
 *  解析订单商品编号列表
 */
function parseOrderNos(){
    var ordersSize = $(orderListMapper.orderId.selector).length;
    console.log('当前有 '+ordersSize+' 条订单');
    for(var i =0;i<ordersSize;i++){
        var item = {};
        var dom = $(orderListMapper['orderId']['selector'])[i];
        var value = dom.value;
        console.log('找到第 '+i+' 条订单，编号为：'+value);
        xinmiOrderNos.push(value);        
    }
    console.log(xinmiOrderNos);

    chrome.extension.sendMessage({ cmd: "request-send-orderNos", data : { pageUrl : window.location.href, orderNos : xinmiOrderNos} }, function (response) {
      console.log('已经将本页面订单编号成功传值给插件静默进程');
      console.log(response.msg);
    });

    var nextPageBtn = $(orderListMapper.nextPage.selector)[0];
    if(nextPageBtn){
      if(!nextPageBtn.disabled){
        nextPageBtn.click();
      }
    }
}

/**
 *  打开订单详情页面
 */
function openOrderDetailTab(){
    for(var i = 0;i<xinmiOrderNos.length;i++){
      var url = orderDetailUrl + xinmiOrderNos[i];
      console.log(url);
      openTab(url, i+1);      
    }
}

/**
 *  根据url和waitTime打开新的标签页
 */
function openTab(url, waitTime){
  setTimeout(function(){
    window.open(url);
  }, 1000*waitTime);
}

function validateOrder(order){
    return true;
}
parseOrderNos();
openOrderDetailTab();
