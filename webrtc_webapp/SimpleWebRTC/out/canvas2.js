//定义宽和高
var canvasWidth = Math.min(800, $(window).width() - 20) // 适配移动端
var canvasHeight = canvasWidth

var strokeColor = 'black' //当前笔的颜色
var isMouseDown = false  // 定义鼠标是否按下
var lastLoc = {x: 0, y: 0} //定义上一次鼠标的位置,
var lastTimestamp = 0 //定义时间戳
var lastLineWidth = -1 //定义上一次线条的宽度


var canvas = document.getElementById('canvas_board') //拿到canvas
var drawCanvas = document.getElementById('drawCanvas') //拿到img

var context = canvas.getContext('2d') // 拿到相应的上下文绘图环境

var remoteMsg = {
    point: {},
    lasP: {},
    lasT: 0,
    lasL: -1
};
//设定画布的宽和高
canvas.width = canvasWidth
canvas.height = canvasHeight
//图片与画布展示一致，宽高一致
drawCanvas.width = canvasWidth
drawCanvas.height =canvasHeight

//适配移动端
$('#controller').css('width', canvasWidth + 'px')
// 绘制米字格
drawGrid()

//canvas导出数据流，传值给后台
function returnData(data) {
    // 触发服务端'startConnect'事件，传值给后台
    webrtc.flashBoard(data)
}
// 轮循
var longPolling
function polling() {
    longPolling = setInterval(function() {
        returnData(remoteMsg) }, 1)
}
// 清除按钮操作
$("#clear_btn").click(
    function(e) {
        context.clearRect(0, 0, canvasWidth, canvasHeight)
        drawGrid() //重新绘制米字格
        returnData() //发送数据流给服务器
    }
)
// 选择绘画颜色
$(".color_btn").click(
    function(e){
        $('.color_btn').removeClass('color_btn_selected')
        $(this).addClass('color_btn_selected')
        strokeColor = $(this).css('background-color')
    }
)

//逻辑整合
function beginStroke(point) {
    isMouseDown = true
    remoteMsg.lasP = windowToCanvas(point.x, point.y )
    lastLoc = windowToCanvas(point.x, point.y )
    lastTimestamp = new Date().getTime()
    remoteMsg.point = point;
    polling()
}

function endStroke() {
    isMouseDown = false
    clearInterval(longPolling) // 清除轮询
    remoteMsg = {
        point: {},
        lasP: {},
        lasT: 0,
        lasL: -1
    };
}


// 绘画
function moveStroke(point){
    // //核心代码
    // var curLoc = windowToCanvas(point.x, point.y )
    // var curTimestamp = new Date().getTime()
    // /****Draw Start****/
    // context.beginPath()
    // context.moveTo(lastLoc.x, lastLoc.y)
    // context.lineTo(curLoc.x, curLoc.y)
    //
    // //计算速度
    // var s = calcDistance(curLoc, lastLoc)
    // var t = curTimestamp - lastTimestamp
    // var lineWidth = calcLineWidth( t, s )
    //
    // context.strokeStyle = strokeColor
    // context.lineWidth = lineWidth
    // context.lineCap = 'round'
    // context.lineJoin = 'round'
    // context.stroke()
    // /****Draw End****/
    // lastLoc = curLoc
    // lastTimestamp = curTimestamp
    // lastLineWidth = lineWidth
}

// 绘画
function moveStroke2(data){
    console.log(data)
    console.log(remoteMsg)
    var point = data.point
    var lasP = data.lasP
    var lasT = data.lasT
    var lasL = data.lasL
    //核心代码
    var curLoc = windowToCanvas(point.x, point.y )
    var curTimestamp = new Date().getTime()
    /****Draw Start****/
    context.beginPath()
    context.moveTo(lasP.x, lasP.y)
    context.lineTo(curLoc.x, curLoc.y)

    //计算速度
    var s = calcDistance(curLoc, lasP)
    var t = curTimestamp - lasT
    var lineWidth = calcLineWidth( t, s, lasL)

    context.strokeStyle = strokeColor
    context.lineWidth = lineWidth
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
    /****Draw End****/
    remoteMsg.lasP = curLoc
    remoteMsg.lasT = curTimestamp
    remoteMsg.lasL = lineWidth
}
//鼠标事件，web端
canvas.onmousedown = function(e){
    e.preventDefault() //阻止默认的动作发生
    beginStroke({ x: e.clientX, y: e.clientY })
}
canvas.onmouseup = function(e){
    e.preventDefault()
    endStroke()
}
canvas.onmouseout = function(e){
    e.preventDefault()
    endStroke()
}
canvas.onmousemove = function(e){
    if (isMouseDown) { // 确定鼠标按下
        e.preventDefault()
        moveStroke({x: e.clientX, y: e.clientY}) //可以绘图了
        // beginStroke({ x: e.clientX, y: e.clientY })
        remoteMsg.point = { x: e.clientX, y: e.clientY };
        // polling(remoteMsg)
    }
}

//触控事件，移动端
canvas.addEventListener('touchstart', function(e){
    e.preventDefault()
    touch = e.touches[0]
    beginStroke({ x: touch.pageX, y: touch.pageY })
})
canvas.addEventListener('touchmove', function(e){
    e.preventDefault()
    if (isMouseDown) { // 确定鼠标按下
        touch = e.touches[0]
        moveStroke2({ x: touch.pageX, y: touch.pageY }) //可以绘图了
    }
})
canvas.addEventListener('touchend', function(e){
    e.preventDefault()
    endStroke()
})


/**
 * 计算笔的宽度
 */
function calcLineWidth(t, s, l) {
    if (!l){
        l = lastLineWidth;
    }
    var v = s / t
    var resultLineWidth = 0
    if ( v <= 0.1 ) {
        resultLineWidth = 10
    } else if ( v >= 10 ) {
        resultLineWidth = 1
    } else {
        resultLineWidth = 10 - (v - 0.1) / (10 - 0.1) * (10 - 1)
    }
    if (l ==    -1) {
        return resultLineWidth
    } else {
        return l * 2/3 + resultLineWidth * 1/3
    }

}
/**
 * 计算距离
 */
function calcDistance(loc1, loc2) {
    return Math.sqrt((loc1.x - loc2.x)*(loc1.x - loc2.x) + (loc1.y - loc2.y)*(loc1.y - loc2.y))
}
/**
 * 窗口到画布的位置
 */
function windowToCanvas(x, y) {
    var box = canvas.getBoundingClientRect()
    return {x: Math.round(x-box.left), y: Math.round(y-box.top)}
}

/** 绘制米字格 **/
function drawGrid() {
    context.save()
    //绘制红色的正方形边框
    context.strokeStyle = "rgb(230, 11, 9)"

    context.beginPath()
    context.moveTo(3, 3)
    context.lineTo(canvasWidth - 3, 3)
    context.lineTo(canvasWidth - 3, canvasHeight - 3)
    context.lineTo(3, canvasHeight - 3)
    context.closePath()

    context.lineWidth = 6
    context.stroke()

    //绘制米字格
    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(canvasWidth, canvasHeight)
    context.moveTo(canvasWidth, 0)
    context.lineTo(0, canvasHeight)
    context.moveTo(canvasWidth / 2, 0)
    context.lineTo(canvasWidth / 2, canvasHeight)
    context.moveTo(0, canvasHeight / 2)
    context.lineTo(canvasWidth, canvasHeight / 2)
    context.closePath()

    context.lineWidth = 1
    context.stroke()
    context.restore()
}