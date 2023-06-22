import { CIQ } from "chartiq/js/chartiq.js";
CIQ.Market = CIQ.Market || function () {};
CIQ.Market.JSE = {
	name: "JSE",
	market_tz: "Africa/Johannesburg",
	hour_aligned: true,
	normal_daily_open: "00:00",
	normal_daily_close: "24:00",
	rules: [
		{ dayofweek: 1, open: "08:00", close: "24:00" },
		{ dayofweek: 2, open: "08:00", close: "24:00" },
		{ dayofweek: 3, open: "08:00", close: "24:00" },
		{ dayofweek: 4, open: "08:00", close: "24:00" },
		{ dayofweek: 5, open: "08:00", close: "18:00" }
	]
};
