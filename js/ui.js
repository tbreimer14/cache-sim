/**
 * Contains functions for updating the cache tables and other UI elements
 * Author: Thomas Breimer
 * March 18th, 2024
 */

var about = false;
var $aboutDiv = $("");

/**
 * Updates possible values for blocksize and doa in their dropdown menus using the global cache params.
 */
function updateDropdownOptions(){

	$capacity = $('#capacityDropdown');
	$blocksize = $('#blocksizeDropdown'); 
	$doa = $('#doaDropdown');

	// Update possible values for blocksize
	maxPossibleBlockSize = capacity / doa;

	$blocksize.empty();

	while (maxPossibleBlockSize >= 1) {
		$blocksize.append($("<option></option>").attr("value", maxPossibleBlockSize).text(maxPossibleBlockSize.toString()));
		maxPossibleBlockSize /= 2;
	}

   	$blocksize.val(blocksize);

	// Update possible values for doa
	maxPossibleDOASize = capacity / blocksize;

	$doa.empty();

	while (maxPossibleDOASize >= 1) {
		$doa.append($("<option></option>").attr("value", maxPossibleDOASize).text(maxPossibleDOASize.toString()));
		maxPossibleDOASize /= 2;
	}

	$doa.val(doa);
}

/**
 * Generates the cache upon a new instruction or if the cache params change
 */
function generateTables(){
	$("#cacheTables").empty();

	var ways = doa;

	for (var k = 0; k < ways; k++) {

		$table = generateWay(k);
		
		$("#cacheTables").append($table);
	}

}

/**
 * Generates and returns the HTML table for a specified way
 * @param {Int} way The id of the way we are generating
 * @return {String} The HTML string corresponding to the table
 */
function generateWay(way) {
	var sets = capacity / doa / blocksize;

	// Construct table title (way0... etc)
	var title = '<th colspan="' + (blocksize + 1).toString() + '">way' + way + '</th>';

	// Create construct table header with dynamic block size
	var header = "<tr><th>index</th>"

	for (var i = 0; i < blocksize; i++){
		header += "<th>block" + i + "</th>"
	}

	header += "</tr>";
	var $table = $("<table/>");
	$table.append(title);
	$table.append(header);

	// Generate rows (set for one block)

	for (var j = 0; j < sets; j++) {

		row = "<tr><td>" + j.toString(indexFormat) + "</td>" // ID

		for (var i = 0; i < blocksize; i++) {

			value = cache[way][j][i];

			// Convert format if necessary
			if (addrFormat == 2 && value != "") {
				value = hex2bin(cache[way][j][i]);
			} else if (addrFormat == 10 && value != "") {
				value = hex2dec(cache[way][j][i]);
			}

			row += "<td>" + value + "</td>"; // Memory adress for that word
		}

		row += "</tr>"

		$table.append(row);
	}

	return $table;
}

/**
 * Called when execute is clicked, grabs the hex from the textbox, clears it, throws an error if needed,
 * and calls executeLW() to update the cache.
 */
function excecuteClicked() {
	var input = $("#adressBox").val();

	if (determineValidInput(input)) {
		$("#adressBox").val("");

		if (inputFormat == 2) {
			input = bin2hex(input);
		} else if (inputFormat == 10) {
			input = dec2hex(input);
		}

		executeLW(input);
	}
}

/**
 * Takes a memory address and decides whether it is valid for the current input format
 * @param {String} input Memory address
 */
function determineValidInput(input) {
	var valid = false;

	if (inputFormat == 16) {
		if (input.length == 8 && isHex(input)){
			valid = true;
		} else {
			alert("Your address was incorrectly formatted! Please enter an 8 digit hexidecimal value.");
		} 
	} else if (inputFormat == 2) {
		if (input.length == 32 && isHex(input)){
			valid = true;
			input = bin2hex(input); // Convert to 8 digit hex
		} else {
			alert("Your address was incorrectly formatted! Please enter a 32 bit binary value.");
		} 
	} else if (inputFormat == 10){
		num = parseInt(input);
		if (num >= 0 && num <= 4294967295) {
			valid = true;
			input = parseInt(input);
			input = input.toString(16).padStart(8, 0); // Convert to 8 digit hex
		} else {
			alert("Your address was incorrectly formatted! Please enter an integer between 0 and 4,294,967,295.");
		}
	}

	return valid;
}

/**
 * Updates the misses, hits, and comp misses labels using the global stats
 */
function updateStats() {
	$("#missLabel").text("Misses: " + misses);
	$("#hitLabel").text("Hits: " + hits);
	$("#compMissLabel").text("Compulsory Misses: " + compMisses);

	if (countCompMisses) {
		missPercent = (misses + compMisses) / (misses + compMisses + hits);
	} else {
		missPercent = (misses) / (misses + hits);
	}

	$("#missPercent").text("Miss Percentage: " + Math.round(missPercent * 10000) / 100 + "%");
}

/**
 * Updates the history table
 */
function updateHistoryTable() {
	$("#historyDiv").empty();

	if (insHistory.length == 0) {
		
		$('#historyDiv').append("<label>No Instructions Yet!</label>")
	} else {
		var header = "<tr><th>Instruction</th><th>Result</th>"
		var $table = $("<table/>");
		$table.append(header);
	
		$("#historyDiv").append($table);
	
		for (var i = 0; i < insHistory.length; i++) {
			addr = insHistory[i][0];
	
			if (addrFormat == 2 && addr != "null") {
				addr = hex2bin(addr);
			} else if (addrFormat == 10 && addr != "null") {
				addr = hex2dec(addr);
			}
	
			row = "<tr><td> lw $r 0(" + addr + ")</td><td>" + insHistory[i][1] + "</td><tr>"
	
			$table.append(row);
		}
	}
	

}

/**
 * Called every time cache params are changed. Updates the fields graphic.
 */
function updateFieldsGraphic() {
	var sets = capacity / doa / blocksize;
	var indexLen = Math.log2(sets);	// Calc number of index and block bits
	var blockLen = Math.log2(blocksize);
	var tagLen = 30 - indexLen - blockLen;

	$("#tagBits").text("00... [" + tagLen.toString() + "] ...00");
	$("#indexBits").text("0".repeat(indexLen));
	$("#blockBits").text("0".repeat(blockLen));
}

/**
 * Called when a file is uploaded. Parses the file and runs each mem addr
 * @param {*} event 
 */
async function uploadFile(event) {
	const file = event.target.files.item(0)
	const text = await file.text();

	addresses = text.split(/\r?\n/);

	for (var i = 0; i < addresses.length; i++) {
		address = addresses[i];
		if (address != "") {
			if (determineValidInput(address)) {
				address = address.toLowerCase().trim();
				executeLW(address);
			} else {
				break;
			}
		}
	}
}

/**
 * Called when File Format Info button is clicked
 */
function fileFormatInfoClick() {
	alert("You can upload a .TXT file specifying a list of memory addresses to be accessed. Include each address on a separate line and be sure to use the same number system currently specified by the input format dropdown.")
}

/**
 * Called when the address format dropdown is clicked
 */
function addrFormatChanged() {
	addrFormat = parseInt($('#addrFormatDropdown').val());
	generateTables();
	updateHistoryTable();
}

/**
 * Called when the index format dropdown is clicked
 */
function indexFormatChanged() {
	indexFormat = parseInt($('#indexFormatDropdown').val());
	generateTables();
}

/**
 * Called when the input format dropdown is clicked
 */
function inputFormatChanged() {
	inputFormat = parseInt($('#inputFormatDropdown').val());
	generateTables();
}

/**
 * Called when the checkbox is toggled
 */
function toggleCompMisses() {
	countCompMisses = !countCompMisses;
	updateStats();
}

/**
 * Called when the about button is clicked.
 */
function aboutClicked() {
	about = !about;
	if (about) {
		$aboutDiv = $('<div id="aboutDiv"></div>')
		$aboutDiv.append("<p>By Thomas Breimer for CSC-270 Winter 2024.</p>")
		$aboutDiv.append('<a href="https://www.forestquest.net/">My Website</a>')
		$("#header").append($aboutDiv);
	} else {
		$aboutDiv.remove();
	}

	resize();
}

/**
 * Called when the window is resized. Adjusts heigh of columns
 */
function resize() {
	if (about) {
		offset = 220;
	} else {
		offset = 150;
	}

	height = $(window).height();
	$("#interface").height((height - offset).toString() + "px");
	$("#cacheTables").height((height - offset).toString() + "px");
}