// Set the date we're counting down to
var countDownDate = new Date("Jun 21, 2021 7:00:00").getTime();

// Update the count down every 1 second
var x = setInterval(function() {

    // Get todays date and time
    var now = new Date().getTime();

    // Find the distance between now an the count down date
    var distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Output the result in an element with id="demo"
    document.getElementById("idy-date").innerHTML =
    '<span class="clock-font">' + days + '</span>days &nbsp&nbsp' +
    '<span class="clock-font">' + fmt(hours) + '</span>h &nbsp&nbsp' +
    '<span class="clock-font">' + fmt(minutes) + '</span>m &nbsp&nbsp' +
    '<span class="clock-font">' + fmt(seconds) + '</span>s &nbsp To Go'

    // If the count down is over, write some text
    if (distance < 0) {
        clearInterval(x);
        document.getElementById("idy-date").innerHTML = "IDY IS OVER";
    }
}, 1000);

function fmt(num) {
  numStr = "" + num;
  if(numStr.length == 1) {
    return "0" + numStr;
  } else return numStr;
}
