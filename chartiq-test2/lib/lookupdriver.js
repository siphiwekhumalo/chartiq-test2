import { CIQ, quoteFeed, symbolLookupBase } from "chartiq/js/standard";

import symbols from "./symbols.json";

CIQ.activateImports(quoteFeed, symbolLookupBase); // so we can use CIQ.inheritsFrom
/**
 * An example of an asynchronous Lookup.Driver that uses a symbol array
 * @name CIQ.ChartEngine.Driver.Lookup.Iress
 * @constructor
 * @param {string[]} exchanges An array of exchanges that can be searched against
 * @private
 * @since 6.0.0
 */
CIQ.ChartEngine.Driver.Lookup.Iress = function (exchanges) {
	this.exchanges = exchanges;
	if (!this.exchanges) this.exchanges = ["JSE"];
	this.requestCounter = 0; //used to invalidate old requests
};
CIQ.inheritsFrom(
	CIQ.ChartEngine.Driver.Lookup.Iress,
	CIQ.ChartEngine.Driver.Lookup
);
/**
 * @memberof CIQ.ChartEngine.Driver.Lookup.Iress
 * @param {string} text Text to search for
 * @param {string} filter Any filter to be applied to the search results
 * @param {number} maxResults Max number of results to return from the server
 * @param {function} cb Callback upon results
 * @private
 * @since 6.0.0
 */
CIQ.ChartEngine.Driver.Lookup.Iress.prototype.acceptText = function (
	text,
	filter,
	maxResults,
	cb
) {
	// console.info('acceptText', { text, filter, maxResults });
	if (filter == "FX") filter = "FOREX";
	if (filter == "STOCKS") filter = "EQUITY";
	if (filter == "INDEXES") filter = "INDEX";
	if (!filter) filter = "ALL";
	if (isNaN(parseInt(maxResults, 10))) maxResults = 100;
	// var counter = ++this.requestCounter;
	// var self = this;
	var results = [];
	let count = 0;
	symbols.forEach((symbol) => {
		if (
			count < maxResults &&
			(text == "" || symbol.Security.startsWith(text)) &&
			(filter.toUpperCase() == "ALL" ||
				filter.toUpperCase() == symbol.SecurityType.toUpperCase())
		) {
			count++;
			const item = {
				symbol: `${symbol.Security}.${symbol.Exch}`,
				name: symbol.Description,
				exchDisp: symbol.Exch
			};
			results.push({
				data: item,
				display: [item.symbol, item.name, item.exchDisp]
			});
		}
	});
	// console.info('Driver.Lookup acceptText', { results });
	cb(results);
};
export { CIQ };
