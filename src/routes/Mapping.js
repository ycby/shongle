
const shortDataMapping = [
	{
		"label": "Stock Code",
		"value": "stock_code"
	},
	{
		"label": "Reporting Date",
		"value": "reporting_date"
	},
	{
		"label": "Shorted Shares",
		"value": "shorted_shares"
	},
	{
		"label": "Shorted Amount",
		"value": "shorted_amount"
	}
];

export default (req, res) => {

	switch (req.query.mapping) {

	case "shortdata":
		res.send(shortDataMapping)
	default:
		res.status(500).send()
	}
}