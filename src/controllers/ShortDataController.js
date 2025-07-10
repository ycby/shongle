import express from 'express'
import * as Constants from "#root/src/constants/constants.js";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.ts";
import * as ShortDataService from "#root/src/services/ShortDataService.ts";
import {stringToDateConverter} from "#root/src/helpers/DateHelper.ts";

const getShortDataRouter = () => {

    const path = "/short";
    const router = express.Router();

    router.get(path, getShortData);
    router.post(path, createShortData);
    router.get(path + "/retrieve-from-source", retrieveShortDataFromSource);
    router.get(path + "/:id", getShortDatum);
    router.put(path + "/:id", upsertShortDatum);
    router.delete(path + "/:id", deleteShortDatum);

    return router;
}

const getShortData = async (req, res, next) =>{

    try {
        const shortData = await ShortDataService.getShortData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                shortData,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const createShortData = async (req, res, next) => {

    try {

        const shortData = await ShortDataService.postShortData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                shortData,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const getShortDatum = async (req, res, next) => {

    try {

        const shortData = await ShortDataService.getShortDatum(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                shortData,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const upsertShortDatum = async (req, res, next) => {

    try {

        const shortData = await ShortDataService.putShortDatum(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                shortData,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const deleteShortDatum = async (req, res, next) => {

    try {

        const shortData = await ShortDataService.deleteShortDatum(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                shortData,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const retrieveShortDataFromSource = async (req, res, next) => {

    try {

        ShortDataService.retrieveShortDataFromSource(stringToDateConverter(req.query.end_date));

        const response = 'Job has been started.';

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                response,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.JOB_STARTED
            )
        );
    } catch (err) {

        next(err);
    }
}

export {
    getShortDataRouter
}