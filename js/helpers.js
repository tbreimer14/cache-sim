/**
 * Contains helper functions for ui.js and main.js
 * Author: Thomas Breimer
 * March 18th, 2024
 */

/**
 * Turns a hex string into a binary string
 * @param {String} hex hexidecimal value to convert
 * @returns binary equivalent
 */
function hex2bin(hex){
    hex = hex.replace("0x", "").toLowerCase();
    var out = "";
    for(var c of hex) {
        switch(c) {
            case '0': out += "0000"; break;
            case '1': out += "0001"; break;
            case '2': out += "0010"; break;
            case '3': out += "0011"; break;
            case '4': out += "0100"; break;
            case '5': out += "0101"; break;
            case '6': out += "0110"; break;
            case '7': out += "0111"; break;
            case '8': out += "1000"; break;
            case '9': out += "1001"; break;
            case 'a': out += "1010"; break;
            case 'b': out += "1011"; break;
            case 'c': out += "1100"; break;
            case 'd': out += "1101"; break;
            case 'e': out += "1110"; break;
            case 'f': out += "1111"; break;
            default: return "";
        }
    }

    return out;
}

/**
 * Turns a bin string into a hex string
 * @param {String} bin binary value to convert
 * @returns hex equivalent
 */
function bin2hex(bin){
    bin = bin.replace("0b", "").toLowerCase();
    var out = "";

	for (var i = 0; i < bin.length; i += 4) {
		var c = bin.slice(i, i + 4);
		switch(c) {
            case "0000": out += "0"; break;
            case "0001": out += "1"; break;
            case "0010": out += "2"; break;
            case "0011": out += "3"; break;
            case "0100": out += "4"; break;
            case "0101": out += "5"; break;
            case "0110": out += "6"; break;
            case "0111": out += "7"; break;
            case "1000": out += "8"; break;
            case "1001": out += "9"; break;
            case "1010": out += "a"; break;
            case "1011": out += "b"; break;
            case "1100": out += "c"; break;
            case "1101": out += "d"; break;
            case "1110": out += "e"; break;
            case "1111": out += "f"; break;
            default: return "";
        }
	}

	return out;
}

/**
 * Turns a String hex value into a its String decimal equivalent
 * @param {Str} hex String hex value 
 * @returns Decimal equivalent
 */
function hex2dec(hex) {
	num = parseInt(hex, 16);
	return num.toString();
}

/**
 * Turns a String dec value into a its String hex equivalent
 * @param {Str} dec String dec value 
 * @returns Hex equivalent
 */
function dec2hex(dec) {
    return parseInt(dec).toString(16).padStart(8, 0);
}

/**
 * Checks if a string represents a hexidecimal value
 * @param {String} str String to be tested 
 * @returns True if the string represents a hexidecimal value, false otherwise
 */
function isHex(str) {
	return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Checks if a string represents a binary value
 * @param {String} str String to be tested 
 * @returns True if the string represents a binary value, false otherwise
 */
function isBin(str) {
    return /^[01]+$/.test(str);
}

/**
 * Generate a random integer between min (inclusive) and max (inclusive)
 */
function randomInteger(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}