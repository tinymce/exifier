var BinaryReader = require('./BinaryReader').BinaryReader;


function JPEGHeaders(data) {
	var headers = [], read, idx, marker, length = 0;

	read = new BinaryReader(data);

	// Check if data is jpeg
	if (read.SHORT(0) !== 0xFFD8) {
		throw new Error("Not a JPEG!");
	}

	idx = 2;

	while (idx <= read.length()) {
		marker = read.SHORT(idx);

		// omit RST (restart) markers
		if (marker >= 0xFFD0 && marker <= 0xFFD7) {
			idx += 2;
			continue;
		}

		// no headers allowed after SOS marker
		if (marker === 0xFFDA || marker === 0xFFD9) {
			break;
		}

		length = read.SHORT(idx + 2) + 2;

		// APPn marker detected
		if (marker >= 0xFFE1 && marker <= 0xFFEF) {
			headers.push({
				hex: marker,
				name: 'APP' + (marker & 0x000F),
				start: idx,
				length: length,
				segment: read.SEGMENT(idx, length)
			});
		}

		idx += length;
	}

	read.clear(); // free memory

	return {
		headers: headers,

		restore: function(data) {
			var max, i, read;

			read = new BinaryReader(data);

			idx = read.SHORT(2) == 0xFFE0 ? 4 + read.SHORT(4) : 2;

			for (i = 0, max = headers.length; i < max; i++) {
				read.SEGMENT(idx, 0, headers[i].segment);
				idx += headers[i].length;
			}

			data = read.SEGMENT();
			read.clear();
			return data;
		},

		strip: function(data) {
			var headers, jpegHeaders, i;

			jpegHeaders = new JPEGHeaders(data);
			headers = jpegHeaders.headers;
			jpegHeaders.purge();

			read.init(data);

			i = headers.length;
			while (i--) {
				read.SEGMENT(headers[i].start, headers[i].length, '');
			}
			
			data = read.SEGMENT();
			read.init(null);
			return data;
		},

		get: function(name) {
			var array = [];

			for (var i = 0, max = headers.length; i < max; i++) {
				if (headers[i].name === name.toUpperCase()) {
					array.push(headers[i].segment);
				}
			}
			return array;
		},

		set: function(name, segment) {
			var array = [], i, ii, max;

			if (typeof(segment) === 'string') {
				array.push(segment);
			} else {
				array = segment;
			}

			for (i = ii = 0, max = headers.length; i < max; i++) {
				if (headers[i].name === name.toUpperCase()) {
					headers[i].segment = array[ii];
					headers[i].length = array[ii].length;
					ii++;
				}
				if (ii >= array.length) {
					break;
				}
			}
		},

		purge: function() {
			headers = [];
			read.init(null);
			read = null;
		}
	};
}

exports.JPEGHeaders = JPEGHeaders;
