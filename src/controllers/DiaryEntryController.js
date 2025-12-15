import express from "express";
import * as DiaryEntryService from "#root/src/services/DiaryEntryService.ts";
import * as Constants from "#root/src/constants/constants.ts";
import * as ResponseStandardiser from "#root/src/utilities/ResponseStandardiser.ts";
const getDiaryEntryRouter = () => {
    const basePath = '/diary-entry';
    let router = express.Router();
    router.get(basePath + '/', getDiaryEntries);
    router.post(basePath + '/', createDiaryEntries);
    router.put(basePath + '/:id', upsertDiaryEntry);
    router.delete(basePath + '/:id', deleteDiaryEntry);
    return router;
};
const getDiaryEntries = async (req, res, next) => {
    try {
        const diaryEntries = await DiaryEntryService.getDiaryEntryData(req.query);
        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(ResponseStandardiser.generateStandardResponse(Constants.APP_STATUS_CODES.SUCCESS, Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND, diaryEntries));
    }
    catch (err) {
        next(err);
    }
};
const createDiaryEntries = async (req, res, next) => {
    try {
        const diaryEntries = await DiaryEntryService.createDiaryEntryData(req.body);
        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(ResponseStandardiser.generateStandardResponse(Constants.APP_STATUS_CODES.SUCCESS, Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND, diaryEntries));
    }
    catch (err) {
        next(err);
    }
};
const upsertDiaryEntry = async (req, res, next) => {
    try {
        const diaryEntry = await DiaryEntryService.upsertDiaryEntryData(req.body);
        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(ResponseStandardiser.generateStandardResponse(Constants.APP_STATUS_CODES.SUCCESS, Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND, diaryEntry));
    }
    catch (err) {
        next(err);
    }
};
const deleteDiaryEntry = async (req, res, next) => {
    try {
        const diaryEntry = await DiaryEntryService.deleteDiaryEntryData(req.params);
        return res.status(Constants.HTTP_STATUS_CODES.SUCCESS).json(ResponseStandardiser.generateStandardResponse(Constants.APP_STATUS_CODES.SUCCESS, Constants.APP_STATUS_DESCRIPTORS.RESULT_FOUND, diaryEntry));
    }
    catch (err) {
        next(err);
    }
};
export { getDiaryEntryRouter };
