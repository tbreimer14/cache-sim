/**
 * Contains methods for executing "LW" instructions and maintaining the simulated cache.
 * Author: Thomas Breimer
 * March 18, 2024
 */

// Global params of cache
var capacity = 16;
var blocksize = 1;
var doa = 1; // Degree of associativity

// Miss stats
var misses = 0;
var hits = 0;
var compMisses = 0;

// Stores memory adresses of the data being held in cache. Each element is a 2D array representing one way,
// with each element of those arrays representing a set, and the lowest level elements each representing a word.
var cache = []

// Least recently used, holds a 1 or 0 for each set. 
var lru = []

// User Preferences
var addrFormat = 16;
var indexFormat = 16;
var inputFormat = 16;

var countCompMisses = false;

// 2d Array, each index holds an array which holds an address and whether that instruction was a hit, miss, or comp miss
var insHistory = []

function init() {
	updateCacheParams();
	resize();
}

/**
 * Called each time one of the cache param dropdowns is changed.
 */
function updateCacheParams() {
	capacity = parseInt($('#capacityDropdown').val());
	blocksize = parseInt($('#blocksizeDropdown').val()); 
	doa = parseInt($('#doaDropdown').val());

	maxPossibleBlockSize = capacity / doa;

	if (blocksize > maxPossibleBlockSize) { // Disallow block size from being too big if capacity is lowered
		blocksize = maxPossibleBlockSize;
	}

	maxPossibleDOASize = capacity / blocksize;

	if (doa > maxPossibleDOASize) {
		doa = maxPossibleDOASize;
	}

	updateDropdownOptions();
	populateData();
	generateTables();
	updateFieldsGraphic();
	resetHistoryAndStats();
}

/**
 * Populates the arrays ways and lru using the global cache params.
 */
function populateData(){
	var ways = doa;
	var sets = capacity / doa / blocksize;

	// We have a least recently used bit for each set
	lru = new Array(sets).fill(0);

	cache = [];

	// Cache = (sets * blocksize) * ways
	for (var i = 0; i < ways; i++) {
		var way = [];
		for (var j = 0; j < sets; j++) {
			var set = [];
			for (var k = 0; k < blocksize; k++) {
				set.push("");
			}
			way.push(set);
		}
		cache.push(way);
	}
}

/**
 * Given a hex value, updates the cache to simulate a LW instruction
 * @param {String} addr address of the LW instruction in hex
 */
function executeLW(addr) {
	console.log(addr);
	var sets = capacity / doa / blocksize; // Calc cache params
	var indexLen = Math.log2(sets);	// Calc number of index and block bits
	var blockLen = Math.log2(blocksize);

	var binary = hex2bin(addr); // Find the index 
	var index = binary.slice(30 - blockLen - indexLen, 30 - blockLen);
	index = parseInt(index, 2);

	if (isNaN(index)) { // If there's no index bit, this means there's only one index (fully associative)
		index = 0;
	}

	var block = binary.slice(30 - blockLen, 30); // Find the block
	block = parseInt(block, 2);

	if (isNaN(block)) { // If there's no block bit, this means there's only one block
		block = 0;
	}

	// Check if we've hit
	hit = false;
	for (var i = 0; i < doa; i++) { // Loop through the ways
		dataBinary = hex2bin(cache[i][index][block]); // Convert the mem address of that data in cache to binary
		if (dataBinary.slice(0,30) == binary.slice(0,30)) { // Check to see if we already have that mem adress (splicing off the byte offset)
			hit = true;
			hits += 1;
			lru[index] = Math.round((doa - i) / doa); // Update the LRU bit to the least recently used way group
			console.log("hit!");
			break;
		}
	}

	compMiss = false;
	// Try to find an empty way to put the data
	if (!hit) {
		for (var i = 0; i < doa; i++) { // Loop through the ways
			if (cache[i][index][block] == "") { // Check if that way is empty
				fillCache(addr, i, index);
				console.log("comp miss");
				compMisses += 1;
				compMiss = true;
				lru[index] = Math.round((doa - i) / doa); // Update the LRU bit to the least recently used way group
				break;
			}
		}
	}

	miss = false;

	// If not a comp miss, we have to replace data :(
	if (!compMiss && !hit) {
		miss = true;

		// Since we are doing psuedo LRU with only one bit, if doa > 2 we must put the ways into two groups,
		// and choose a random way from the least recently used group.
		if (doa > 1) {	
			way = randomInteger(0, doa / 2 - 1); // Choose a random way from the group
			way = lru[index] * (doa / 2) + way; // Use our LRU bit as an offset to choose the correct group
		} else {
			way = 0;
		}

		misses += 1;
		console.log("miss");

		fillCache(addr, way, index);
	}

	if (lru[index] == 0) { // Flip the LRU bit
		lru[index] = 1;
	} else {
		lru[index] = 0;
	}

	// Update UI
	generateTables();
	updateStats();
	addToHistory(addr, hit, miss, compMiss);
}

/**
 * Fills a set of cache for one way
 * @param {Int} addr The address of the data we're "accessing"
 * @param {Int} way The way the data should go into
 * @param {Int} index The index we're targeting
 */
function fillCache(addr, way, index) {
	var blockLen = Math.log2(blocksize);


	addr = hex2bin(addr).slice(0, 30 - blockLen) + "00" + "0".repeat(blockLen); // Round down to the nearest byte and block
	addr = addr.padStart(32, "0");
	addr = bin2hex(addr);
	
	for (var i = 0; i < blocksize; i++) {
		if (addr.length == 8) { // Don't try to break the simulator!!!!!!
			cache[way][index][i] = addr;
			addr = parseInt("0x" + addr) + 4; // Add 4 to addr for next block
			addr = addr.toString(16).padStart(8, 0); // Convert back to an 8 digit string
		}
	}
}

/**
 * Adds a "LW" instruction to the instruction history
 * @param {String} addr Adress of the LW in hex
 * @param {Boolean} hit If it was a hit
 * @param {Boolean} miss If it was a miss
 * @param {Boolean} compMiss If it was a compulsory miss
 */
function addToHistory(addr, hit, miss, compMiss) {
	result = "";

	if (miss) {
		result = "miss";
	} else if (hit) {
		result = "hit";
	} else {
		result = "comp miss";
	}

	insHistory.push([addr, result]);

	updateHistoryTable();
}

/**
 * Resets history and stats when cache params are changed
 */
function resetHistoryAndStats(){
	insHistory = [];
	misses = 0;
	hits = 0;
	compMisses = 0;
	updateHistoryTable();
	updateStats();
}