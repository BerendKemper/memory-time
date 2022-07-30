"use strict";
const fs = require("fs");
const path = require("path");
class MemoryTime {
    #filepath;
    #mimetype;
    #startTime;
    #separator;
    constructor(filepath = "measurements.csv", options = {}) {
        this.#separator = typeof options?.separator === "string" ? options.separator : ",";
        this.#filepath = filepath;
        const { dir, ext } = path.parse(filepath);
        if (Object.getPrototypeOf(this).hasOwnProperty(ext)) this.#mimetype = ext;
        else throw new TypeError(`${this.constructor.name} does not support mimetype "${ext}"`);
        fs.mkdirSync(dir || "./", { recursive: true });
        this.#startTime = process.hrtime();
        this.ix = 1
        let [sec, nano] = process.hrtime(this.#startTime);
        this.time = sec * 1e3 + nano / 1e6;
        this.ms = 0;
        Object.assign(this, process.memoryUsage());
        this.heapUsedGrowth = 0;
        this.externalGrowth = 0;
        this.arrayBuffersGrowth = 0;
        this.fsDelay = 0;
        fs.writeFileSync(filepath, this[this.#mimetype](true));
        [sec, nano] = process.hrtime(this.#startTime);
        this.fsDelay = -(this.time - (this.time = sec * 1e3 + nano / 1e6));
    };
    /**@returns {void}*/
    measure() {
        const { rss, heapTotal, heapUsed, external, arrayBuffers } = process.memoryUsage();
        let [sec, nano] = process.hrtime(this.#startTime);
        let start = this.time;
        this.ix++;
        this.time = sec * 1e3 + nano / 1e6;
        this.ms = this.time - start;
        this.rss = rss;
        this.heapTotal = heapTotal;
        if (heapUsed > this.heapUsed) this.heapUsedGrowth += heapUsed - this.heapUsed;
        this.heapUsed = heapUsed;
        if (external > this.external) this.externalGrowth += external - this.external;
        this.external = external;
        if (arrayBuffers > this.arrayBuffers) this.arrayBuffersGrowth += arrayBuffers - this.arrayBuffers;
        this.arrayBuffers = arrayBuffers;
        fs.appendFileSync(this.#filepath, this[this.#mimetype]());
        [sec, nano] = process.hrtime(this.#startTime);
        this.fsDelay = -(this.time - (this.time = sec * 1e3 + nano / 1e6));
    };
    /**@param {boolean} withHeader*/
    [".csv"](withHeader) {
        return (withHeader === true
            ? Object.keys(this).join(this.#separator) + "\n"
            : "") + Object.values(this).join(this.#separator) + "\n";
    };
};
module.exports = MemoryTime;