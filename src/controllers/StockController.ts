import express from 'express';
import * as Constants from '#root/src/constants/constants.js';
import * as StockService from '#root/src/services/StockService.js';
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.js";
import {Request, Response, NextFunction} from "express";
import {StocksDataGetParam, StocksTrackParam} from "#root/src/services/StockService.js";

const getStockRouter = () => {

    const basePath = "/stock";
    let router = express.Router();

    router.get(basePath, getStocks);
    router.post(basePath, createStocks);
    router.get(basePath + "/tracked", getTrackedStocks);
    router.post(basePath + "/tracked/:id/track", trackStock);
    router.post(basePath + "/tracked/:id/untrack", untrackStock);
    router.get(basePath + "/retrieve-from-source", retrieveStockDataFromSource);
    router.get(basePath + "/:ticker_no", getStock);
    router.put(basePath + "/", upsertStock);
    router.delete(basePath + "/:ticker_no", deleteStock);

    return router;
}

const getStocks = async (req: Request<{}, {}, {}, StocksDataGetParam>, res: Response, next: NextFunction) => {

    try {
        const stocks = await StockService.getStocksData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stocks
            )
        );
    } catch (err) {

        next(err);
    }
}

const createStocks = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // console.log(req.body);
        const stocks = await StockService.postStockData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stocks
            )
        );
    } catch (err) {

        next(err);
    }
}

const getStock = async (req: Request<StocksDataGetParam, {},{}, {}>, res: Response, next:NextFunction) => {

    try {

        const stock = await StockService.getStockData(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stock
            )
        );
    } catch (err) {

        next(err);
    }
}

const upsertStock = async (req: Request, res: Response, next: NextFunction) => {

    try {
        // console.log(req.body);
        const stocks = await StockService.putStockData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stocks
            )
        );
    } catch (err) {

        next(err);
    }
}

const deleteStock = async (req: Request<StocksDataGetParam, {}, {}, {}>, res: Response, next: NextFunction) => {

    try {

        const stock = await StockService.deleteStockData(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stock
            )
        );
    } catch (err) {

        next(err);
    }
}

const getTrackedStocks = async (_req: Request, res: Response, next: NextFunction) => {

    try {

        const stock = await StockService.getTrackedStocks();

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stock
            )
        );
    } catch (err) {

        next(err);
    }
}

const trackStock = async (req: Request<StocksTrackParam, {}, {},{}>, res: Response, next: NextFunction) => {

    try {

        const stock = await StockService.setTrackStock(req.params, true);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stock
            )
        );
    } catch (err) {

        next(err);
    }
}

const untrackStock = async (req: Request<StocksTrackParam, {}, {},{}>, res: Response, next: NextFunction) => {

    try {

        const stock = await StockService.setTrackStock(req.params, false);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                stock
            )
        );
    } catch (err) {

        next(err);
    }
}

const retrieveStockDataFromSource = async (_req: Request, res: Response, next: NextFunction) => {

    try {

        StockService.retrieveStockDataFromSource();

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                "done!"
            )
        );
    } catch (err) {

        next(err);
    }
}

export {
    getStockRouter
}