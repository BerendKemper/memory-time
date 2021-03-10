"use strict";
const fs = require("fs");
const round3dec = number => Math.round(number * 100) / 100;
class MemoryTime {
	#time;
	constructor() {
		this.#time = process.hrtime();
		this.rrs = [];
		this.heapTotal = [];
		this.heapUsed = [];
		this.external = [];
		this.arrayBuffers = [];
		this.time = [];
		this.ms = [];
		this.msTotal = 0;
	};
	measure() {
		const { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();
		const [sec, nano] = process.hrtime(this.#time);
		let start = this.msTotal;
		this.msTotal = sec * 1e3 + nano / 1e6;
		this.time.push(this.msTotal);
		this.ms.push(this.msTotal - start);
		this.rrs.push(rss);
		this.heapTotal.push(heapTotal);
		this.heapUsed.push(heapUsed);
		this.external.push(external);
		this.arrayBuffers.push(arrayBuffers);
	};
	export({ filepath = "measurements", mimeType = ".csv" } = {}) {
		if (!this[mimeType])
			throw TypeError(`Export "${mimeType}" is not supported. Write a MemoryTime.prototype[mimeType] method to support a mimeType to your liking`);
		const file = filepath + mimeType;
		fs.writeFile(
			file,
			this[mimeType](),
			() => console.log("memory exported to", file)
		);
	};
	[".csv"]() {
		return `time\t${this.time.join("\t")}\nms\t${this.ms.join("\t")}\nrrs\t${this.rrs.join("\t")}\nheapTotal\t${this.heapTotal.join("\t")}\nheapUsed\t${this.heapUsed.join("\t")}\nexternal\t${this.external.join("\t")}\narrayBuffers\t${this.arrayBuffers.join("\t")}`;
	};
};
module.exports = MemoryTime;