import Papa from 'papaparse';
const mapping = {
    'id': {
        label: 'id',
        value: 'id'
    },
    'Stock Code': {
        label: "Stock Code",
        value: "stock_code"
    },
    'Date': {
        label: "Reporting Date",
        value: "reporting_date"
    },
    'Aggregated Reportable Short Positions (Shares)': {
        label: "Shorted Shares",
        value: "shorted_shares"
    },
    'Aggregated Reportable Short Positions (HK$)': {
        label: "Shorted Amount",
        value: "shorted_amount"
    }
};
const root = 'https://www.sfc.hk/-/media/EN/pdf/spr';
const retrieveShortData = async (targetDate, callbackHandler) => {
    let fileName = `Short_Position_Reporting_Aggregated_Data_${targetDate.getFullYear()}${(targetDate.getMonth() + 1).toString().padStart(2, '0')}${targetDate.getDate().toString().padStart(2, '0')}.csv`;
    try {
        const response = await fetch(`${root}/${targetDate.getFullYear()}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}/${targetDate.getDate().toString().padStart(2, '0')}/${fileName}`, {
            method: 'GET'
        });
        //for some reason, error is also 200
        if (!response.ok)
            throw new Error('Failed to fetch Short Data');
        //this is the expected error if path is invalid
        const responseHeaders = response.headers.get('content-type');
        if (responseHeaders !== null && responseHeaders.includes('text/html'))
            throw new Error('No file exists for this date.');
        //this is for handling the unexpected errors
        if (responseHeaders !== null && !responseHeaders.includes('text/plain'))
            throw new Error('Unexpected error occurred when retrieving file.');
        Papa.parse(await response.text(), {
            complete: (results) => {
                callbackHandler(results.data);
            },
            header: true,
            transformHeader: (header) => {
                if (!Object.hasOwn(mapping, header))
                    return header;
                return mapping[header].value;
            },
            transform: (value, field) => {
                if (field === 'reporting_date') {
                    const dateString = value.split('/');
                    return new Date(parseInt(dateString[2]), parseInt(dateString[1]) - 1, parseInt(dateString[0]));
                }
                return value;
            },
            error: (err) => {
                console.error(err);
            },
            skipEmptyLines: true
        });
    }
    catch (err) {
        console.error(err);
    }
};
export { retrieveShortData };
