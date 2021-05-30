// initialized
var stepCount = 0;
var snCount = 0;
var countsAudio = [];
var snImages = [];
var leftAudio;
var rightAudio;
var instructionsAudio;
var endAudio;
var bgAudio;
var start_btn;
var stop_btn;
var states = ["INIT", "PLAYING", "PAUSED"];
var current_state = "INIT";
var timer_id = [];

function initialize() {
    document.getElementById("top-msg").innerHTML = "I am ready!";

    setTimeout(() => {
        document.getElementById("top-msg").innerHTML =
            "Scroll down for <strong>Instructions and more Information</strong>.";
    }, 2000);


    start_btn = document.getElementById("play_pause_btn");
    stop_btn = document.getElementById("stop_btn");

    start_btn.disabled = false;
    stop_btn.disabled = true;

    load_commands_audio();
    load_bg_audio();
    load_images();
    displayEstimatedTime();
}

function load_commands_audio() {
    console.log("Loading voice commands ...");
    instructionsAudio = document.getElementById("initial-instructions");
    instructionsAudio.volume = 1.0;
    endAudio = document.getElementById("end-instructions");
    endAudio.volume = 1.0;
    for (var i = 1; i <= 12; i++) {
        var audio = document.getElementById("" + i);
        audio.volume = 1.0;
        countsAudio.push(audio);
    }

    rightAudio = document.getElementById("right");
    rightAudio.volume = 0.5;
    leftAudio = document.getElementById("left");
    leftAudio.volume = 0.5;
}

function load_bg_audio() {
    console.log("Loading background music ...");

    bgAudio = document.getElementById("background_music");
    bgAudio.loop = true;
}

function load_images() {
    console.log("Loading images ...");

    for (var i = 0; i <= 12; i++) {
        var img = new Image();
        img.src = "images/" + i + ".png";
        snImages.push(img);
    }
}

function bgMusicPlay() {
    var bgMusicCB = document.getElementById("bg_music_cb");
    if (bgMusicCB.checked) {
        bgAudio.volume = 0.2;
        bgAudio.play();
    } else {
        bgAudio.pause();
    }
}

function bgMusicStart() {
    var bgMusicCB = document.getElementById("bg_music_cb");
    if (bgMusicCB.checked) {
        bgAudio.volume = 0.2;
        bgAudio.play();
    }
}

function bgMusicStop() {
    var bgMusicCB = document.getElementById("bg_music_cb");
    if (bgMusicCB.checked) {
        bgAudio.volume = 0.05;
        bgAudio.play();
    }
}

function start_pause_continue() {
    if (current_state == "INIT") {
        stop_btn.disabled = false;
        start_btn.value = "Pause";
        current_state = "PLAYING";

        initial_instructions_and_start_counting();

        return;
    }

    if (current_state == "PLAYING") {
        start_btn.value = "Continue";
        current_state = "PAUSED";

        decrementCount();

        stopAllAudio();
        clearAllTimers();

        hideImage();

        return;
    }

    if (current_state == "PAUSED") {
        start_btn.value = "Pause";
        current_state = "PLAYING";

        start_counting();

        return;
    }
}

function stop() {
    stop_btn.disabled = true;
    current_state = "INIT";
    start_btn.value = "Start";
    stepCount = 0;
    snCount = 0;
    clearAllTimers();
    hideImage();
    stopAllAudio();
}

function stopAllAudio() {
    stopAudio(instructionsAudio);
    stopAudio(endAudio);
    stopAudio(leftAudio);
    stopAudio(rightAudio);
    bgMusicStop();
    for (var i = 0; i < countsAudio.length; i++) {
        stopAudio(countsAudio[i]);
    }
}

function stopAudio(audio) {
    audio.pause();
    audio.currentTime = 0;
}

function clearAllTimers() {
    for (var i = 0; i < timer_id.length; i++) {
        clearTimeout(timer_id[i]);
    }

    timer_id = [];
}

function initial_instructions_and_start_counting() {
    console.log("Initial instructions...");
    displayImage(true);
    clearDisplay();
    showImage();
    displayEstimatedTime();
    
    var dur = parseFloat(instructionsAudio.duration);
    if(isNaN(dur)) {
        dur = 11;
    }
    instructions_duration = dur * 1000;
    bgMusicStart();
    instructionsAudio.play();

    initial_delay = document.getElementById("delay").value * 1000;

    timer_id.push(setTimeout("start_counting()", instructions_duration + initial_delay));
}

function start_counting() {
    displayEstimatedTime();
    bgMusicStart();
    showImage();
    clearAllTimers();
    next_count();
}

function next_count() {
    if (current_state != "PLAYING") {
        return;
    }
    console.log("Count: " + snCount + " : " + stepCount);
    sayAndDisplayCount();
    timer_id.push(setTimeout("next_count()", gapBetweenCounts()));

    incrementCount();

    if (snCount >= document.getElementById("totalSN").value) {
        clearAllTimers();
        end_instructions_and_stop();
    }
}

function incrementCount() {
    stepCount++;
    if (stepCount == 12) {
        snCount++;
        stepCount = 0;
    }
}

function decrementCount() {
    stepCount--;
    if (stepCount == -1) {
        if (snCount == 0) {
            stepCount = 0;
        } else {
            snCount--;
            stepCount = 11;
        }
    }
}

function end_instructions_and_stop() {
    lastCountDuration = countsAudio[countsAudio.length - 1].duration * 1000;
    endAudioDuration = endAudio.duration * 1000;

    timer_id.push(setTimeout("endAudio.play()", lastCountDuration));

    timer_id.push(setTimeout("stop()", lastCountDuration + endAudioDuration));
}

function sayAndDisplayCount() {
    displayImage();
    displayCounts();
    countsAudio[stepCount].play();
    if (stepCount == 3 || stepCount == 8) {
        if (snCount % 2 == 0)
            setTimeout("rightAudio.play()", 400);
        else
            setTimeout("leftAudio.play()", 400);
    }
}

function displayCounts() {
    snCountText = document.getElementById("current-sn");
    snCountText.innerHTML = "" + (snCount + 1);

    stepCountText = document.getElementById("current-sn-step");
    stepCountText.innerHTML = "" + (stepCount + 1);
}

function displayImage(reset) {
    img = document.getElementById("sn-pos-img");
    imgNum = stepCount + 1;
    if (reset) {
        imgNum = 0;
    }
    img.src = snImages[imgNum].src;
}

function showImage() {
    div_sn_pos = document.getElementById("sn-pos-img-div");
    div_sn_pos.classList.remove("hide-sn-image-div");
    div_sn_pos.classList.add("show-sn-image-div");
}

function hideImage() {
    div_sn_pos = document.getElementById("sn-pos-img-div");
    div_sn_pos.classList.remove("show-sn-image-div");
    div_sn_pos.classList.add("hide-sn-image-div");
}

function clearDisplay() {
    snCountText = document.getElementById("current-sn");
    snCountText.innerHTML = "";

    stepCountText = document.getElementById("current-sn-step");
    stepCountText.innerHTML = "";
}

function gapBetweenCounts() {
    // to be set using UI later
    var num_cycles = 1;
    var speed_variation = 0.4;

    var MAX_GAP = 10000;
    var MIN_GAP = 1000;

    var totalSN = parseInt(document.getElementById("totalSN").value);
    if (totalSN <= 10) speed_variation = 0;

    var avg_speed = parseFloat(document.getElementById("speed_range").value);

    var t = ((snCount * 12.0 + stepCount) / ((totalSN - 1.0) * 12.0 + 11.0));

    var gap = avg_speed + Math.cos(t * 2.0 * Math.PI * num_cycles) * speed_variation * avg_speed;

    if (gap > MAX_GAP) gap = MAX_GAP;
    if (gap < MIN_GAP) gap = MIN_GAP;

    console.log(gap);

    return gap;
}

function speedRange_changed() {
    displayEstimatedTime();
}

function totalSN_changed() {
    displayEstimatedTime();
}

function displayEstimatedTime() {
    var elem = document.getElementById("total-time-estimate");
    elem.innerHTML = "Approx. total time: " + msToTime(totalTimeEstimateMs());
}

function totalTimeEstimateMs() {
    var totalSN = parseInt(document.getElementById("totalSN").value);
    var avg_speed = parseFloat(document.getElementById("speed_range").value);

    return totalSN * 12 * avg_speed;
}

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}
