import React from "react";
import Chart, { CIQ } from "./Multi";
import quoteFeed from "../lib/quotefeed";
import "../lib/lookupdriver";
import "../lib/jse";

import PerfectScrollbar from "chartiq/js/thirdparty/perfect-scrollbar.esm.js";
import EmojiPopover from "chartiq/js/thirdparty/emoji-popover.es.js";

import marker from "chartiq/examples/markers/markersSample";

// SignalIQ
import "chartiq/plugins/signaliq/signaliqDialog";
import "chartiq/plugins/signaliq/signaliq-marker";
import "chartiq/plugins/signaliq/signaliq-paintbar";

// Translation file
import "chartiq/examples/translations/translationSample";

// Example Marker files
import "chartiq/examples/markers/tradeAnalyticsSample";
import "chartiq/examples/markers/videoSample";

import "chartiq/plugins/studybrowser";

// Access the class definition of the web component
// component.js file should be imported prior this class extension
const Dialog = CIQ.UI.components("cq-dialog")[0].classDefinition;

// Update the web component definition.
CIQ.UI.addComponentDefinition(
	"cq-dialog",
	class CustomDialog extends Dialog {
		// create alias for misspelled method in lookupDialog.js
		getKeyboardSelecteableItems() {
			this.getKeyboardSelectableItems();
		}
	}
);

// var messages = document.querySelector("cq-attribution").messages;
// messages.exchanges.CUSTOMEX = "Text for custom exchange";
// messages.sources.IRESS = "15min delayed data supplied by iress";
const Attribution = CIQ.UI.components("cq-attribution")[0].classDefinition;
console.info(CIQ.UI.components("cq-attribution")[0]);
class IressAttribution extends Attribution {
	constructor() {
		super();
		this.messages = {
			sources: {
				iress: "Delayed data supplied by Iress.",
				simulator: "Simulated data.",
				demo: "Demo data.",
				xignite:
					'<a target="_blank" href="https://www.xignite.com">Market Data</a> by Xignite.',
				fis_mm:
					'<a target="_blank" href="https://www.fisglobal.com/">Market Data</a> by FIS MarketMap.',
				Twiggs:
					'Twiggs MF Formula courtesy <a target="_blank" href="https://www.incrediblecharts.com/indicators/twiggs_money_flow.php">IncredibleCharts</a>.'
			},
			exchanges: {
				RANDOM: "Data is randomized.",
				"REAL-TIME": "Data is real-time.",
				DELAYED: "Data delayed 15 min.",
				RATES: "Yield data latest from source, bid/ask simulated.",
				BATS: "BATS BZX real-time.",
				EOD: "End of day data."
			}
		};
	}
}
CIQ.UI.addComponentDefinition("cq-attribution", IressAttribution);

const IressChart = (props) => {
	const initialSymbol = {
		symbol: "AGL",
		name: "Anglo American",
		exchDisp: "JSE"
	};

	return (
		<Chart
			config={{
				chartId: "_multiChart",
				initialSymbol,
				chartEntries: [{ symbol: "AGL.JSE" }, { symbol: "BAW.JSE" }],
				lookupDriver: CIQ.ChartEngine.Driver.Lookup.Iress
			}}
			resources={{
				quoteFeed,
				markerFeed: marker.MarkersSample,
				scrollStyle: PerfectScrollbar, // use improved component scrollbar appearance https://perfectscrollbar.com
				emojiPicker: EmojiPopover
			}}
		/>
	);
};

export default IressChart;
