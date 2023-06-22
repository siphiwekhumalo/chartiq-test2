import { DateTime } from "luxon";
import axios from "axios";

const Exchanges = [
	{ Exchange: "FX", DataSource: "NXE" },
	{ Exchange: "IFE", DataSource: "IFEE" }
];

/**
 * Transform DFM snapshot data into chartiq friendly data
 * @param {*} data
 * @returns
 */
const TransformData = (data, startDate, endDate) => {
	const resultSet = [];
	data.forEach((point) => {
		if (
			point.TotalVolume == 0 &&
			point.HighPrice == 0 &&
			point.LowPrice == 0 &&
			point.OpenPrice == 0
		) {
			point.LowPrice = point.ClosePrice;
			point.HighPrice = point.ClosePrice;
			point.OpenPrice = point.ClosePrice;
		}
		if (point.TimeSeriesDate) {
			const luxonDate = DateTime.fromISO(
				point.TimeSeriesDate.replace(/\//g, "-").replace(" ", "T")
			);
			const date = luxonDate.toJSDate();
			resultSet.push({
				DT: date,
				Open: point.OpenPrice,
				High: point.HighPrice,
				Low: point.LowPrice,
				Close: point.ClosePrice,
				Volume: point.TotalVolume
			});
		}
		if (point.TimeSeriesDateTime) {
			const luxonDate = DateTime.fromISO(
				point.TimeSeriesDateTime.replace(/\//g, "-").replace(" ", "T"),
				{ zone: "Africa/Johannesburg", setZone: true }
			);
			const jsDate = luxonDate.toJSDate();
			// const dateStr = luxonDate.toFormat('yyyyMMddHHmmssu');
			// console.info('TimeSeriesDateTime', { point: point.TimeSeriesDateTime, luxonDate, jsDate, startDate, endDate });
			if (jsDate >= startDate && jsDate <= endDate) {
				// console.info('resultset TimeSeriesDateTime', { point: point.TimeSeriesDateTime, luxonDate, jsDate, startDate, endDate, dateStr });
				// console.info('resultSet', { jsDate, startDate, endDate });
				resultSet.push({
					DT: jsDate,
					// Date: dateStr,
					Open: point.OpenPrice,
					High: point.HighPrice,
					Low: point.LowPrice,
					Close: point.ClosePrice,
					Volume: point.TotalVolume
				});
			}
		}
	});
	return resultSet;
};

const getDfmDate = (date) => {
	const luxonDate = DateTime.fromJSDate(date);
	return luxonDate.toISODate();
};

const getDfmDateTime = (date) => {
	const luxonDate = DateTime.fromJSDate(date);
	return luxonDate.toISO();
};

const LoadChartData = async (
	securitycode,
	exchange,
	datasource,
	startDate,
	endDate,
	Periodicity
) => {
	const Fields =
		Periodicity == "Daily"
			? [
					"Exchange",
					"SecurityCode",
					"OpenPrice",
					"HighPrice",
					"LowPrice",
					"ClosePrice",
					"TotalVolume",
					"TimeSeriesDate"
			  ]
			: [
					"Exchange",
					"SecurityCode",
					"OpenPrice",
					"HighPrice",
					"LowPrice",
					"ClosePrice",
					"TotalVolume",
					"TimeSeriesDateTime"
			  ];
	let feedDef = {
		ClientID: "2",
		UserID: "34",
		FeedName: "Symphony demo feed",
		FeedFormat: "JSON",
		Enabled: true,
		contentType: "Time Series",
		Fields,
		FieldMapping: {},
		FieldFormats: {},
		Periodicity,
		NumberOfDays: "-100",
		ConsolidationInterval: "1",
		Override: { dateranges: null, codes: null },
		needOverride: false,
		stylingProperties: {},
		transform: "html",
		codeLists: [
			{
				Exchange: exchange,
				Datasource: datasource,
				RangeCode: "Equities",
				SecurityTypeHigh: 106,
				SecurityTypeLow: 100,
				codes: [securitycode],
				option: "Codes"
			}
		]
	};
	try {
		const start =
			Periodicity == "Daily"
				? getDfmDate(startDate)
				: getDfmDateTime(startDate);
		const end =
			Periodicity == "Daily" ? getDfmDate(endDate) : getDfmDateTime(endDate);
		let requestBody = {
			feedDef,
			codes: securitycode,
			dateranges: `${start}/${end}`
		};
		console.log("Requesting data from DFM", {
			securitycode,
			startDate,
			endDate,
			requestBody
		});
		const token =
			"eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzZWNJRCI6MTEzMiwiaWF0IjoxNjg2NjQ5ODA2LCJhdWQiOiJpcmVzcy5jby56YSIsImlzcyI6ImFjY291bnRzLmlyZXNzLmNvLnphIn0.jSl4AVWMOKqfSLSyTyRN3SXWVdmdUqWzXFqcu97HW8HzYecytguPSikvZ2KBrgCb-RD31Z8yNskax_-kr3JrHA";
		const resp = await axios.post(
			`https://df.marketdata.feeds.iress.com/feed/2284`,
			requestBody,
			{
				headers: { authorization: `Bearer ${token}` }
			}
		);
		let data = [];
		if (
			!resp.data.error &&
			resp.data &&
			(resp.data.TimeSeries ||
				resp.data.TimeSeriesIntraday ||
				resp.data.Snapshot ||
				resp.data.News)
		)
			data = resp.data;
		console.info("data", data);
		return TransformData(data.Snapshot, startDate, endDate);
	} catch (error) {
		console.info("Load Chart Data Error", error);
	}
};

const extractSymbol = (symbol) => {
	let parts = symbol.split(".");
	if (parts.length < 2) {
		return { securitycode: parts[0], exchange: "JSE", datasource: "JSE" };
	}
	const exchange = parts[parts.length - 1];
	const foundExchange = Exchanges.find((item) => item.Exchange == exchange);
	if (foundExchange) {
		const securitycode = symbol.substring(
			0,
			symbol.length - exchange.length - 1
		);
		return {
			securitycode,
			exchange: foundExchange.Exchange,
			datasource: foundExchange.DataSource
		};
	}
	return { securitycode: symbol, exchange: "JSE", datasource: "JSE" };
};

const getPeriodicity = (params) => {
	if (params.interval === "minute") {
		switch (params.period) {
			case 5:
				return "5m";
			case 10:
				return "10m";
			case 15:
				return "15m";
			case 30:
				return "30m";
			default:
				return "1m";
		}
	}
	return "Daily";
};

const getInitialData = (symbol, startDate, endDate, params, cb) => {
	const moreAvailable =
		params.interval == "minute"
			? DateTime.fromJSDate(startDate) > DateTime.now().minus({ days: 7 })
			: DateTime.fromJSDate(startDate) > DateTime.now().minus({ days: 1095 });
	const security = extractSymbol(symbol);
	// console.info('security', security);
	// const upToDate = params.interval == 'day' && DateTime.fromJSDate(endDate) >= DateTime.now().startOf('day');
	LoadChartData(
		security.securitycode,
		security.exchange,
		security.datasource,
		startDate,
		endDate,
		getPeriodicity(params)
	).then((data) => {
		const returnData = {
			quotes: data,
			moreAvailable,
			attribution: { source: "iress", exchange: "CUSTOMEX" }
			// upToDate,
		};
		console.info("initial returnData", {
			startDate,
			endDate,
			Data: JSON.stringify(returnData)
		});
		cb(returnData);
	});
};

const getPaginationData = (symbol, startDate, endDate, params, cb) => {
	const moreAvailable =
		params.interval == "minute"
			? DateTime.fromJSDate(startDate) > DateTime.now().minus({ days: 7 })
			: DateTime.fromJSDate(startDate) > DateTime.now().minus({ days: 1095 });
	const security = extractSymbol(symbol);
	LoadChartData(
		security.securitycode,
		security.exchange,
		security.datasource,
		startDate,
		endDate,
		getPeriodicity(params)
	).then((data) => {
		const returnData = {
			quotes: data,
			moreAvailable,
			attribution: { source: "iress", exchange: "CUSTOMEX" }
		};
		console.info("pagination returnData", {
			startDate,
			endDate,
			Data: JSON.stringify(returnData)
		});
		cb(returnData);
	});
};

const quoteFeed = {
	fetchInitialData: (symbol, startDate, endDate, params, cb) => {
		let end = new Date();
		if (endDate && !isNaN(endDate)) {
			end = endDate;
		}
		console.info("fetchInitialData", { symbol, startDate, end, params });
		getInitialData(symbol, startDate, end, params, cb);
	},
	fetchUpdateData: (symbol, startDate, params, cb) => {
		console.info("fetchUpdateData", { symbol, startDate, params });
	},
	fetchPaginationData: (symbol, startDate, endDate, params, cb) => {
		let end = new Date();
		if (endDate && !isNaN(endDate)) {
			end = endDate;
		}
		console.info("fetchPaginationData", { symbol, startDate, end, params });
		getPaginationData(symbol, startDate, end, params, cb);
	}
};

export default quoteFeed;
