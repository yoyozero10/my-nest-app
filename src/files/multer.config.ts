import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
            const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
            callback(null, uniqueName);
        },
    }),
    limits: {
        fileSize: 1024 * 1024, // 1MB
    },
    fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
    },
};
