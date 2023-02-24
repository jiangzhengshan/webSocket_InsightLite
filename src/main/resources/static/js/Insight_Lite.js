var displayLength = [2, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8];
var marginArr = [9, 11, 15, 10, 10, 6, 6, 5, 5, 4, 3];
var dotSizeArr = [10, 10, 9, 8, 8, 7, 7, 6, 6, 5, 5];
var basicImageWidth = [];
var nextLevel = 0;
var displayArray = [];
var arr_four = [];
var canvasList= [];
var ratio = window.devicePixelRatio;
var start_audio = new Audio('audio/start.mp3');
var audio = new Audio('audio/ding.mp3');
var wrongCount = 0
var basicVisualValueArr = ['4.0', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9', '5.0'];
var userInput = [];
var userDirection = 0;
var swipeCount = 0;
var incorrect = 0;
var eyeCheck = 0
var ppi = Math.sqrt(Math.pow(window.screen.availWidth, 2) + Math.pow(window.screen.availHeight, 2)) / 24;
var basicInchArr = [43.6332 / 25.4, 34.47 / 25.4,  27.489 / 25.4, 21.869 / 25.4, 17.3704 / 25.4, 13.7968 / 25.4, 10.9607 / 25.4, 8.7048 / 25.4, 6.9159 / 25.4, 5.4934 / 25.4, 4.3633 / 25.4]
basicInchArr.forEach(element => {
    basicImageWidth.push(element * ppi)
    // basicDiagonalWidth.push(this.calculatedDiagonal(element * ppi))
});

//保存webScoket的对象
websocket = null
//连接后端的地址(这里要替换成自己后端的连接地址)
websocketUrl = 'ws://localhost:6657/websocket'
//判断是否重新连接
lockReconnect = false

$(function () {
    var defaultLang = navigator.language;
    if (defaultLang != "zh-CN") {
        defaultLang = "en"
    }
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "/i18n/",
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function() {
            console.log('i18n has been completed.')
        }
    })
    $(".test_eye").hide()
    // 初始化页面先显示二维码
    webScoketInit()
})

function webScoketInit() {
    //判断当前浏览器是否支持WebSocket
    if ('WebSocket' in window) {
        if (websocket != null) {
            websocket.close();
            websocket = null;
        }
    } else {
        alert('Not support websocket')
    }
    //连接后端的地址
    websocket = new WebSocket(websocketUrl);

    //连接发生错误的回调方法
    websocket.onerror = function (event) {
        //尝试重新连接
        reconnect(websocketUrl);
        console.log('连接错误')
    };

    //连接成功建立的回调方法
    websocket.onopen = function (event) {
        //心跳检测重置
        // heartCheck.reset().start();
        console.log('连接开启')
    }

    //接收到消息的回调方法
    websocket.onmessage = function (event) {
        //心跳检测重置
        // heartCheck.reset().start();
        //获取到后台发送的数据并转为json类型
        let res = JSON.parse(event.data)
        if (res.messageId == 65536) {
            websocket.send(JSON.stringify({
                "messageId": 32
            }));
        }
        // 会话创建成功二维码粗处信息
        if (res.memberLeft != undefined) {
            console.log(event.data)
            $(".code").qrcode({width: 300, height: 300, text: event.data});
        }
        // 收到匹配成功消息
        if (res.messageId == 36) {
            $(".code").hide()
            $(".test_eye").show()
            drawDiagram();
        }
        // 收到方向消息
        if (res.messageId == 35) {
            var direction = res.body
            if (direction = 65538) {
                direction = 1
            } else if (direction = 65541) {
                direction = 2
            } else if (direction = 65539) {
                direction = 3
            } else {
                direction = 4
            }
            userDirection = direction
            userInput.push(userDirection)
            swipeCount++
            changeDotPos();
            verifyLevel()
        }
    }


    //连接关闭的回调方法
    websocket.onclose = function (event) {
        //尝试重新连接
        reconnect(websocketUrl);
        console.log('连接关闭')
    }

    //监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，server端会抛异常。
    window.onbeforeunload = function () {
        closeWebSocket();
    }

    //重新连接
    function reconnect(url) {
        if (lockReconnect) return;
        lockReconnect = true;
        //没连接上会一直重连，设置延迟避免请求过多
        setTimeout(function () {
            // that.websocket = new WebSocket(url);
            webScoketInit();
            lockReconnect = false;
        }, 2000);
    }

    //心跳检测
    // var heartCheck = {
    //     //1分钟发一次心跳,时间设置小一点较好（50-60秒之间）
    //     timeout: 55000,
    //     timeoutObj: null,
    //     serverTimeoutObj: null,
    //     reset: function () {
    //         clearTimeout(this.timeoutObj);
    //         clearTimeout(this.serverTimeoutObj);
    //         return this;
    //     },
    //     start: function () {
    //         var self = this;
    //         this.timeoutObj = setTimeout(function () {
    //             //这里发送一个心跳，后端收到后，返回一个心跳消息，
    //             //onmessage拿到返回的心跳就说明连接正常
    //             websocket.send("Msg");
    //             //如果超过一定时间还没重置，说明后端主动断开了
    //             self.serverTimeoutObj = setTimeout(function () {
    //                 //如果onclose会执行reconnect，我们执行socket.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
    //                 websocket.close();
    //             }, self.timeout)
    //         }, this.timeout)
    //     }
    // }

    //关闭WebSocket连接
    function closeWebSocket() {
        websocket.close();
    }
}

function init() {
    nextLevel = 0;
    displayArray = [];
    arr_four = [];
    canvasList= [];
    wrongCount = 0
    userInput = [];
    userDirection = 0;
    swipeCount = 0;
    incorrect = 0;
    $(".check_eye").children(0).text('leftEye Check')
    $(".canvasList").remove()
    drawDiagram();
}

function drawDiagram() {
    getRandomDirection();
    canvasList = [];
    for (var d = 0; d < displayLength[nextLevel]; d++) {
        canvasFont(displayArray[d], basicImageWidth[nextLevel])
    }
    changeDotPos();
}

function changeDotPos() {

    for (var i = 0; i< $(".draw_dot").length; i++)
        if (i == swipeCount) {
            $(".draw_dot")[i].style.opacity = 1
        } else {
            $(".draw_dot")[i].style.opacity = 0
        }
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
        canvasId: 'canvas' + canvasList.length,
        margin: marginArr[nextLevel]
    }
    canvasList.push(canvas_size)
    drawCanvas(canvasList.length - 1)
}

function drawCanvas(index) {
    var graph = canvasList[index];
    var canvasId = graph.canvasId;
    var direction = graph.direction - 1;
    var enlargeDiagnoal = graph.enlargeDiagnoal
    var canvasWidth = graph.fontSizeWidth
    var canvasHeight = graph.fontSizeHeight

    var div = document.createElement('div');
    div.className = "canvasList"
    $(".device_visual_size").append(div)
    var canvas = document.createElement('canvas');
    canvas.id = canvasId
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.marginLeft = graph.margin + "px"
    canvas.style.marginRight = graph.margin + "px"
    div.append(canvas)
    var drawDot = document.createElement('div');
    drawDot.className = "draw_dot"
    drawDot.style.width = dotSizeArr[nextLevel] + "px"
    drawDot.style.height = dotSizeArr[nextLevel] + "px"
    // drawDot.style.opacity = canvasList.length == 1 ? 1 : 0;
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

function click1(val) {
    // audio.play()
    audio.volume = 1;
    audio.loop = false;
    userDirection = val
    userInput.push(userDirection)
    swipeCount++
    changeDotPos();
    verifyLevel()
}

function verifyLevel() {
    if (swipeCount == displayLength[nextLevel]) {
        for (var i = 0; i < userInput.length; i++) {
            if (userInput[i] !== displayArray[i]) incorrect++;
        }
        wrongCount = wrongCount + incorrect
        console.log('错误次数' + wrongCount)
        if (nextLevel == 10 && displayLength[nextLevel] / 2 > incorrect) {
            this.finalResult(nextLevel)
        } else if (displayLength[nextLevel] / 2 <= incorrect) {
            nextLevel = nextLevel == 0 ? nextLevel : nextLevel - 1
            this.finalResult(nextLevel)
        } else {
            nextLevel += 1;
            userInput = [];
            incorrect = 0;
            swipeCount = 0;
            displayArray = [];
            $(".canvasList").remove()
            this.drawDiagram();
        }
    }
}

function finalResult(finalPassedLevel) {
    var vaResult = basicVisualValueArr[finalPassedLevel]
    var decimalScore = (nextLevel / 10) - (0.02 * wrongCount)
    decimalScore = decimalScore < 0 ? -decimalScore : decimalScore
    var vaScore = parseInt(decimalScore * 100) // 做成百分制
    if (eyeCheck == 0) {
        localStorage.vaOD = vaResult
        // localStorage.vaODScore = vaScore
        eyeCheck = 1
        init()
    } else {
        localStorage.vaOS = vaResult
        $(".canvasList").remove()
        var h3 = document.createElement('h1');
        h3.className = "test_over"
        h3.innerText = "Test Done"
        $(".device_visual_size").append(h3)
        $(".vaOD").children(0).text("vaOD:"+localStorage.vaOD)
        $(".vaOS").children(0).text("vaOS:"+localStorage.vaOS)
    }
}



