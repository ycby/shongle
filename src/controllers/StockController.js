import express from 'express';
import * as Constants from '#root/src/constants/constants.js';
import * as StockService from '#root/src/services/StockService.js';
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.js";

const getStockRouter = () => {

    const basePath = "/stock";
    let router = express.Router();

    router.get(basePath, getStocks);
    router.post(basePath, createStocks);
    router.get(basePath + "/:code", getStock);
    router.put(basePath + "/:code", upsertStock);
    router.delete(basePath + "/:code", deleteStock);

    return router;
}

const getStocks = async (req, res, next) => {

    //TODO: add validation?
    try {

        const stocks = await StockService.getStocksData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                stocks,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const createStocks = async (req, res, next) => {

    //TODO: implement - consider how to avoid duplicates

    try {
        // console.log(req.body);
        const stocks = await StockService.postStockData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                stocks,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const getStock = async (req, res, next) => {

    try {

        const stock = await StockService.getStockData(req.params.code);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                stock,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const upsertStock = async (req, res, next) => {

    try {
        // console.log(req.body);
        const stocks = await StockService.putStockData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                stocks,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const deleteStock = async (req, res, next) => {

    try {

        const stock = await StockService.deleteStockData(req.params.code);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                stock,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

export {
    getStockRouter
}