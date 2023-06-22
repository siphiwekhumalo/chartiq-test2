import React, { Suspense } from "react";
import ReactDom from "react-dom";
import { 
	createBrowserRouter,
	RouterProvider,
	Route,
} from "react-router-dom";

import "chartiq/css/page-defaults.css";

// import StandardChart from '../components/chart';
// import MultiChart from '../components/multichart';
// import AdvancedChart from '../components/advanced_chart';
const StandardChart = React.lazy(() => import('../components/chart'));
const MultiChart = React.lazy(() => import('../components/multichart'));
const AdvancedChart = React.lazy(() => import('../components/advanced_chart'));

const router = createBrowserRouter([
	{
		path: '/multi',
		element: <Suspense fallback={<div>Loading...</div>}><MultiChart /></Suspense>,
	},
	{
		path: '/standard',
		element: <Suspense fallback={<div>Loading...</div>}><StandardChart /></Suspense>,
	},
	{
		path: '/',
		element: <Suspense fallback={<div>Loading...</div>}><AdvancedChart /></Suspense>,
	},
]);

const App = () => {
	return <RouterProvider router={router} />;
}

const el = document.querySelector("#app");

if (el) {
	ReactDom.render(<App />, el);
}

