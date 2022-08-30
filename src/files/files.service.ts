import { BadGatewayException, Injectable } from '@nestjs/common';
import { existsSync, unlink  } from 'fs';
import { join } from 'path';

@Injectable()
export class FilesService {

    getStaticPRoductImage(imageName: string) {
        // const path = join(__dirname,'ruta donde esta la imagen', nombre archivo a buscar)
        const path = join(__dirname, '../../static/products', imageName); // crear path fisico donde se encuentra la imagen en el servidor
        // if (existsSync(path)) {
        //     unlink(path, (err) => {
        //         if (err) {
        //             throw new BadGatewayException(`No product found with image ${imageName}`)
        //         }
        //     });
        // } else {
        //     throw new BadGatewayException(`No product found with image ${imageName}`)
        // }
        if (!existsSync) {
            throw new BadGatewayException(`No product found with image ${imageName}`)
        }
        return path;
        
    }

}
