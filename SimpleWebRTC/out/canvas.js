//定义宽和高
var canvasWidth = 1920 // 适配移动端
var canvasHeight = 804

var strokeColor = 'black' //当前笔的颜色
var isMouseDown = false  // 定义鼠标是否按下

var canvas = document.getElementById('canvas_board') //拿到canvas

var context = canvas.getContext('2d') // 拿到相应的上下文绘图环境

var arr = {}
var uuid
var userMouse = []
var mineId = localStorage.getItem('userId')
var mineIcon = localStorage.getItem('icon')
var mouseSize = 25
//设定画布的宽和高
canvas.width = canvasWidth
canvas.height = canvasHeight
//适配移动端
$('#controller').css('width', '100%')


// 屏幕适配
var standardWidth = canvasWidth
var standardHeight = canvasHeight

var myWidthK = $("#board")[0].clientWidth / standardWidth
var myHeightK = $("#board")[0].clientHeight / standardHeight

//canvas生成光标数据，传值给后台
function synStartMouse(data) {
    webrtc.flashMouse(data)
}
//canvas导出数据流，传值给后台
function synStartDraw(point) {
    // 触发服务端'startConnect'事件，传值给后台
    webrtc.flashBoard({'uuid':uuid, 'point':point, 'room': room})
}
//canvas导出数据流，传值给后台
function synEndDraw(uuid) {
    // 触发服务端'startConnect'事件，传值给后台
    webrtc.endFlash(uuid)
}

// 清除按钮操作
$("#clear_btn").click(
    function(e) {
        context.clearRect(0, 0, canvasWidth, canvasHeight)
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
function beginStroke() {
    isMouseDown = true
}

function endStroke() {
    isMouseDown = false
    synEndDraw(uuid)
}

// 清除绘画id
function removeUUID(id){
    delete eval(arr)[id]
}

// 绘画
function moveStroke(data){
    //核心代码
    if (!arr[data.uuid]){
        arr[data.uuid] = []
    }
    var tempArr = arr[data.uuid]
    var tempPoint = data.point
    tempPoint.x = tempPoint.x * myWidthK
    tempPoint.y = tempPoint.y * myHeightK
    if (tempArr.length > 0){
        context.moveTo(tempArr[tempArr.length -1].x,tempArr[tempArr.length -1].y)
        context.lineTo(tempPoint.x, tempPoint.y)
        context.stroke()
    }
    arr[data.uuid].push(tempPoint)
}

// a()
function a() {
    alert($("#plane")[0].clientHeight)
}

// 绘其他用户鼠标路径
function flashMouseData(data){
    if (data.userId !== mineId){
        data.point.x = data.point.x * myWidthK
        data.point.y = data.point.y * myHeightK
        if (userMouse.indexOf(data.userId) == -1){
            var icon = document.createElement('img')
            icon.src = data.icon
            icon.id = data.userId
            icon.className = 'mouse_cursor_style'
            icon.style.left = data.point.x - mouseSize/2  + 'px'
            icon.style.top = data.point.y - mouseSize/2 + 'px'
            icon.style.width = mouseSize + 'px'
            icon.style.height = mouseSize + 'px'
            var father = document.getElementById('plane')
            father.appendChild(icon)
            userMouse.push(data.userId)
        }
        var userPoint = document.getElementById(data.userId)
        userPoint.style.left = data.point.x - mouseSize/2 + 'px'
        userPoint.style.top = data.point.y - mouseSize/2 + 'px'
    }
}

//鼠标事件，web端
canvas.onmousedown = function(e){
    e.preventDefault() //阻止默认的动作发生
    initUUID()
    beginStroke()
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
    e.preventDefault()
    var mouse = {'point':{x: e.clientX / myWidthK, y: e.clientY / myHeightK},'userId': mineId ,'icon':mineIcon}
    synStartMouse(mouse)
    if (isMouseDown) { // 确定鼠标按下
        e.preventDefault()
        synStartDraw({x: e.clientX / myWidthK, y: e.clientY / myHeightK})
    }
}

//触控事件，移动端
canvas.addEventListener('touchstart', function(e){
    e.preventDefault()
    touch = e.touches[0]
    initUUID()
    beginStroke()
})
canvas.addEventListener('touchmove', function(e){
    e.preventDefault()
    touch = e.touches[0]
    var mouse = {'point':{x: touch.clientX / myWidthK, y: touch.clientY / myHeightK},'userId': mineId ,'icon':mineIcon}
    synStartMouse(mouse)
    if (isMouseDown) { // 确定鼠标按下
        synStartDraw({x: touch.clientX / myWidthK, y: touch.clientY / myHeightK})
    }
})
canvas.addEventListener('touchend', function(e){
    e.preventDefault()
    endStroke()
})

/**
 * 窗口到画布的位置
 */
function windowToCanvas(x, y) {
    var box = canvas.getBoundingClientRect()
    return {x: Math.round(x-box.left), y: Math.round(y-box.top)}
}

/** 绘制米字格 **/
function drawGrid() {
}

/**
 * 初始化房间绘图
 */
function initDraw(data){
    Object.keys(data).forEach(function (id) {
        var temp = data[id]
        if (data[id].length>1){
            for(var i=1; i<temp.length; i++){
                context.moveTo(temp[i-1].x * myWidthK,temp[i-1].y * myHeightK)
                context.lineTo(temp[i].x * myWidthK,temp[i].y * myHeightK)
                context.stroke()
            }
        }
    })
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

/**
 * uuid
 * @returns {string}
 */
function getUuid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
function initUUID(){
    uuid = getUuid()
    arr[uuid] = []
}