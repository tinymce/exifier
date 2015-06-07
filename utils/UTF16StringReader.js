

function UTF16StringReader(data) {

	this.readByteAt = function(idx) {
		return data.charCodeAt(idx);
	}

	this.length = function() {
		return data.length;
	};
	
}


exports.UTF16StringReader = UTF16StringReader;