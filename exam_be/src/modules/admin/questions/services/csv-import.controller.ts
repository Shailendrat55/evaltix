import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileFilterCallback
    ) => {
        const ok =
            ["text/csv", "application/vnd.ms-excel"].includes(file.mimetype) ||
            file.originalname.toLowerCase().endsWith(".csv");

        if (!ok) {
            return cb(new Error("Only .csv files are allowed"));
        }
        cb(null, true);
    },
});