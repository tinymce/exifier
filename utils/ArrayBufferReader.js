


function ArrayBufferReader(data) {
	var _dv = new DataView(data);

	this.readByteAt = function(idx) {
		return _dv.getUint8(idx);
	};


	this.SEGMENT = function(idx, size, value) {
		switch (arguments.length) {
			case 2:
				return data.slice(idx, idx + size);

			case 1:
				return data.slice(idx);

			case 3:
				if (value instanceof ArrayBuffer) {					
					var arr = new Uint8Array(this.length() - size + value.byteLength);
					if (idx > 0) {
						arr.set(new Uint8Array(data.slice(0, idx)), 0);
					}
					arr.set(new Uint8Array(value), idx);
					arr.set(new Uint8Array(data.slice(idx + size)), idx + value.byteLength);

					this.clear();
					data = arr.buffer;
					_dv = new DataView(data);
					break;
				}

			default: return data;
		}
	};


	this.length = function() {
		return data.byteLength;
	};


	this.clear = function() {
		_dv = data = null;
	};
}

exports.ArrayBufferReader = ArrayBufferReader;