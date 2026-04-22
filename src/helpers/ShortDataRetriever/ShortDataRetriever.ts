import Papa from 'papaparse';
import ShortData from "#root/src/models/ShortData.js";
import {
    getShortDataFromWeb, SFCData,
    shortDataRetrieverComplete,
    shortDataRetrieverTransform,
    shortDataRetrieverTransformHeader
} from "#root/src/helpers/ShortDataRetriever/ShortDataRetrieverHelper.js";

const retrieveShortData = async (targetDate: Date, callbackHandler: (data: ShortData[]) => void) => {

    // const fileStream = fs.createReadStream('/home/pikachu/Documents/Data/Short Data/test.csv')
    let csvResult: string;

    try {

        csvResult = await getShortDataFromWeb(targetDate);
    } catch (err) {

        console.error(err);
        return;
    }

    // @ts-ignore
    Papa.parse(csvResult, {
        complete: async (results: Papa.ParseResult<SFCData>): Promise<void> => {

            await shortDataRetrieverComplete(results, callbackHandler);
        },
        header: true,
        transformHeader: shortDataRetrieverTransformHeader,
        transform: shortDataRetrieverTransform,
        error: (err: any) => {

            console.error(err);
        },
        skipEmptyLines: true
    });
}

export { retrieveShortData }