import express from 'express';
import * as Constants from '#root/src/constants/constants.ts';
import * as StockService from '#root/src/services/StockService.ts';
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.ts";
import {Request, Response, NextFunction} from "express";
import {StocksDataGetParam} from "#root/src/services/StockService.ts";

const getStockRouter = () => {

    const basePath = "/stock";
    let router = express.Router();

    router.get(basePath, getStocks);
    router.post(basePath, createStocks);
    router.get(basePath + "/:ticker_no", getStock);
    router.put(basePath + "/:ticker_no", upsertStock);
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

export {
    getStockRouter
}