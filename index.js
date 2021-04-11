"use strict";
const fs = require("fs");
const path = require("path");
class MemoryTime {
	#filepath;
	#mimetype;
	#startTime;
	constructor(filepath = "measurements.csv") {
		this.#filepath = filepath;
		const { dir, ext } = path.parse(filepath);
		if (Object.getPrototypeOf(this).hasOwnProperty(ext))
			this.#mimetype = ext;
		else throw new TypeError(`${this.constructor.name} does not support mimetype "${ext}"`);
		fs.mkdirSync(dir, { recursive: true });
		const { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();
		this.#startTime = process.hrtime();
		this.ix = 1
		this.time = 0;
		this.ms = 0;
		this.rss = rss;
		this.heapTotal = heapTotal;
		this.heapUsed = heapUsed;
		this.heapUsedGrowth = 0;
		this.external = external;
		this.arrayBuffers = arrayBuffers;
		fs.writeFileSync(
			filepath,
			this[this.#mimetype](true)
		);
	};
	measure() {
		const { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();
		const [sec, nano] = process.hrtime(this.#startTime);
		let start = this.time;
		this.ix++;
		this.time = sec * 1e3 + nano / 1e6;
		this.ms = this.time - start;
		this.rss = rss;
		this.heapTotal = heapTotal;
		if (heapUsed > this.heapUsed)
			this.heapUsedGrowth += heapUsed - this.heapUsed;
		this.heapUsed = heapUsed;
		this.external = external;
		this.arrayBuffers = arrayBuffers;
		fs.appendFileSync(
			this.#filepath,
			this[this.#mimetype]()
		);
	};
	[".csv"](withHeader) {
		let tab;
		let writeStr = "";
		if (withHeader === true) {
			tab = "";
			for (const header in this) {
				writeStr += tab + header;
				tab = ",";
			}
			writeStr += "\n";
		}
		tab = "";
		for (const header in this) {
			writeStr += tab + this[header];
			tab = ",";
		}
		writeStr += "\n";
		return writeStr;
	};
};
module.exports = MemoryTime;