/**
 * 设置中间放大屏的按钮
 * @param video
 * @param midVideo
 */
function setMidButton(video, midVideo) {
        $("#mid_video").empty();
        var copyNode = video.cloneNode();
        copyNode.srcObject = video.srcObject;
        // copyNode.style.width = '400%';
        copyNode.style.height = '400%';
        var div = document.createElement('div');
        div.className = 'videoContainer';
        //创建录制按钮
        div.appendChild(copyNode);
        //附加按钮
        div.appendChild(buttonSet(copyNode, addButton, 'recorderControl', "录制"));
        var bt = buttonSet(copyNode, addButton, 'downloadButton', "下载", "a")
        bt.style.display = 'none'
        div.appendChild(bt);
        // div.appendChild(setVolMute(copyNode));
        midVideo.appendChild(div);

        // 设置视频录制 start
        var recorder = new MediaRecorder(copyNode.srcObject);
        var recorderControl=document.getElementById("recorderControl");
        recorderControl.onclick=function(){
            this.textContent=="录制"? copyNode.play():copyNode.pause();
            this.textContent=="录制"?recorder.start():recorder.stop();
            this.textContent=this.textContent=="录制"?"停止":"录制";
        };
        var buffers=[];
        recorder.ondataavailable=function(event){
            buffers=event.data;
        }
        var downloadButton=document.getElementById("downloadButton");
        recorder.onstop=function(){
            var file = new File([buffers], "录制视频.mp4", {type: 'mpeg4', lastModified: Date.now()});
            var url=URL.createObjectURL(file);
            downloadButton.href = url;
            downloadButton.download="录制视频.mp4";
            downloadButton.click();
            buffers=null;
        };
        // 设置视频录制 end
}
function buttonSet(volEl, func, id, text, tag = "button", y){
    volEl.muted = true;
    var bt = document.createElement(tag)
    bt.className = 'small_video_menu'
    return func(volEl, bt, id, text, y)
}

function addButton(volEl, bt, id, text){
    bt.id = id;
    bt.appendChild(document.createTextNode(text))
    return bt;
}

// 调整视频设置
function setVidTag(volEl, bt, id, text, y) {
    bt.innerHTML = text
    bt.style.top = y + "px"
    bt.onclick = function () {
        if (bt.innerHTML == vidTag1){
            videoOff()
            bt.innerHTML = vidTag2
        } else {
            videoOpen()
            bt.innerHTML = vidTag1
        }
    }
    return bt
}

// 调整视频设置
function setAudTag(volEl, bt, id, text, y) {
    bt.innerHTML = text
    bt.style.top = y + "px"
    bt.onclick = function () {
        if (bt.innerHTML == audTag1){
            audioOff()
            bt.innerHTML = audTag2
        } else {
            audioOpen()
            bt.innerHTML = audTag1
        }
    }
    return bt
}

//静音设置
function setVolMute(volEl, bt) {
    //附加按钮
    setVolMuteTag(bt, volEl)
    bt.onclick = function () {
        //绑定点击事件
        volEl.muted = !volEl.muted;
        setVolMuteTag(bt, volEl)
    }
    return bt
}
//静音设置状态变更
function setVolMuteTag(btEl, volEl) {
    if (volEl.muted) {
        btEl.innerHTML = tag2
    } else {
        btEl.innerHTML = tag1
    }
}