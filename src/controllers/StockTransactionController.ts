import express, {NextFunction, Request, Response, Router} from "express";
import * as StockTransactionService from "#root/src/services/StockTransactionService.ts";
import * as Constants from "#root/src/constants/constants.ts";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.ts";
import {TransactionDataBody, TransactionDataGetParams} from "#root/src/services/StockTransactionService.ts";

const getStockTransactionRouter = () => {

    const basePath: string = '/transaction';
    let router: Router = express.Router();

    router.get(basePath + '/', getStockTransactions);
    router.post(basePath + '/', createStockTransactions);
    router.get(basePath + '/stocks', getStocksWithTransactions);
    router.put(basePath + '/:id', upsertStockTransaction);
    router.delete(basePath + '/:id', deleteStockTransaction);

    return router;
}

const getStockTransactions = async (req: Request<{}, {}, {}, TransactionDataGetParams>, res: Response, next: NextFunction) => {

    try {

        const transactions = await StockTransactionService.getStockTransactionsData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                transactions
            )
        );
    } catch (err) {

        next(err);
    }
}

const getStocksWithTransactions = async (_: any, res: Response, next: NextFunction) => {

    try {

        const transactions = await StockTransactionService.getStocksWithTransactions();

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                transactions
            )
        );
    } catch (err) {

        next(err);
    }
}

const createStockTransactions = async (req: Request<{}, {}, TransactionDataBody[], {}>, res: Response, next: NextFunction) => {

    try {

        const transactions = await StockTransactionService.createStockTransactionsData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                transactions
            )
        );
    } catch (err) {

        next(err);
    }
}

const upsertStockTransaction = async (req: Request<{}, {}, TransactionDataBody, {}>, res: Response, next: NextFunction) => {

    try {

        const transactions = await StockTransactionService.upsertStockTransactionData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                transactions
            )
        );
    } catch (err) {

        next(err);
    }
}

const deleteStockTransaction = async (req: Request<TransactionDataGetParams, {}, {}, {}>, res: Response, next: NextFunction) => {

    try {

        const transactions = await StockTransactionService.deleteStockTransactionData(req.params);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND,
                transactions
            )
        );
    } catch (err) {

        next(err);
    }
}

export {
    getStockTransactionRouter
}