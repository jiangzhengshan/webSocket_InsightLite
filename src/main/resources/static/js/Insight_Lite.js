var stompClient;
var displayLength = [2, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8];
var marginArr = [9, 11, 15, 10, 10, 6, 6, 5, 5, 4, 3];
var dotSizeArr = [10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5];
var basicImageWidth = [];
var nextLevel = 0;
var displayArray = [];
var arr_four = [];
var canvasList= [];
var ratio = window.devicePixelRatio;
var audio = new Audio();
var dotSize = 0
$(function () {
    var ppi = 401
    var basicInchArr = [0.361 / 25.4, 0.451 / 25.4, 0.577 / 25.4, 0.722 / 25.4, 0.902 / 25.4, 1.137 / 25.4, 1.444 / 25.4, 1.805 / 25.4, 2.256 / 25.4, 2.888 / 25.4, 3.61 / 25.4]
    basicInchArr = basicInchArr.reverse()
    basicInchArr.forEach(element => {
        basicImageWidth.push(element * ppi)
        // basicDiagonalWidth.push(this.calculatedDiagonal(element * ppi))
    });
    // audio.src = "audio/Let's start.mp3";
    drawDiagram();
})

function drawDiagram() {
    getRandomDirection();
    removeDraw();
    changeDotPos();
    for (var d = 0; d < displayLength[nextLevel]; d++) {
        canvasFont(d, basicImageWidth[nextLevel])
    }
}

function removeDraw() {
    canvasList = [];
}

function changeDotPos() {
    dotSize = dotSizeArr[nextLevel];
}

function getRandomDirection() {
    arr_four = []
    getRandom()
    var length = displayLength[nextLevel]
    var currentLength = length <= 4 ? length : arr_four.length
    for(var i = 0; i < currentLength; i++) {
        displayArray.push(arr_four[i])
    }
    if (length > 4) {
        var item_first = arr_four[0]
        arr_four[0] = arr_four[1]
        arr_four[1] = item_first
        var item_second = arr_four[1]
        arr_four[1] = arr_four[3]
        arr_four[3] = item_second
        for(var n = 0; n < length - 4; n++) {
            displayArray.push(arr_four[n])
        }
    }
}
function getRandom() {
    var direction = Math.floor(Math.random() * 4) + 1;
    if (arr_four.length < 4) {
        for(var i = 0;i <= arr_four.length; i++) {
            if (direction == arr_four[i]) {
                break;
            } else {
                if (i == arr_four.length) {
                    arr_four.push(direction);
                    break;
                }
            }
        };
        getRandom();
    }
}

function canvasFont(direction, Physics_pixel_size) {
    var canvasHeight = Physics_pixel_size / ratio
    var canvasWidth = Physics_pixel_size / ratio
    var enlargeDiagnoal = basicImageWidth[nextLevel]
    var canvas_size = {
        direction: direction,
        fontSizeWidth: canvasWidth,
        fontSizeHeight: canvasHeight,
        enlargeDiagnoal: enlargeDiagnoal,
        canvasId: 'canvas' + new Date().getTime(),
        margin: marginArr[nextLevel]
    }
    canvasList.push(canvas_size)
    // console.log(canvasList)
    drawCanvas(canvasList.length - 1)
}

function drawCanvas(index) {
    var graph = canvasList[index];
    var canvasId = graph.canvasId;
    var direction = graph.direction - 1;
    var enlargeDiagnoal = graph.enlargeDiagnoal
    var canvasWidth = graph.fontSizeWidth
    var canvasHeight = graph.fontSizeHeight
    //
    var div = document.createElement('div');
    $(".device_visual_size").append(div)
    var canvas = document.createElement('canvas');
    canvas.id = canvasId
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.marginLeft = graph.margin + "px"
    canvas.style.marginRight = graph.margin + "px"
    div.append(canvas)
    // 创建点
    var drawDot = document.createElement('div');
    drawDot.className = "draw_dot"
    drawDot.style.width = dotSize + "px"
    drawDot.style.height = dotSize + "px"
    div.append(drawDot)
    var theCanvas = document.getElementById(canvasId);
    var context = theCanvas.getContext("2d");
    context.clearRect(0, 0, enlargeDiagnoal, enlargeDiagnoal)
    var standard =  canvasWidth / 5 // 标准等分块(截取画布的宽)
    var marginsize = (canvasHeight - standard * 3) / 2 // 扣掉的物理距离
    if (direction == 0 || direction == 2) {
        var coordinateX = (enlargeDiagnoal - canvasHeight) / 2
        var coordinateY = (enlargeDiagnoal - canvasWidth) / 2
        context.fillRect(coordinateX, coordinateY, canvasHeight, canvasWidth) // 绘制图形“E”
        if (direction == 0) {
            context.clearRect(coordinateX + standard, 0, marginsize, coordinateY + standard * 4)
            context.clearRect(coordinateX + marginsize + standard * 2, 0, marginsize, coordinateY + standard * 4)
        } else {
            context.clearRect(coordinateX + standard, coordinateY + standard, marginsize, coordinateY + standard * 4)
            context.clearRect(coordinateX + marginsize + standard * 2, coordinateY + standard, marginsize, coordinateY + standard * 4)
        }
    } else {
        var coordinateX = (enlargeDiagnoal - canvasWidth) / 2
        var coordinateY = (enlargeDiagnoal - canvasHeight) / 2
        context.fillRect(coordinateX, coordinateY, canvasWidth, canvasHeight) // 绘制图形“E”
        if (direction == 1) {
            context.clearRect(coordinateX + standard, coordinateY + standard, standard * 4 + coordinateX, marginsize)
            context.clearRect(coordinateX + standard, coordinateY + marginsize + standard * 2, standard * 4 + coordinateX, marginsize)
        } else {
            context.clearRect(coordinateX, coordinateY + standard, standard * 4, marginsize)
            context.clearRect(coordinateX, coordinateY + marginsize + standard * 2, standard * 4, marginsize)
        }
    }
}



function connect() {
    var socketjs = new SockJS("/chat");
    stompClient = Stomp.over(socketjs);
    stompClient.connect({}, function (frame) {
        stompClient.subscribe("/user/queue/chat", function (greeting) {
            var msgContent = JSON.parse(greeting.body);
            $("#chat").append("<div>" + msgContent.from + ":" + msgContent.content + "</div>");
        });
    })
}