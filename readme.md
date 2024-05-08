# cache-sim

Run the simulator by either opening index.html in your web browser of choice, or by navigating to https://forestquest.net/cacheSim/, where I have hosted it on my website. The features of the simulator include:

Ability to simulate a cache with varying parameters, including:
- Capacity of up to 1024 words or 4 KB (though there is no limit under the hood)
- Degree of associativity of 1 up to fully associative
- Block size of 1 to up to 1024

- Run individual lw instructions, or load and run a batch of memory addresses from a .txt file
- Choose between displaying addresses and indices as binary, hexadecimal, or decimal
- Report on miss/hit statistics
- Record history of memory accesses and whether they were hits or misses
- Pretty diagram of address fields given the current cache parameters

I've implemented pseudo-LRU (least recently used) using one bit for caches with a degree of associativity of more than two.

This project was created for CSC-270 at Union College (N.Y.)
