import express, {Request, NextFunction, Response} from 'express'
import * as Constants from "#root/src/constants/constants.js";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.js";
import * as ShortDataService from "#root/src/services/ShortDataService.js";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.js";
import {
    ShortDataGetParam,
    ShortDataGetSingleParam, ShortDataMismatchQuery,
    ShortDataRetrieveQuery
} from "#root/src/services/ShortDataService.js";

const getShortDataRouter = () => {

    const path = "/short";
    const router = express.Router();

    router.get(path, getShortData);
    router.post(path, createShortData);
    router.get(path + "/retrieve-from-source", retrieveShortDataFromSource);
    router.get(path + "/mismatch", getTickersWithMismatchedData);
    router.get(path + "/:id", getShortDatum);
    router.put(path + "/:id", upsertShortDatum);
    router.delete(path + "/:id", deleteShortDatum);
    router.get(path + "/mismatch/:ticker_no", getMismatchedDataByTicker);

    return router;
}

const getShortData = async (req: Request<{}, {}, {}, ShortDataGetParam>, res: Response, next: NextFunction) =>{

    try {
        const shortData = await ShortDataService.getShortData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                shortData
            )
        );
    } catch (err) {

        next(err);
    }
}

const createShortData = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const shortData = await ShortDataService.postShortData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                shortData
            )
        );
    } catch (err) {

        next(err);
    }
}

const getShortDatum = async (req: Request<ShortDataGetSingleParam, {}, {}, {}>, res: Response, next: NextFunction) => {

    try {

        const shortData = await ShortDataService.getShortDatum(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                shortData
            )
        );
    } catch (err) {

        next(err);
    }
}

const upsertShortDatum = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const shortData = await ShortDataService.putShortDatum(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                shortData
            )
        );
    } catch (err) {

        next(err);
    }
}

const deleteShortDatum = async (req: Request<ShortDataGetSingleParam, {}, {}, {}>, res: Response, next: NextFunction) => {

    try {

        const shortData = await ShortDataService.deleteShortDatum(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                shortData
            )
        );
    } catch (err) {

        next(err);
    }
}

const retrieveShortDataFromSource = async (req: Request<{}, {}, {}, ShortDataRetrieveQuery>, res: Response, next: NextFunction) => {

    try {

        console.log(`SD: ${req.query.start_date}, ED: ${req.query.end_date}`);
        try {

            ShortDataService.retrieveShortDataFromSource(stringToDateConverter(req.query.start_date), stringToDateConverter(req.query.end_date));
        } catch (e) {

            console.error(e);
        }

        const response = 'Job has been started.';

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.JOB_STARTED,
                response
            )
        );
    } catch (err) {

        next(err);
    }
}

const getTickersWithMismatchedData = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const response = await ShortDataService.getTickersWithMismatchedData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.SUCCESS,
                response
            )
        );
    } catch (err) {

        next(err);
    }
}

const getMismatchedDataByTicker = async (req: Request<ShortDataMismatchQuery>, res: Response, next: NextFunction) => {

    try {

        const response = await ShortDataService.getMismatchedDataByTicker(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.SUCCESS,
                response
            )
        );
    } catch (err) {

        next(err);
    }
}

export {
    getShortDataRouter
}