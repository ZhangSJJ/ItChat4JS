var QRMode = require('./QRMode');

function QR8bitByte(data) {
  this.mode = QRMode.MODE_8BIT_BYTE;
  this.data = data;
}

QR8bitByte.prototype = {
  getLength: function getLength() {
    return this.data.length;
  },
  write: function write(buffer) {
    for (var i = 0; i < this.data.length; i++) {
      // not JIS ...
      buffer.put(this.data.charCodeAt(i), 8);
    }
  }
};
module.exports = QR8bitByte;