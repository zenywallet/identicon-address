var Canvas = require('canvas');
var Color = require("color");

var SIZE = 96;
var BG_COLOR = 0xffeeeeee;
var STEP_SIZE = Math.PI / 50;
var TWO_PI = Math.PI * 2;

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xF).toString(16));
  }
  return hex.join("");
}

function UIntToColor(uint_color)
{
  var a = (uint_color >> 24) & 0xff;
  var r = (uint_color >> 16) & 0xff;
  var g = (uint_color >> 8) & 0xff;
  var b = (uint_color >> 0) & 0xff;
  return Color.rgb([r, g, b, a]);
}

function ColorToUInt(color)
{
  return (color.alpha() << 24) | (color.red() << 16) |
    (color.green() << 8) | (color.blue() << 0);
}

function getColorDistance(e1, e2)
{
  var rmean = (e1.red() + e2.red()) / 2;
  var r = e1.red() - e2.red();
  var g = e1.green() - e2.green();
  var b = e1.blue() - e2.blue();
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
}

function getComplementaryColor(colorToInvert)
{
  var rgbaColor = ColorToUInt(colorToInvert);
  return UIntToColor(0xFFFFFF00 ^ rgbaColor);
}

function Spirograph() {
}

Spirograph.getImage = function(hash_data, size = 96, round = 0) {
  var hash;
  if (typeof hash_data === 'string') {
    var hash = new Uint8Array(hexToBytes(hash_data));
  } else {
    var hash = hash_data;
  }

  var canvas = new Canvas(size, size);
  if (hash.length != 16) {
    return canvas.toBuffer();
  }
  var ctx = canvas.getContext('2d');

  var sizeDiv2 = size / 2;
  var innerRadius = sizeDiv2 / 2;
  var outerRadius = innerRadius / 2 + 1;
  var point1 = (0.5 - hash[0] / 255) * (size - (innerRadius + outerRadius));
  var point2 = (0.5 - hash[1] / 255) * (size - (innerRadius + outerRadius));
  var point3 = (0.5 - hash[2] / 255) * (size - (innerRadius + outerRadius));
  var gb_color = UIntToColor(BG_COLOR);
  var color1 = Color.rgb(hash[15], hash[14], hash[13]);
  if (getColorDistance(color1, gb_color) <= 32.0) {
    color1 = getComplementaryColor(color1);
  }
  var color2 = Color.rgb(hash[12], hash[11], hash[10]);
  if (getColorDistance(color2, gb_color) <= 32.0) {
    color2 = getComplementaryColor(color2);
  }
  var color3 = Color.rgb(hash[9], hash[8], hash[7]);
  if (getColorDistance(color3, gb_color) <= 32.0) {
    color3 = getComplementaryColor(color3);
  }
  var revolutions = Math.max(5, hash[3] >> 2);

  function line_draw(point, color) {
    var x, y;
    var t = 0;
    var moveTo = true;
    ctx.strokeStyle = color.rgb().string();
    ctx.beginPath();
    do {
      x = ((innerRadius + outerRadius) * Math.cos(t) +
        point * Math.cos((innerRadius + outerRadius) * t / outerRadius) + sizeDiv2);
      y = ((innerRadius + outerRadius) * Math.sin(t) +
        point * Math.sin((innerRadius + outerRadius) * t / outerRadius) + sizeDiv2);
      if (moveTo) {
        ctx.moveTo(x, y);
        moveTo = false;
      } else {
        ctx.lineTo(x, y);
      }
      t += STEP_SIZE;
    } while (t < TWO_PI * revolutions);
    ctx.stroke();
    ctx.closePath();
  }

  line_draw(point1, color1);
  line_draw(point2, color2);
  line_draw(point3, color3);

  if(round) {
    ctx.beginPath();
    ctx.globalCompositeOperation = "destination-in";
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill()
  }

  return canvas.toBuffer();
}

module.exports = Spirograph;
