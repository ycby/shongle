import express, {NextFunction, Request, Response, Router} from "express";
import * as DiaryEntryService from "#root/src/services/DiaryEntryService.ts";
import * as Constants from "#root/src/constants/constants.ts";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.ts";
import {DiaryEntryDataBody, DiaryEntryDataGetParams} from "#root/src/services/DiaryEntryService.ts";

const getDiaryEntryRouter = () => {

    const basePath: string = '/diary-entry';
    let router: Router = express.Router();

    router.get(basePath + '/', getDiaryEntries);
    router.post(basePath + '/', createDiaryEntries);
    router.put(basePath + '/:id', upsertDiaryEntry);
    router.delete(basePath + '/:id', deleteDiaryEntry);

    return router;
}

const getDiaryEntries = async (req: Request<{}, {}, {}, DiaryEntryDataGetParams>, res: Response, next: NextFunction) => {

    try {

        const diaryEntries = await DiaryEntryService.getDiaryEntryData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                diaryEntries,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const createDiaryEntries = async (req: Request<{}, {}, DiaryEntryDataBody[], {}>, res: Response, next: NextFunction) => {

    try {

        const diaryEntries = await DiaryEntryService.createDiaryEntryData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                diaryEntries,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const upsertDiaryEntry = async (req: Request<{}, {}, DiaryEntryDataBody, {}>, res: Response, next: NextFunction) => {

    try {

        const diaryEntry = await DiaryEntryService.upsertDiaryEntryData(req.body);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                diaryEntry,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

const deleteDiaryEntry = async (req: Request<{}, {}, {}, DiaryEntryDataGetParams>, res: Response, next: NextFunction) => {

    try {

        const diaryEntry = await DiaryEntryService.deleteDiaryEntryData(req.query);

        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(
            ResponseStandardiser.generateStandardResponse(
                diaryEntry,
                Constants.APP_STATUS_CODES.SUCCESS,
                Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND
            )
        );
    } catch (err) {

        next(err);
    }
}

export {
    getDiaryEntryRouter
}