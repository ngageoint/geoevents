function render(records) {

    var map = incident_support.map;
    var features = [];

    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.shapeType == ShpType.SHAPE_POINT || record.shapeType == ShpType.SHAPE_POINTM || record.shapeType == ShpType.SHAPE_POINTZ) {
            var point = record.shape;

            var lat = point.x, lon = point.y;

            features.push(new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(lat, lon),
                {title: "Point "+i, externalGraphic:'/static/images/event.png'},
                {
                    externalGraphic:'/static/images/event.png',
                    fillColor: '#ff0',
                    fillOpacity: 0.8,
                    strokeColor: "#ee9900",
                    strokeOpacity: 1,
                    strokeWidth: 1,
                    pointRadius: 7
                }
            ));
        }
    }

    // create the layer with listeners to create and destroy popups
    var vector = new OpenLayers.Layer.Vector("SHP file Points", {
        eventListeners: {
            'featureselected': function(evt) {
                var feature = evt.feature;
                var popup = new OpenLayers.Popup.FramedCloud("popup",
                    OpenLayers.LonLat.fromString(feature.geometry.toShortString()),
                    null, "<div style='font-size:.8em'>" + feature.attributes.title + "</div>",
                    null,
                    true);
                feature.popup = popup;
                map.addPopup(popup);
            },
            'featureunselected': function(evt) {
                var feature = evt.feature;
                map.removePopup(feature.popup);
                feature.popup.destroy();
                feature.popup = null;
            }
        }
    });
    vector.addFeatures(features);

    // create the select feature control
    var selector = new OpenLayers.Control.SelectFeature(vector, {
        hover: false,
        autoActivate: true
    });

    map.addLayers([vector]);
    map.addControl(selector);
}

//function render(records) {
//
//    var canvas = document.getElementById('map');
//
//    if (window.G_vmlCanvasManager) {
//        G_vmlCanvasManager.initElement(canvas);
//    }
//
//    var box;
//    for (var i = 0; i < records.length; i++) {
//        var record = records[i];
//        if (record.shapeType == ShpType.SHAPE_POINT || record.shapeType == ShpType.SHAPE_POINTM) {
//            console.log(record);
//        }
//
//        if (record.shapeType == ShpType.SHAPE_POLYGON || record.shapeType == ShpType.SHAPE_POLYLINE) {
//            var shp = record.shape
//            for (var j = 0; j < shp.rings.length; j++) {
//                var ring = shp.rings[j];
//                for (var k = 0; k < ring.length; k++) {
//                    if (!box) {
//                        box = { x: ring[k].x, y: ring[k].y, width: 0, height: 0 };
//                    }
//                    else {
//                        var l = Math.min(box.x, ring[k].x);
//                        var t = Math.min(box.y, ring[k].y);
//                        var r = Math.max(box.x+box.width, ring[k].x);
//                        var b = Math.max(box.y+box.height, ring[k].y);
//                        box.x = l;
//                        box.y = t;
//                        box.width = r-l;
//                        box.height = b-t;
//                    }
//                }
//            }
//        }
//    }
//
//    var ctx = canvas.getContext('2d');
//
//    var sc = Math.min(600 / box.width, 800 / box.height);
//
//    ctx.fillStyle = '#000000';
//    ctx.fillRect(0,0,600,800);
//    ctx.lineWidth = 3;
//
//    var bottom = 800 - (800 - sc*box.height) / 2;
//    var left = (600 - sc*box.width) / 2;
//
//    for (var i = 0; i < records.length; i++) {
//        var record = records[i];
//
//        if (record.shapeType == ShpType.SHAPE_POLYGON || record.shapeType == ShpType.SHAPE_POLYLINE) {
//
//            ctx.beginPath();
//            ctx.fillStyle = rndColor(0);
//            ctx.strokeStyle = rndColor(1);
//
//            var shp = record.shape;
//            for (var j = 0; j < shp.rings.length; j++) {
//                var ring = shp.rings[j];
//                if (ring.length < 1) continue;
//                ctx.moveTo(left + (ring[0].x - box.x) * sc, bottom - (ring[0].y - box.y) * sc);
//                for (var k = 1; k < ring.length; k++) {
//                    ctx.lineTo(left + (ring[k].x - box.x) * sc, bottom - (ring[k].y - box.y) * sc);
//                }
//            }
//
//            if (record.shapeType == ShpType.SHAPE_POLYGON) {
//                ctx.fill();
//            }
//            ctx.stroke();
//            ctx.closePath();
//
//
//        }
//    }
//
//}
function readBlob(ini, fin) {

    var files = document.getElementById('files').files;
    if (!files.length) {
        console.log('Please select a file!');
        return;
    }

    var file = files[0];
    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            // document.getElementById('byte_content').textContent = evt.target.result;
            var baj = new BinaryFile(evt.target.result, 0, 0);

            var shpFile = new ShpFile(baj);
            render(shpFile.records);
        }
    };

    var blob;
    if (file.webkitSlice) {
        blob = file.webkitSlice(ini, fin);
        reader.readAsBinaryString(blob);
    } else if (file.mozSlice) {
        blob = file.mozSlice(ini, fin);
        reader.readAsBinaryString(blob);
    }
}
function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var shpf = files[0];
    readBlob(0, shpf.size);
}

function ShpFile(binFile) {

    // var src = binFile;
    var src = new BinaryFileWrapper(binFile);

    var t1 = new Date().getTime();
    this.header = new ShpHeader(src);

    var t2 = new Date().getTime();
    if (window.console && window.console.log) console.log('parsed header in ' + (t2-t1) + ' ms');

    if (window.console && window.console.log) console.log('got header, parsing records');

    t1 = new Date().getTime();
    this.records = [];
    while (true) {
        try {
            this.records.push(new ShpRecord(src));
        }
        catch (e) {
            if (e.id !== ShpError.ERROR_NODATA) {
                alert(e);
            }
            break;
        }
    }

    t2 = new Date().getTime();
    if (window.console && window.console.log) console.log('parsed records in ' + (t2-t1) + ' ms');

}
var ShpType = {

    /**
     * Unknow Shape Type (for internal use)
     */
    SHAPE_UNKNOWN : -1,
    /**
     * ESRI Shapefile Null Shape shape type.
     */
    SHAPE_NULL : 0,
    /**
     * ESRI Shapefile Point Shape shape type.
     */
    SHAPE_POINT : 1,
    /**
     * ESRI Shapefile PolyLine Shape shape type.
     */
    SHAPE_POLYLINE : 3,
    /**
     * ESRI Shapefile Polygon Shape shape type.
     */
    SHAPE_POLYGON : 5,
    /**
     * ESRI Shapefile Multipoint Shape shape type
     * (currently unsupported).
     */
    SHAPE_MULTIPOINT : 8,
    /**
     * ESRI Shapefile PointZ Shape shape type.
     */
    SHAPE_POINTZ : 11,
    /**
     * ESRI Shapefile PolylineZ Shape shape type
     * (currently unsupported).
     */
    SHAPE_POLYLINEZ : 13,
    /**
     * ESRI Shapefile PolygonZ Shape shape type
     * (currently unsupported).
     */
    SHAPE_POLYGONZ : 15,
    /**
     * ESRI Shapefile MultipointZ Shape shape type
     * (currently unsupported).
     */
    SHAPE_MULTIPOINTZ : 18,
    /**
     * ESRI Shapefile PointM Shape shape type
     */
    SHAPE_POINTM : 21,
    /**
     * ESRI Shapefile PolyLineM Shape shape type
     * (currently unsupported).
     */
    SHAPE_POLYLINEM : 23,
    /**
     * ESRI Shapefile PolygonM Shape shape type
     * (currently unsupported).
     */
    SHAPE_POLYGONM : 25,
    /**
     * ESRI Shapefile MultiPointM Shape shape type
     * (currently unsupported).
     */
    SHAPE_MULTIPOINTM : 28,
    /**
     * ESRI Shapefile MultiPatch Shape shape type
     * (currently unsupported).
     */
    SHAPE_MULTIPATCH : 31

};
function ShpHeader(src) {
    if (src.getLength() < 100)
        alert("Not a valid shape file header (too small)");

    if (src.getSLong() != 9994)
        alert("Not a valid signature. Expected 9994");

    // skip 5 integers;
    src.position += 5*4;

    // read file-length:
    this.fileLength = src.getSLong();

    // switch endian:
    src.bigEndian = false;

    // read version:
    this.version = src.getSLong();

    // read shape-type:
    this.shapeType = src.getSLong();

    // read bounds:
    this.boundsXY = { x: src.getDouble(),
        y: src.getDouble(),
        width: src.getDouble(),
        height: src.getDouble() };

    this.boundsZ = { x: src.getDouble(), y: src.getDouble() };

    this.boundsM = { x: src.getDouble(), y: src.getDouble() };
}
function ShpRecord(src) {
    var availableBytes = src.getLength() - src.position;

    if (availableBytes == 0)
        throw(new ShpError("No Data", ShpError.ERROR_NODATA));

    if (availableBytes < 8)
        throw(new ShpError("Not a valid record header (too small)"));

    src.bigEndian = true;

    this.number = src.getSLong();
    this.contentLength = src.getSLong();
    this.contentLengthBytes = this.contentLength*2 - 4;
    src.bigEndian = false;
    var shapeOffset = src.position;
    this.shapeType = src.getSLong();

    switch(this.shapeType) {
        case ShpType.SHAPE_POINT:
            this.shape = new ShpPoint(src, this.contentLengthBytes);
            break;
        case ShpType.SHAPE_POINTZ:
            this.shape = new ShpPointZ(src, this.contentLengthBytes);
            break;
        case ShpType.SHAPE_POLYGON:
            this.shape = new ShpPolygon(src, this.contentLengthBytes);
            break;
        case ShpType.SHAPE_POLYLINE:
            this.shape = new ShpPolyline(src, this.contentLengthBytes);
            break;
        case ShpType.SHAPE_MULTIPATCH:
        case ShpType.SHAPE_MULTIPOINT:
        case ShpType.SHAPE_MULTIPOINTM:
        case ShpType.SHAPE_MULTIPOINTZ:
        case ShpType.SHAPE_POINTM:
        case ShpType.SHAPE_POLYGONM:
        case ShpType.SHAPE_POLYGONZ:
        case ShpType.SHAPE_POLYLINEZ:
        case ShpType.SHAPE_POLYLINEM:
            throw(new ShpError(this.shapeType+" Shape type is currently unsupported by this library"));
            break;
        default:
            throw(new ShpError("Encountered unknown shape type ("+this.shapeType+")"));
            break;
    }
}
function ShpPoint(src, size) {
    this.type = ShpType.SHAPE_POINT;
    if (src) {
        if (src.getLength() - src.position < size)
            throw(new ShpError("Not a Point record (too small)"));
        this.x = (size > 0)  ? src.getDouble() : NaN;
        this.y = (size > 0)  ? src.getDouble() : NaN;
    }
}
function ShpPointZ(src, size) {
    this.type = ShpType.SHAPE_POINTZ;
    if (src) {
        if (src.getLength() - src.position < size)
            throw(new ShpError("Not a Point record (too small)"));
        this.x = (size > 0)  ? src.getDouble() : NaN;
        this.y = (size > 0)  ? src.getDouble() : NaN;
        this.z = (size > 16) ? src.getDouble() : NaN;
        this.m = (size > 24) ? src.getDouble() : NaN;
    }
}
function ShpPolygon(src, size) {
    // for want of a super()
    ShpPolyline.apply(this, [src, size]);
    this.type = ShpType.SHAPE_POLYGON;
}
function ShpPolyline(src, size) {
    this.type = ShpType.SHAPE_POLYLINE;
    this.rings = [];
    if (src) {
        if (src.getLength() - src.position < size)
            throw(new ShpError("Not a Polygon record (too small)"));

        src.bigEndian = false;

        this.box = { x: src.getDouble(),
            y: src.getDouble(),
            width: src.getDouble(),
            height: src.getDouble() };

        var rc = src.getSLong();
        var pc = src.getSLong();

        var ringOffsets = [];
        while(rc--) {
            var ringOffset = src.getSLong();
            ringOffsets.push(ringOffset);
        }

        var points = [];
        while(pc--) {
            points.push(new ShpPoint(src,16));
        }

        // convert points, and ringOffsets arrays to an array of rings:
        var removed = 0;
        var split;
        ringOffsets.shift();
        while(ringOffsets.length) {
            split = ringOffsets.shift();
            this.rings.push(points.splice(0,split-removed));
            removed = split;
        }
        this.rings.push(points);
    }
}
function ShpError(msg, id) {
    this.msg = msg;
    this.id = id;
    this.toString = function() {
        return this.msg;
    };
}
ShpError.ERROR_UNDEFINED = 0;
// a 'no data' error is thrown when the byte array runs out of data.
ShpError.ERROR_NODATA = 1;

function renderPolygons(canvas, records, data, box, style) {

    log('rendering polygons');

    var t1 = new Date().getTime();
    log('starting rendering...');

    var ctx = canvas.getContext('2d');

    var sc = Math.min(canvas.width / box.width, canvas.height / box.height);

    if (style) {
        for (var p in style) {
            ctx[p] = style[p];
        }
    }
    for (var i = 0; i < records.length; i++) {
        var record = records[i];
        if (record.shapeType == ShpType.SHAPE_POLYGON || record.shapeType == ShpType.SHAPE_POLYLINE) {
            var shp = record.shape;
            ctx.beginPath();
            for (var j = 0; j < shp.rings.length; j++) {
                var ring = shp.rings[j];
                if (ring.length < 1) continue;
                ctx.moveTo((ring[0].x - box.x) * sc, canvas.height - (ring[0].y - box.y) * sc);
                for (var k = 1; k < ring.length; k++) {
                    ctx.lineTo((ring[k].x - box.x) * sc, canvas.height - (ring[k].y - box.y) * sc);
                }
            }
            if (style.fillStyle && record.shapeType == ShpType.SHAPE_POLYGON) {
                ctx.fill();
            }
            if (style.strokeStyle) {
                ctx.stroke();
            }
        }
    }
    t2 = new Date().getTime();
    log('done rendering in ' + (t2 - t1) + ' ms');
}
var BinaryFile = function(strData, iDataOffset, iDataLength) {
    var data = strData;
    var dataOffset = iDataOffset || 0;
    var dataLength = 0;

    this.getRawData = function() {
        return data;
    }

    if (typeof strData == "string") {
        dataLength = iDataLength || data.length;

        this.getByteAt = function(iOffset) {
            return data.charCodeAt(iOffset + dataOffset) & 0xFF;
        }
    } else if (typeof strData == "unknown") {
        dataLength = iDataLength || IEBinary_getLength(data);

        this.getByteAt = function(iOffset) {
            return IEBinary_getByteAt(data, iOffset + dataOffset);
        }
    }

    this.getLength = function() {
        return dataLength;
    }

    this.getSByteAt = function(iOffset) {
        var iByte = this.getByteAt(iOffset);
        if (iByte > 127)
            return iByte - 256;
        else
            return iByte;
    }

    this.getShortAt = function(iOffset, bBigEndian) {
        var iShort = bBigEndian ?
            (this.getByteAt(iOffset) << 8) + this.getByteAt(iOffset + 1)
            : (this.getByteAt(iOffset + 1) << 8) + this.getByteAt(iOffset)
        if (iShort < 0) iShort += 65536;
        return iShort;
    }
    this.getSShortAt = function(iOffset, bBigEndian) {
        var iUShort = this.getShortAt(iOffset, bBigEndian);
        if (iUShort > 32767)
            return iUShort - 65536;
        else
            return iUShort;
    }
    this.getLongAt = function(iOffset, bBigEndian) {
        var iByte1 = this.getByteAt(iOffset),
            iByte2 = this.getByteAt(iOffset + 1),
            iByte3 = this.getByteAt(iOffset + 2),
            iByte4 = this.getByteAt(iOffset + 3);

        var iLong = bBigEndian ?
            (((((iByte1 << 8) + iByte2) << 8) + iByte3) << 8) + iByte4
            : (((((iByte4 << 8) + iByte3) << 8) + iByte2) << 8) + iByte1;
        if (iLong < 0) iLong += 4294967296;
        return iLong;
    }
    this.getSLongAt = function(iOffset, bBigEndian) {
        var iULong = this.getLongAt(iOffset, bBigEndian);
        if (iULong > 2147483647)
            return iULong - 4294967296;
        else
            return iULong;
    }
    this.getStringAt = function(iOffset, iLength) {
        var aStr = [];
        for (var i=iOffset,j=0;i<iOffset+iLength;i++,j++) {
            aStr[j] = String.fromCharCode(this.getByteAt(i));
        }
        return aStr.join("");
    }

    this.getCharAt = function(iOffset) {
        return String.fromCharCode(this.getByteAt(iOffset));
    }
    this.toBase64 = function() {
        return window.btoa(data);
    }
    this.fromBase64 = function(strBase64) {
        data = window.atob(strBase64);
    }
}
var BinaryAjax = (function() {

    function createRequest() {
        var oHTTP = null;
        if (window.XMLHttpRequest) {
            oHTTP = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            oHTTP = new ActiveXObject("Microsoft.XMLHTTP");
        }
        return oHTTP;
    }

    function getHead(strURL, fncCallback, fncError) {
        var oHTTP = createRequest();
        if (oHTTP) {
            if (fncCallback) {
                if (typeof(oHTTP.onload) != "undefined") {
                    oHTTP.onload = function() {
                        if (oHTTP.status == "200") {
                            fncCallback(this);
                        } else {
                            if (fncError) fncError();
                        }
                        oHTTP = null;
                    };
                } else {
                    oHTTP.onreadystatechange = function() {
                        if (oHTTP.readyState == 4) {
                            if (oHTTP.status == "200") {
                                fncCallback(this);
                            } else {
                                if (fncError) fncError();
                            }
                            oHTTP = null;
                        }
                    };
                }
            }
            oHTTP.open("HEAD", strURL, true);
            oHTTP.send(null);
        } else {
            if (fncError) fncError();
        }
    }

    function sendRequest(strURL, fncCallback, fncError, aRange, bAcceptRanges, iFileSize) {
        var oHTTP = createRequest();
        if (oHTTP) {

            var iDataOffset = 0;
            if (aRange && !bAcceptRanges) {
                iDataOffset = aRange[0];
            }
            var iDataLen = 0;
            if (aRange) {
                iDataLen = aRange[1]-aRange[0]+1;
            }

            if (fncCallback) {
                if (typeof(oHTTP.onload) != "undefined") {
                    oHTTP.onload = function() {

                        if (oHTTP.status == "200" || oHTTP.status == "206" || oHTTP.status == "0") {
                            oHTTP.binaryResponse = new BinaryFile(oHTTP.responseText, iDataOffset, iDataLen);
                            oHTTP.fileSize = iFileSize || oHTTP.getResponseHeader("Content-Length");
                            fncCallback(oHTTP);
                        } else {
                            if (fncError) fncError();
                        }
                        oHTTP = null;
                    };
                } else {
                    oHTTP.onreadystatechange = function() {
                        if (oHTTP.readyState == 4) {
                            if (oHTTP.status == "200" || oHTTP.status == "206" || oHTTP.status == "0") {
                                // IE6 craps if we try to extend the XHR object
                                var oRes = {
                                    status : oHTTP.status,
                                    binaryResponse : new BinaryFile(oHTTP.responseBody, iDataOffset, iDataLen),
                                    fileSize : iFileSize || oHTTP.getResponseHeader("Content-Length")
                                };
                                fncCallback(oRes);
                            } else {
                                if (fncError) fncError();
                            }
                            oHTTP = null;
                        }
                    };
                }
            }
            oHTTP.open("GET", strURL, true);

            if (oHTTP.overrideMimeType) oHTTP.overrideMimeType('text/plain; charset=x-user-defined');

            if (aRange && bAcceptRanges) {
                oHTTP.setRequestHeader("Range", "bytes=" + aRange[0] + "-" + aRange[1]);
            }

            oHTTP.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 1970 00:00:00 GMT");

            oHTTP.send(null);
        } else {
            if (fncError) fncError();
        }
    }

    return function(strURL, fncCallback, fncError, aRange) {

        if (aRange) {
            getHead(
                strURL,
                function(oHTTP) {
                    var iLength = parseInt(oHTTP.getResponseHeader("Content-Length"),10);
                    var strAcceptRanges = oHTTP.getResponseHeader("Accept-Ranges");

                    var iStart, iEnd;
                    iStart = aRange[0];
                    if (aRange[0] < 0)
                        iStart += iLength;
                    iEnd = iStart + aRange[1] - 1;

                    sendRequest(strURL, fncCallback, fncError, [iStart, iEnd], (strAcceptRanges == "bytes"), iLength);
                }
            );

        } else {
            sendRequest(strURL, fncCallback, fncError);
        }
    }

}());
function BinaryFileWrapper(binFile) {

    this.position = 0;
    this.bigEndian = true;

    this.getByte = function() {
        var byte = binFile.getByteAt(this.position);
        this.position++;
        return byte;
    }

    this.getLength = function() {
        return binFile.getLength();
    }

    this.getSByte = function() {
        var sbyte = binFile.getSByteAt(this.position);
        this.position++;
        return sbyte;
    }

    this.getShort = function() {
        var short = binFile.getShortAt(this.position, this.bigEndian);
        this.position += 2;
        return short;
    }

    this.getSShort = function() {
        var sshort = binFile.getSShortAt(this.position, this.bigEndian);
        this.position += 2;
        return sshort;
    }

    this.getLong = function() {
        var l = binFile.getLongAt(this.position, this.bigEndian);
        this.position += 4;
        return l;
    }

    this.getSLong = function() {
        var l = binFile.getSLongAt(this.position, this.bigEndian);
        this.position += 4;
        return l;
    }

    this.getString = function(iLength) {
        var s = binFile.getStringAt(this.position, iLength);
        this.position += iLength;
        return s;
    }

    this.getDoubleAt = function(iOffset, bBigEndian) {
        // hugs stackoverflow
        // http://stackoverflow.com/questions/1597709/convert-a-string-with-a-hex-representation-of-an-ieee-754-double-into-javascript
        // TODO: check the endianness for something other than shapefiles
        // TODO: what about NaNs and Infinity?
        var a = binFile.getLongAt(iOffset + (bBigEndian ? 0 : 4), bBigEndian);
        var b = binFile.getLongAt(iOffset + (bBigEndian ? 4 : 0), bBigEndian);
        var s = a >> 31 ? -1 : 1;
        var e = (a >> 52 - 32 & 0x7ff) - 1023;
        return s * (a & 0xfffff | 0x100000) * 1.0 / Math.pow(2,52-32) * Math.pow(2, e) + b * 1.0 / Math.pow(2, 52) * Math.pow(2, e);
    }

    this.getDouble = function() {
        var d = this.getDoubleAt(this.position, this.bigEndian);
        this.position += 8;
        return d;
    }

    this.getChar = function() {
        var c = binFile.getCharAt(this.position);
        this.position++;
        return c;
    }
}
function rndColor(dark){
    var base = 0;
    if (dark == 1) {
        base = 40;
    } else {
        base = 127;
    }
    var r = base + Math.floor(128*Math.random());
    var g = base + Math.floor(128*Math.random());
    var b = base + Math.floor(128*Math.random());
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
}
