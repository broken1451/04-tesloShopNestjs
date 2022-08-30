import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res, UploadedFiles, ParseFilePipe } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { fileFilter } from './helpers/fileFilter.helper';
import multer, { diskStorage } from 'multer'
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService, private readonly confgService: ConfigService) { }


  @Get('/product/:imageName')
  findProductImage(@Param('imageName') imageName: string, @Res() res: Response) {
    // const upload = multer({ storage: storage }).
    const path = this.filesService.getStaticPRoductImage(imageName)
    return res.status(200).sendFile(path);
  }

  
  // multiple images
  @Post('/product')
  @UseInterceptors(FilesInterceptor('file', 20, {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/products', // raiz del proyecto
      filename: fileNamer
    })
  })) // file es el nombre de la propiedad q esta en postman 
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length == 0) {
      throw new BadRequestException('Make sure that the file is an image')
    }
    let secureUrls = [];
    files.forEach(file => {
      const fileReponse = {
        originalname: file.originalname,
        filename: file.filename,
      };
      secureUrls.push(fileReponse)
    });

    return { secureUrls: secureUrls.map(url => `${this.confgService.get('HOST_API')}/files/product/${url.filename}`) }
  }

  // single image
  // @Post('/product')
  // @UseInterceptors(FileInterceptor('file', {
  //   fileFilter: fileFilter,
  //   // limits: {fileSize:1000},
  //   storage: diskStorage({
  //     destination: './static/products', // raiz del proyecto
  //     filename: fileNamer
  //   })
  // })) // file es el nombre de la propiedad q esta en postman 
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   console.log({file});
  //   if (!file) {
  //     throw new BadRequestException('Make sure that the file is an image')
  //   }
  //   const secureUrl = `${this.confgService.get('HOST_API')}/files/product/${file.filename}`
  //   return { secureUrl }
  // }


}
