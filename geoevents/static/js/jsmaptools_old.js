// This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
// is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

//
;(function(global) {
    "use strict";
    
    // Caveat: Does NOT handle above 84N, below 80S

    var _m = {
        VERSION: '0.0.2',
        summary: 'Useful mapping functions for Lat/Lon to USNG/MGRS conversion'
    };

    //From https://github.com/umpirsky/country-list/blob/master/country/cldr/en/country.json
    _m.COUNTRY_CODES={"AD":"Andorra","AE":"United Arab Emirates","AF":"Afghanistan","AG":"Antigua and Barbuda","AI":"Anguilla","AL":"Albania","AM":"Armenia","AN":"Netherlands Antilles","AO":"Angola","AQ":"Antarctica","AR":"Argentina","AS":"American Samoa","AT":"Austria","AU":"Australia","AW":"Aruba","AX":"\u00c5land Islands","AZ":"Azerbaijan","BA":"Bosnia and Herzegovina","BB":"Barbados","BD":"Bangladesh","BE":"Belgium","BF":"Burkina Faso","BG":"Bulgaria","BH":"Bahrain","BI":"Burundi","BJ":"Benin","BL":"Saint Barth\u00e9lemy","BM":"Bermuda","BN":"Brunei","BO":"Bolivia","BQ":"British Antarctic Territory","BR":"Brazil","BS":"Bahamas","BT":"Bhutan","BV":"Bouvet Island","BW":"Botswana","BY":"Belarus","BZ":"Belize","CA":"Canada","CC":"Cocos [Keeling] Islands","CD":"Congo - Kinshasa","CF":"Central African Republic","CG":"Congo - Brazzaville","CH":"Switzerland","CI":"C\u00f4te d\u2019Ivoire","CK":"Cook Islands","CL":"Chile","CM":"Cameroon","CN":"China","CO":"Colombia","CR":"Costa Rica","CS":"Serbia and Montenegro","CT":"Canton and Enderbury Islands","CU":"Cuba","CV":"Cape Verde","CX":"Christmas Island","CY":"Cyprus","CZ":"Czech Republic","DD":"East Germany","DE":"Germany","DJ":"Djibouti","DK":"Denmark","DM":"Dominica","DO":"Dominican Republic","DZ":"Algeria","EC":"Ecuador","EE":"Estonia","EG":"Egypt","EH":"Western Sahara","ER":"Eritrea","ES":"Spain","ET":"Ethiopia","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands","FM":"Micronesia","FO":"Faroe Islands","FQ":"French Southern and Antarctic Territories","FR":"France","FX":"Metropolitan France","GA":"Gabon","GB":"United Kingdom","GD":"Grenada","GE":"Georgia","GF":"French Guiana","GG":"Guernsey","GH":"Ghana","GI":"Gibraltar","GL":"Greenland","GM":"Gambia","GN":"Guinea","GP":"Guadeloupe","GQ":"Equatorial Guinea","GR":"Greece","GS":"South Georgia and the South Sandwich Islands","GT":"Guatemala","GU":"Guam","GW":"Guinea-Bissau","GY":"Guyana","HK":"Hong Kong SAR China","HM":"Heard Island and McDonald Islands","HN":"Honduras","HR":"Croatia","HT":"Haiti","HU":"Hungary","ID":"Indonesia","IE":"Ireland","IL":"Israel","IM":"Isle of Man","IN":"India","IO":"British Indian Ocean Territory","IQ":"Iraq","IR":"Iran","IS":"Iceland","IT":"Italy","JE":"Jersey","JM":"Jamaica","JO":"Jordan","JP":"Japan","JT":"Johnston Island","KE":"Kenya","KG":"Kyrgyzstan","KH":"Cambodia","KI":"Kiribati","KM":"Comoros","KN":"Saint Kitts and Nevis","KP":"North Korea","KR":"South Korea","KW":"Kuwait","KY":"Cayman Islands","KZ":"Kazakhstan","LA":"Laos","LB":"Lebanon","LC":"Saint Lucia","LI":"Liechtenstein","LK":"Sri Lanka","LR":"Liberia","LS":"Lesotho","LT":"Lithuania","LU":"Luxembourg","LV":"Latvia","LY":"Libya","MA":"Morocco","MC":"Monaco","MD":"Moldova","ME":"Montenegro","MF":"Saint Martin","MG":"Madagascar","MH":"Marshall Islands","MI":"Midway Islands","MK":"Macedonia","ML":"Mali","MM":"Myanmar [Burma]","MN":"Mongolia","MO":"Macau SAR China","MP":"Northern Mariana Islands","MQ":"Martinique","MR":"Mauritania","MS":"Montserrat","MT":"Malta","MU":"Mauritius","MV":"Maldives","MW":"Malawi","MX":"Mexico","MY":"Malaysia","MZ":"Mozambique","NA":"Namibia","NC":"New Caledonia","NE":"Niger","NF":"Norfolk Island","NG":"Nigeria","NI":"Nicaragua","NL":"Netherlands","NO":"Norway","NP":"Nepal","NQ":"Dronning Maud Land","NR":"Nauru","NT":"Neutral Zone","NU":"Niue","NZ":"New Zealand","OM":"Oman","PA":"Panama","PC":"Pacific Islands Trust Territory","PE":"Peru","PF":"French Polynesia","PG":"Papua New Guinea","PH":"Philippines","PK":"Pakistan","PL":"Poland","PM":"Saint Pierre and Miquelon","PN":"Pitcairn Islands","PR":"Puerto Rico","PS":"Palestinian Territories","PT":"Portugal","PU":"U.S. Miscellaneous Pacific Islands","PW":"Palau","PY":"Paraguay","PZ":"Panama Canal Zone","QA":"Qatar","RE":"R\u00e9union","RO":"Romania","RS":"Serbia","RU":"Russia","RW":"Rwanda","SA":"Saudi Arabia","SB":"Solomon Islands","SC":"Seychelles","SD":"Sudan","SE":"Sweden","SG":"Singapore","SH":"Saint Helena","SI":"Slovenia","SJ":"Svalbard and Jan Mayen","SK":"Slovakia","SL":"Sierra Leone","SM":"San Marino","SN":"Senegal","SO":"Somalia","SR":"Suriname","ST":"S\u00e3o Tom\u00e9 and Pr\u00edncipe","SU":"Union of Soviet Socialist Republics","SV":"El Salvador","SY":"Syria","SZ":"Swaziland","TC":"Turks and Caicos Islands","TD":"Chad","TF":"French Southern Territories","TG":"Togo","TH":"Thailand","TJ":"Tajikistan","TK":"Tokelau","TL":"Timor-Leste","TM":"Turkmenistan","TN":"Tunisia","TO":"Tonga","TR":"Turkey","TT":"Trinidad and Tobago","TV":"Tuvalu","TW":"Taiwan","TZ":"Tanzania","UA":"Ukraine","UG":"Uganda","UM":"U.S. Minor Outlying Islands","US":"United States","UY":"Uruguay","UZ":"Uzbekistan","VA":"Vatican City","VC":"Saint Vincent and the Grenadines","VD":"North Vietnam","VE":"Venezuela","VG":"British Virgin Islands","VI":"U.S. Virgin Islands","VN":"Vietnam","VU":"Vanuatu","WF":"Wallis and Futuna","WK":"Wake Island","WS":"Samoa","YD":"People's Democratic Republic of Yemen","YE":"Yemen","YT":"Mayotte","ZA":"South Africa","ZM":"Zambia","ZW":"Zimbabwe","ZZ":"Unknown or Invalid Region"};
    
    var getLatLon = function(lat, lon) {
        /* Convenience internal function to allow everything to accept various lat, lon formats
         */
        if (typeof lon=='undefined' && lat && lat.lat) {
            lon = lat.lon || lat.long || lat.lng || lat.longitude;
            lat = lat.lat || lat.latitude;
        }
        return { lat: lat, lon: lon};
    };

    _m.inUSBounds=function(lat, lon){
        var newLat = getLatLon(lat, lon).lat;
        lon = getLatLon(lat, lon).lon;
        lat = newLat;
        var top = 49.3457868;
        var left = -124.7844079;
        var right = -66.9513812;
        var bottom =  24.7433195;

        return (bottom <= lat && lat <= top && left <= lon && lon <= right);
    };

    _m.inWorldBounds=function(lat, lon){
        var newLat = getLatLon(lat, lon).lat;
        lon = getLatLon(lat, lon).lon;
        lat = newLat;
        var top = 90;
        var left = -180;
        var right = 180;
        var bottom =  -90;

        return (bottom <= lat && lat <= top && left <= lon && lon <= right);
    };


// FROM MGRS Functions within https://github.com/beatgammit/node-coordinator
    var CONSTANTS = {
        DEG_2_RAD: Math.PI / 180,
        RAD_2_DEG: 180.0 / Math.PI,
        EQUATORIAL_RADIUS: 6378137.0,
        ECC_SQUARED: 0.006694380023,
        IS_NAD83_DATUM: true,
        EASTING_OFFSET: 500000.0,
        NORTHING_OFFSET: 10000000.0,
        GRIDSQUARE_SET_COL_SIZE: 8,  // column width of grid square set
        GRIDSQUARE_SET_ROW_SIZE: 20, // row height of grid square set
        BLOCK_SIZE: 100000, // size of square identifier (within grid zone designation),
        ECC_PRIME_SQUARED: 0.006694380023 / (1 - 0.006694380023),
        E1: (1 - Math.sqrt(1 - 0.006694380023)) / (1 + Math.sqrt(1 - 0.006694380023)),
        k0: 0.9996 // scale factor of central meridian
    };
    // check for NAD83
    if (typeof IS_NAD83_DATUM!="undefined" && IS_NAD83_DATUM) {
        CONSTANTS.EQUATORIAL_RADIUS = 6378137.0; // GRS80 ellipsoid (meters)
        CONSTANTS.ECC_SQUARED = 0.006694380023;
    } else {
        // else NAD27 datum is assumed
        CONSTANTS.EQUATORIAL_RADIUS = 6378206.4; // Clarke 1866 ellipsoid (meters)
        CONSTANTS.ECC_SQUARED = 0.006768658;
    }

    _m.getZoneNumber=function (lat, lon) {
        /*
         * Retrieves zone number from latitude and longitude.
         *
         * Zone numbers range from 1 - 60 over the range [-180 to +180]. Each
         * range is 6 degrees wide. Special cases for points outside normal
         * [-80 to +84] latitude zone.
         */
        var zoneNumber;

        lat = parseFloat(lat);
        lon = parseFloat(lon);

        // sanity check on input, remove for production
        if (lon > 360 || lon < -180 || lat > 90 || lat < -90) {
            throw "Bad input. lat: " + lat + " lon: " + lon;
        }

        zoneNumber = parseInt((lon + 180) / 6, 10) + 1;

        // Handle special case of west coast of Norway
        if (lat >= 56.0 && lat < 64.0 && lon >= 3.0 && lon < 12.0) {
            zoneNumber = 32;
        }

        // Special zones for Svalbard
        if (lat >= 72.0 && lat < 84.0) {
            if (lon >= 0.0  && lon <  9.0) {
                zoneNumber = 31;
            } else if (lon >= 9.0  && lon < 21.0) {
                zoneNumber = 33;
            } else if (lon >= 21.0 && lon < 33.0) {
                zoneNumber = 35;
            } else if (lon >= 33.0 && lon < 42.0) {
                zoneNumber = 37;
            }
        }

        return zoneNumber;
    };
    _m.utmLetterDesignator=function(lat) {
        /*
         * Retrieves grid zone designator letter.
         *
         * This routine determines the correct UTM letter designator for the given
         * latitude returns 'Z' if latitude is outside the UTM limits of 84N to 80S
         *
         * Returns letter designator for a given latitude.
         * Letters range from C (-80 lat) to X (+84 lat), with each zone spanning
         * 8 degrees of latitude.
         */

        var letterDesignator;

        lat = parseFloat(lat);

        if ((84 >= lat) && (lat >= 72)) {
            letterDesignator = 'X';
        } else if ((72 > lat) && (lat >= 64)) {
            letterDesignator = 'W';
        } else if ((64 > lat) && (lat >= 56)) {
            letterDesignator = 'V';
        } else if ((56 > lat) && (lat >= 48)) {
            letterDesignator = 'U';
        } else if ((48 > lat) && (lat >= 40)) {
            letterDesignator = 'T';
        } else if ((40 > lat) && (lat >= 32)) {
            letterDesignator = 'S';
        } else if ((32 > lat) && (lat >= 24)) {
            letterDesignator = 'R';
        } else if ((24 > lat) && (lat >= 16)) {
            letterDesignator = 'Q';
        } else if ((16 > lat) && (lat >= 8)) {
            letterDesignator = 'P';
        } else if (( 8 > lat) && (lat >= 0)) {
            letterDesignator = 'N';
        } else if (( 0 > lat) && (lat >= -8)) {
            letterDesignator = 'M';
        } else if ((-8> lat) && (lat >= -16)) {
            letterDesignator = 'L';
        } else if ((-16 > lat) && (lat >= -24)) {
            letterDesignator = 'K';
        } else if ((-24 > lat) && (lat >= -32)) {
            letterDesignator = 'J';
        } else if ((-32 > lat) && (lat >= -40)) {
            letterDesignator = 'H';
        } else if ((-40 > lat) && (lat >= -48)) {
            letterDesignator = 'G';
        } else if ((-48 > lat) && (lat >= -56)) {
            letterDesignator = 'F';
        } else if ((-56 > lat) && (lat >= -64)) {
            letterDesignator = 'E';
        } else if ((-64 > lat) && (lat >= -72)) {
            letterDesignator = 'D';
        } else if ((-72 > lat) && (lat >= -80)) {
            letterDesignator = 'C';
        } else {
            letterDesignator = 'Z'; // This is here as an error flag to show
            // that the latitude is outside the UTM limits
        }

        return letterDesignator;
    };
    _m.latLongToUtm=function(lat, lon, zone) {
        var zoneNumber,
            latRad,
            lonRad,
            lonOrigin,
            lonOriginRad,
            utmEasting,
            utmNorthing,
            N,
            T,
            C,
            A,
            M,
            utmcoords = {};

        lat = parseFloat(lat);
        lon = parseFloat(lon);

        // Constrain reporting USNG coords to the latitude range [80S .. 84N]
        if (lat > 84.0 || lat < -80.0) {
            return "undefined";
        }

        // sanity check on input - remove for production
        // Make sure the longitude is between -180.00 .. 179.99..
        if (lon > 180 || lon < -180 || lat > 90 || lat < -90) {
            throw "Bad input. lat: " + lat + " lon: " + lon;
        }

        // convert lat/lon to radians
        latRad = lat * CONSTANTS.DEG_2_RAD;
        lonRad = lon * CONSTANTS.DEG_2_RAD;

        // User-supplied zone number will force coordinates to be computed in a particular zone
        zoneNumber = zone || _m.getZoneNumber(lat, lon);

        // +3 puts origin in middle of zone
        //TODO: Will this work for ALL zones (including those around Norway/Svalbard,
        // I'd think that the offset/width might be different)...
        lonOrigin = (zoneNumber - 1) * 6 - 180 + 3;
        lonOriginRad = lonOrigin * CONSTANTS.DEG_2_RAD;

        N = CONSTANTS.EQUATORIAL_RADIUS / Math.sqrt(1 - CONSTANTS.ECC_SQUARED * Math.pow(Math.sin(latRad), 2));
        T = Math.pow(Math.tan(latRad), 2);
        C = CONSTANTS.ECC_PRIME_SQUARED * Math.pow(Math.cos(latRad), 2);
        A = Math.cos(latRad) * (lonRad - lonOriginRad);

        // Note that the term Mo drops out of the "M" equation, because phi
        // (latitude crossing the central meridian, lambda0, at the origin of the
        //  x,y coordinates), is equal to zero for UTM.
        M = CONSTANTS.EQUATORIAL_RADIUS * (
            (1 - CONSTANTS.ECC_SQUARED / 4 - 3 * (CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED) / 64 - 5 * (CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED) / 256) * latRad -
                (3 * CONSTANTS.ECC_SQUARED / 8 + 3 * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED / 32 + 45 * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED / 1024) * Math.sin(2 * latRad) +
                (15 * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED / 256 + 45 * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED / 1024) * Math.sin(4 * latRad) -
                (35 * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED * CONSTANTS.ECC_SQUARED / 3072) * Math.sin(6 * latRad));

        utmEasting = (CONSTANTS.k0 * N *
            (A + (1 - T + C) * (A * A * A) / 6 + (5 - 18 * T + T * T + 72 * C - 58 * CONSTANTS.ECC_PRIME_SQUARED ) * (A * A * A * A * A) / 120) + CONSTANTS.EASTING_OFFSET);

        utmNorthing = (CONSTANTS.k0 * ( M + N * Math.tan(latRad) * (
            (A * A) / 2 + (5 - T + 9 * C + 4 * C * C ) * (A * A * A * A) / 2 +
                (61 - 58 * T + T * T + 600 * C - 330 * CONSTANTS.ECC_PRIME_SQUARED ) *
                    (A * A * A * A * A * A) / 720)
            ) );

        if (utmNorthing < 0) {
            utmNorthing += 10000000;
        }

        utmcoords.easting = Math.round(utmEasting);
        utmcoords.northing = Math.round(utmNorthing);
        utmcoords.zoneNumber = zoneNumber;
        utmcoords.zoneLetter = _m.utmLetterDesignator(lat);
        utmcoords.hemisphere = lat < 0 ? 'S' : 'N';

        return utmcoords;
    };
    
    _m.latLongBoundsForMgrs=function(mgrs) {
        //TODO: Grab 4 corners (via quite a few heuristics) in lat/lon,
        // find intersection of edges with UTM zone boundaries and clip as
        // necessary.  Uses given precision, handling square traversal to find:
        // ul, ur, lr, ll lat/lon.  In rare cases, along zippered UTM boundaries,
        // ul may equal ur (northern hemisphere) or ll may equal lr (southern hemisphere).
        // 4 points will ALWAYS be returned.
        
        throw new Error("Not implemented");
    };
    
    _m.latLongToUsng=function(lat, lon, precision, output) {
        /*
         * Convenience function that basically just:
         *  * Converts lat/long to UTM
         *  * Converts UTM to USNG
         *
         * @param lat- Latitude in decimal degrees
         * @param lon- longitude in decimal degrees
         * @param precision- How many decimal places (1-5) in USNG (default 5)
         * @param output- Output format. Accepted values are: 'string' and 'object'
         * @return String of the format- DDL LL DDDDD DDDDD (5-digit precision)
         */
        var coords;

        if (typeof precision === 'string') {
            precision = parseInt(precision, 10);
        }

        precision = precision ? precision : 5;

        lat = parseFloat(lat);
        lon = parseFloat(lon);

        // convert lat/lon to UTM coordinates
        coords = _m.latLongToUtm(lat, lon);

        return _m.utmToUsng(coords, precision, output);
    };

    _m.latLongToMgrs=function (lat, lon, precision, output) {
        /*
         * Creates a Military Grid Reference System string.
         * This is the same as a USNG string, but without spaces.
         *
         * Space delimiters are optional but allowed in USNG, but are not allowed in MGRS.
         *
         * The numbers are the same between the two coordinate systems.
         *
         * @param lat- Latitude in decimal degrees
         * @param lon- longitude in decimal degrees
         * @param precision- How many decimal places (1-5) in USNG (default 5)
         * @param output- Output format. Accepted values are: 'string' and 'object'
         * @return String of the format- DDL LL DDDDD DDDDD (5-digit precision)
         */
        var mgrs,
            usng = _m.latLongToUsng(lat, lon, precision, output);

        if (typeof usng === 'string') {
            // remove space delimiters to conform to mgrs spec
            mgrs = usng.replace(/ /g, "");
        } else {
            mgrs = usng;
        }

        return mgrs;
    };
    _m.utmToUsng=function(coords, precision, output) {
        /*
         * Converts a UTM coordinate to USNG:
         *
         * @param coords- object with parts of a UTM coordinate
         * @param precision- How many decimal places (1-5) in USNG (default 5)
         * @param output- Format to output. Options include: 'string' and 'object'
         * @return String of the format- DDL LL DDDDD DDDDD (5-digit precision)
         */
        var utmEasting,
            utmNorthing,
            letters,
            usngNorthing,
            usngEasting,
            usng,
            i;

        if (typeof precision === 'string') {
            precision = parseInt(precision, 10);
        }

        precision = precision ? precision : 5;

        utmEasting = coords.easting;
        utmNorthing = coords.northing;

        // southern hemisphere case
        if (coords.hemisphere === 'S') {
            // Use offset for southern hemisphere
            utmNorthing += CONSTANTS.NORTHING_OFFSET;
        }

        letters  = _m.findGridLetters(coords.zoneNumber, utmNorthing, utmEasting);
        usngNorthing = Math.round(utmNorthing) % CONSTANTS.BLOCK_SIZE;
        usngEasting  = Math.round(utmEasting)  % CONSTANTS.BLOCK_SIZE;

        // added... truncate digits to achieve specified precision
        usngNorthing = Math.floor(usngNorthing / Math.pow(10,(5-precision)));
        usngEasting = Math.floor(usngEasting / Math.pow(10,(5-precision)));

        // REVISIT: Modify to incorporate dynamic precision ?
        for (i = String(usngEasting).length; i < precision; i += 1) {
            usngEasting = "0" + usngEasting;
        }

        for (i = String(usngNorthing).length; i < precision; i += 1) {
            usngNorthing = "0" + usngNorthing;
        }

        if (typeof output === 'string' && output === 'object') {
            usng = {
                zone: coords.zoneNumber + coords.zoneLetter,
                square: letters,
                easting: usngEasting,
                northing: usngNorthing
            };
        } else {
            usng = coords.zoneNumber + coords.zoneLetter + " " + letters + " " +
                usngEasting + " " + usngNorthing;
        }

        return usng;
    };
    _m.lettersHelper=function(set, row, col) {
        /*
         * Retrieve the Square Identification (two-character letter code), for the
         * given row, column and set identifier (set refers to the zone set:
         * zones 1-6 have a unique set of square identifiers; these identifiers are
         * repeated for zones 7-12, etc.)

         * See p. 10 of the "United States National Grid" white paper for a diagram
         * of the zone sets.
         */
        var l1, l2;

        // handle case of last row
        if (row === 0) {
            row = CONSTANTS.GRIDSQUARE_SET_ROW_SIZE - 1;
        } else {
            row -= 1;
        }

        // handle case of last column
        if (col === 0) {
            col = CONSTANTS.GRIDSQUARE_SET_COL_SIZE - 1;
        } else {
            col -= 1;
        }

        switch (set) {
            case 1:
                l1 = "ABCDEFGH";              // column ids
                l2 = "ABCDEFGHJKLMNPQRSTUV";  // row ids
                break;

            case 2:
                l1 = "JKLMNPQR";
                l2 = "FGHJKLMNPQRSTUVABCDE";
                break;

            case 3:
                l1 = "STUVWXYZ";
                l2 = "ABCDEFGHJKLMNPQRSTUV";
                break;

            case 4:
                l1 = "ABCDEFGH";
                l2 = "FGHJKLMNPQRSTUVABCDE";
                break;

            case 5:
                l1 = "JKLMNPQR";
                l2 = "ABCDEFGHJKLMNPQRSTUV";
                break;

            case 6:
                l1 = "STUVWXYZ";
                l2 = "FGHJKLMNPQRSTUVABCDE";
                break;
        }

        var text = "..";
        if (l1 && l2) text = l1.charAt(col) + l2.charAt(row);
        return text;
    };


    _m.findGridLetters=function(zoneNum, northing, easting) {
        /*
         * Retrieves the square identification for a given coordinate pair & zone.
         * See "lettersHelper" function documentation for more details.
         */
        var north_1m, east_1m, row, col;

        zoneNum  = parseInt(zoneNum, 10);
        northing = parseFloat(northing);
        easting  = parseFloat(easting);
        row = 1;

        // northing coordinate to single-meter precision
        north_1m = Math.round(northing);

        // Get the row position for the square identifier that contains the point
        while (north_1m >= CONSTANTS.BLOCK_SIZE) {
            north_1m = north_1m - CONSTANTS.BLOCK_SIZE;
            row += 1;
        }

        // cycle repeats (wraps) after 20 rows
        row = row % CONSTANTS.GRIDSQUARE_SET_ROW_SIZE;
        col = 0;

        // easting coordinate to single-meter precision
        east_1m = Math.round(easting);

        // Get the column position for the square identifier that contains the point
        while (east_1m >= CONSTANTS.BLOCK_SIZE){
            east_1m = east_1m - CONSTANTS.BLOCK_SIZE;
            col += 1;
        }

        // cycle repeats (wraps) after 8 columns
        col = col % CONSTANTS.GRIDSQUARE_SET_COL_SIZE;

        return _m.lettersHelper(_m.findSet(zoneNum), row, col);
    };
    _m.findSet=function (zoneNum) {
        /*
         * Finds the set for a given zone.
         *
         * There are six unique sets, corresponding to individual grid numbers in
         * sets 1-6, 7-12, 13-18, etc. Set 1 is the same as sets 7, 13, ..; Set 2
         * is the same as sets 8, 14, ..
         *
         * See p. 10 of the "United States National Grid" white paper.
         */

        var tReturn;

        zoneNum = parseInt(zoneNum, 10);
        zoneNum = zoneNum % 6;

        switch (zoneNum) {
            case 0:
                tReturn = 6;
                break;
            case 1:
                tReturn = 1;
                break;
            case 2:
                tReturn = 2;
                break;
            case 3:
                tReturn = 3;
                break;
            case 4:
                tReturn = 4;
                break;
            case 5:
                tReturn = 5;
                break;
            default:
                tReturn = -1;
                break;
        }

        return tReturn;
    };

    _m.countryFromTwoLetter=function(twoLetterCode){
        var lookup=_m.COUNTRY_CODES[twoLetterCode];
        return lookup?lookup:"Unrecognized - "+twoLetterCode;
    };
    _m.twoLetterCountryCode=function(countryName){
        var found="";
        var lcaseName=countryName.toLowerCase();
        for (var key in _m.COUNTRY_CODES) {
            var val = _m.COUNTRY_CODES[key];
            if (val.toLowerCase()==lcaseName){
                found=key;
                break;
            }
        }
        return found?found:"??";
    };

    _m.toRad=function(deg){
        return (deg*Math.PI / 180);
    };
    _m.toDeg = function(rad) {
        return (rad*180 / Math.PI);
    };
    _m.destinationFromBearingAndDistance=function(point,bearingDeg,distKM){
        var lat1 = point.lat || point.y;
        var lon1 = point.lon || point.long || point.lng || point.x;
        var R = 6371;
        lat1 = _m.toRad(lat1);
        lon1= _m.toRad(lon1);
        var bearingRad = _m.toRad(bearingDeg);

        var lat2 = Math.asin( Math.sin(lat1)*Math.cos(distKM/R) +
            Math.cos(lat1)*Math.sin(distKM/R)*Math.cos(bearingRad) );
        var lon2 = lon1 + Math.atan2(Math.sin(bearingRad)*Math.sin(distKM/R)*Math.cos(lat1),
            Math.cos(distKM/R)-Math.sin(lat1)*Math.sin(lat2));

        return {lat:_m.toDeg(lat2), lon:_m.toDeg(lon2)};
    };

    //================
    if (global.maptools) {
        throw new Error('maptools has already been defined');
    } else {
        global.maptools = _m;
    }


})(typeof window === 'undefined' ? this : window);
