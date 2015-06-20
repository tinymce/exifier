var fs  = require("fs");
var path = require("path");
var glob = require("glob");
var JPEGHeaders = require("./utils/JPEGHeaders").JPEGHeaders;
var BinaryReader = require("./utils/BinaryReader").BinaryReader;

//fs.readFileSync

var baseDir = process.argv[2];

if (!fs.existsSync(baseDir)) {
	console.info(baseDir + " doesn't exists.");
	process.exit(1);
}


glob(baseDir+"/*.+(jpg|jpeg)", { nocase: true }, function (er, files) {
	var SOI = new Buffer(2);
	SOI[0] = 0xff;
	SOI[1] = 0xd8;

	var EOI = new Buffer(2);
	EOI[0] = 0xff;
	EOI[1] = 0xd9;

	files.some(function(file) {
		var ab, headers, br;

		console.info("Processing \"" + file + "\"");

		ab = toArrayBuffer(fs.readFileSync(file));

		try {
			headers = new JPEGHeaders(ab).headers;

			br = new BinaryReader(new ArrayBuffer());

			for (var i = 0, idx = 0; i < headers.length; i++) {
				br.SEGMENT(idx, 0, headers[i].segment);
				idx += headers[i].length;
			}

			var outFile = path.join("out", path.basename(file, path.extname(file)) + '.jpg');
			fs.writeFileSync(outFile, SOI);
			fs.appendFileSync(outFile, new Buffer(new Uint8Array(br.SEGMENT())));
			fs.appendFileSync(outFile, EOI);
		} catch(ex) {
			console.info(ex.message);
		}		
	});

});


function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

