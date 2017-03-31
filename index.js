var five = require("johnny-five");
var Edison = require("edison-io");
var board = new five.Board({
    io: new Edison()
});

var r = 0, g = 0, b = 0;

board.on("ready", function () {

    // Plug the Rotary Angle sensor module
    // into the Grove Shield's A0 jack
    var rotary = new five.Sensor("A3");
    var light = new five.Sensor("A1");
    var thermometer = new five.Thermometer({
        controller: "GROVE",
        pin: "A0"
    });
    // var light = new five.Light({
    //     controller: "TSL2561"
    // });

    // Plug the LCD module into any of the
    // Grove Shield's I2C jacks.
    var lcd = new five.LCD({
        controller: "JHD1313M1"
    });
    
    var interval = 2000;

    var f = 0;
    var readingTemperature = true;
    thermometer.on("data", function () {
        if (!readingTemperature || f === Math.round(this.fahrenheit)) {
            return;
        }
        readingTemperature = false;

        f = Math.round(this.fahrenheit);

        r = linear(0x00, 0xFF, f, 70, 90);
        setTimeout(function () {
            lcd.bgColor(r, g, b).cursor(0, 0).print('temperature:' + f + 'F');
            readingTemperature = true;
        }, interval);
    });

    var readingLight = true;
    light.on("change", function() {
        if(!readingLight) { return; }
        readingLight = false;
        g = linear(0x00, 0xFF, this.value, 0, 100);
        setTimeout(function () {
            lcd.bgColor(r, g, b).cursor(0, 0).print('Light Level:' + this.value);
            readingLight = true;
        }, interval);
    });

    // light.on("change", function () {
    //     g = linear(0x00, 0xFF, this.level, 100);
    //     lcd.bgColor(r, g, b).cursor(1, 0).print("Ambient Light Level: ", this.level);
    // });

    // Set scaling of the Rotary angle
    // sensor's output to 0-255 (8-bit)
    // range. Set the LCD's background
    // color to a RGB value between
    // Red and Violet based on the
    // value of the rotary sensor.
    //   rotary.scale(0, 255).on("change", function() {
    //     var r = linear(0xFF, 0x4B, this.value, 0xFF);
    //     var g = linear(0x00, 0x00, this.value, 0xFF);
    //     var b = linear(0x00, 0x82, this.value, 0xFF);

    //     lcd.bgColor(r, g, b);
    //   });

});

// [Linear Interpolation](https://en.wikipedia.org/wiki/Linear_interpolation)
function linear(start, end, feed, step, steps) {
    return (end - start) * (feed - step) / (steps - step) + start;
}