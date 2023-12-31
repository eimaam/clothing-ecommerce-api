import { Response, Router } from "express";

export const route = Router()

// health check
route.get('/healthcheck', (_req, res:Response) => {
    res.status(200).json({ status: "ok", message: "Application is running..."})
})