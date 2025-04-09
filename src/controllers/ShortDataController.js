import express from 'express'

export class ShortDataController {

    path = "/short";
    router = express.Router();

    constructor() {

        this.router.get(this.path, this.getShortData);
        this.router.post(this.path, this.createShortData);
        this.router.get(this.path + "/:id", this.getShortDatum);
        this.router.put(this.path + "/:id", this.upsertShortDatum);
        this.router.delete(this.path + "/:id", this.deleteShortDatum);
    }

    async getShortData(req, res, next) {

        //TODO: implement
        try {

            throw new Error('Testing');
            res.send("Hi Short")
        } catch (err) {

            next(err);
        }
    }

    async createShortData(req, res, next) {

        //TODO: implement
    }

    async getShortDatum(req, res, next) {

        //TODO: implement
    }

    async upsertShortDatum(req, res, next) {

        //TODO: implement
    }

    async deleteShortDatum(req, res, next) {

        //TODO: implement
    }
}