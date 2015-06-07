/**
 * BinaryReader.js
 *
 * Copyright 2013, Moxiecode Systems AB
 * Released under GPL License.
 *
 * License: http://www.plupload.com/license
 * Contributing: http://www.plupload.com/contributing
 */

 var Basic = require("./Utils");
 var ArrayBufferReader = require("./ArrayBufferReader").ArrayBufferReader;
 var UTF16StringReader = require("./UTF16StringReader").UTF16StringReader;


function BinaryReader(data) {
	if (data instanceof ArrayBuffer) {
		ArrayBufferReader.apply(this, arguments);
	} else {
		UTF16StringReader.apply(this, arguments);
	}
}


Basic.extend(BinaryReader.prototype, {
	littleEndian: false,

	read: function(idx, size) {
		var sum, mv, i;

		if (idx + size > this.length()) {
			throw new Error("You are trying to read outside the source boundaries.");
		}
		
		mv = this.littleEndian 
			? 0 
			: -8 * (size - 1)
		;

		for (i = 0, sum = 0; i < size; i++) {
			sum |= (this.readByteAt(idx + i) << Math.abs(mv + i*8));
		}
		return sum;
	},

	write: function(idx, num, size) {
		if (idx > this.length()) {
			throw new Error("You are trying to write outside the source boundaries.");
		}

		var str = '', mv = _II ? 0 : -8 * (size - 1), i;

		for (i = 0; i < size; i++) {
			str += String.fromCharCode((num >> Math.abs(mv + i*8)) & 255);
		}

		putstr(str, idx, size);
	},

	BYTE: function(idx) {
		return this.read(idx, 1);
	},

	SHORT: function(idx) {
		return this.read(idx, 2);
	},

	LONG: function(idx) {
		return this.read(idx, 4);
	},

	SLONG: function(idx) { // 2's complement notation
		var num = this.read(idx, 4);
		return (num > 2147483647 ? num - 4294967296 : num);
	},

	STRING: function(idx) {
		return String.fromCharCode(this.read(idx, 1));
	},

	clear: function() {}
});


exports.BinaryReader = BinaryReader;