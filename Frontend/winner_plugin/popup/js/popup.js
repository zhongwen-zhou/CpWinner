var bg = chrome.extension.getBackgroundPage();

bg.acceptPopupWindow(this);
var orderTotalCount = 0;
var orderWaitPayCount = 0;
var orderPaiedCount = 0;

$('#syncBtn').click(function(){
	bg.startSync();
})

function acceptData(data){
	console.log(data);
	orderTotalCount = data.orderTotalCount;
	orderWaitPayCount = data.orderWaitPayCount;
	orderPaiedCount = data.orderPaiedCount;

	$('#orderTotalNo')[0].innerText = orderTotalCount;
	$('#orderWaitpPayNo')[0].innerText = orderWaitPayCount;
	$('#orderPaiedNo')[0].innerText = orderPaiedCount;
}