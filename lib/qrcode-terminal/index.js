var QRCode = require('./main'),
    QRErrorCorrectLevel = require('./QRErrorCorrectLevel'),
    black = "\033[40m  \033[0m",
    //"\033[40m  \033[0m"
white = "\033[47m  \033[0m",
    //"\033[47m  \033[0m" 由于babel严格模式不支持\符号，所有先用特殊符号代替，然后再通过插件替换
toCell = function toCell(isBlack) {
  return isBlack ? black : white;
},
    repeat = function repeat(color) {
  return {
    times: function times(count) {
      return new Array(count).join(color);
    }
  };
},
    fill = function fill(length, value) {
  var arr = new Array(length);

  for (var i = 0; i < length; i++) {
    arr[i] = value;
  }

  return arr;
};

module.exports = {
  error: QRErrorCorrectLevel.L,
  generate: function generate(input, opts, cb) {
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }

    var qrcode = new QRCode(-1, this.error);
    qrcode.addData(input);
    qrcode.make();
    var output = '';

    if (opts && opts.small) {
      var BLACK = true,
          WHITE = false;
      var moduleCount = qrcode.getModuleCount();
      var moduleData = qrcode.modules.slice();
      var oddRow = moduleCount % 2 === 1;

      if (oddRow) {
        moduleData.push(fill(moduleCount, WHITE));
      }

      var platte = {
        WHITE_ALL: "\u2588",
        WHITE_BLACK: "\u2580",
        BLACK_WHITE: "\u2584",
        BLACK_ALL: ' '
      };
      var borderTop = repeat(platte.BLACK_WHITE).times(moduleCount + 3);
      var borderBottom = repeat(platte.WHITE_BLACK).times(moduleCount + 3);
      output += borderTop + '\n';

      for (var row = 0; row < moduleCount; row += 2) {
        output += platte.WHITE_ALL;

        for (var col = 0; col < moduleCount; col++) {
          if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === WHITE) {
            output += platte.WHITE_ALL;
          } else if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === BLACK) {
            output += platte.WHITE_BLACK;
          } else if (moduleData[row][col] === BLACK && moduleData[row + 1][col] === WHITE) {
            output += platte.BLACK_WHITE;
          } else {
            output += platte.BLACK_ALL;
          }
        }

        output += platte.WHITE_ALL + '\n';
      }

      if (!oddRow) {
        output += borderBottom;
      }
    } else {
      var border = repeat(white).times(qrcode.getModuleCount() + 3);
      output += border + '\n';
      qrcode.modules.forEach(function (row) {
        output += white;
        output += row.map(toCell).join('');
        output += white + '\n';
      });
      output += border;
    }

    if (cb) cb(output);else console.log(output);
  },
  setErrorLevel: function setErrorLevel(error) {
    this.error = QRErrorCorrectLevel[error] || this.error;
  }
};