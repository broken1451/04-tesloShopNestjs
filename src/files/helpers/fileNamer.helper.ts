import { Request } from "express";
import { v4 as uuid } from 'uuid';

// export const fileFilter = (res: Request, ) => {
export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {

    if (!file) {
        return callback(new Error('File is emty'), false);
    }
    const fileExtension = file.mimetype.split('/')[1]
    const filename = `${uuid()}.${fileExtension}`
    
    // callback(null, aceptamos el archivo); // ejecuta el callback
    // callback(null, 'nuevo nombre de la imagen');
    callback(null, filename);
}