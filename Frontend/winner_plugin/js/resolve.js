xinmiOrder = {};    //心米订单
xinmiOrder.items = [];  //心米订单商品明细

var orderBaseInfoMapper = {
    'orderId' : {
        'selector' : "[data-reactid='.2.0.0.0.0.0.0.1.$3.1.$0']",
        'remark' : "订单编号",
    },
    'orderStartedAt' : {
        'selector' : "[data-reactid='.1.0.$1.0.3.0']",
        'remark' : "买家下单"
      },
    'payAt' : {
        'selector' : "[data-reactid='.1.0.$2.0.3.0']",
        'remark' : "买家付款"
    },
    'deliveAt' : {
        'selector' : "[data-reactid='.1.0.$3.0.3.0']",
        'remark' : "卖家发货"
    },
    'complexAddressInfo' : {
        'selector' : "[data-reactid='.2.0.0.0.0.0.0.1.$0.1.$0']",
        'remark'    : "详细收货信息"
    },
    'buyerNick' : {
        'selector' : ".short-dd-nick",
        'remark'    : "用户昵称"
    },
    'itemsTotalPrice' : {
        'selector' : "[data-reactid='.4.0.0.0.1.$0.$0.0.0.0.2.0.0.0.2']",
        'remark' : "商品总价"
    },
    'freight' : {
        'selector' : "[data-reactid='.4.0.0.0.1.$0.$1.0.0.0.2.0.0.0.2']",
        'remark' : "运费"
    },
    'orderMoney' : {
        'selector' : "[data-reactid='.4.0.0.0.1.$0.$2.0.0.0.2.0.0.0.2']",
        'remark'    : '订单总价'
    },
    'payMoney' : {
        'selector' : "[data-reactid='.4.0.0.0.1.$0.$2.0.0.0.2.0.0.0.2']",
        'remark' : '实际支付'
    }
}

var orderItemMapper = {
    'name' : {
        'selector' : ".item-link",
        'remark' : '商品名'
    },
    'price' : {
        'selector' : "[data-reactid='.3.1.0.0.0.0.$0.1:$0.0.0.1.$0.0']",
        'remark' : '单价'
    },
    'num' : {
        'selector' : "[data-reactid='.3.1.0.0.0.0.$0.1:$0.0.0.2']",
        'remark' : '数量'
    },
    'discount' : {
        'selector' : "[data-reactid='.3.1.0.0.0.0.$0.1:$0.0.0.3']",
        'remark' : '优惠'
    },
    'status' : {
        'selector' : "[data-reactid='.3.1.0.0.0.0.$0.1:$0.0.0.4.$0.0']",
        'remark' : '交易状态'
    }
}


/**
 *  解析订单基本信息
 */
function parseOrderBaseInfo(){
    for(var key in orderBaseInfoMapper){
        try{
            var value = $(orderBaseInfoMapper[key]['selector'])[0].textContent;        
            console.log(key+":"+value); 
            xinmiOrder[key] = value;
        }catch(e){
            console.log(orderBaseInfoMapper[key]['remark']+" 不存在")
        }
    }   
}

/**
 *  解析订单商品明细
 */
function parseOrderItems(){
    var ordersSize = $("[data-reactid='.3.1.0.0.0.0.$0.1:$0'] tr").length;
    console.log('当前有 '+ordersSize+' 条订单');
    for(var i =0;i<ordersSize;i++){
        var item = {};
        for(var key in orderItemMapper){
            try{                
                var value = $(orderItemMapper[key]['selector'])[i].textContent;        
                console.log(key+":"+value);                 
                item[key] = value;                
            }catch(e){
                console.log(orderItemMapper[key]['remark']+" 不存在")
            }
        }
        xinmiOrder.items.push(item);  
    }
    console.log(xinmiOrder.items);
}

parseOrderBaseInfo();
console.log('--------------');
parseOrderItems();

