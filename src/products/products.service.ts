import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class ProductsService {


  private readonly logger = new Logger('ProductsService')

  // El DataSource sabe la cadena de  conexion a la base de datos q estoy utilizando, sabe q usuario de base de datos uso, tiene la misma configuracion que nuestro repositorio
  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly producImagetRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) { }

  async create(createProductDto: CreateProductDto, user: User) {
    // console.log(user);
    try {
      // if (!createProductDto.slug) {
      //   createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')
      // } else {
      //   createProductDto.slug = createProductDto.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '')
      // }
      const { images = [], ...restProductProperties } = createProductDto
      const product = this.productRepository.create({
        ...restProductProperties,
        images: images.map((image) => this.producImagetRepository.create({ url: image })),
        user
      });
      await this.productRepository.save(product)
      // return product; //retun with id de la bd
      return { ...product, images };
    } catch (error) {
      this.handleException(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto
      // pagination
      const products = await this.productRepository.find({
        take: limit, // toma la cantidad q estoy especificando en el limite 
        skip: offset, // saltate todo lo q me diga mi offset
        // Relaciones
        relations: {
          images: true, // hace referencia a la relacion campo images 
          user: true
        }
      });
      // return products; //with images id
      return products.map((product) => {
        return {
          ...product,
          images: product.images.map(img => img.url)
        }
      });
    } catch (error) {
      this.handleException(error)
    }

  }

  async findOne(term: string): Promise<any> {
    try {
      // const product = await this.productRepository.findOneBy({
      //   id: id
      // });
      // if (!product) {
      //   const message = new NotFoundException(`The product with el id ${id} does not exists`);
      //   return message.getResponse();
      // }

      // with array
      // const product = await this.productRepository.find({
      //   where: {
      //     id: id
      //   }
      // });
      // if (product.length == 0) {
      //   const message = new NotFoundException(`The product with el id ${id} does not exists`);
      //   return message.getResponse()
      // }
      // with array
      let product: Product;
      if (isUUID(term)) {
        // product = await this.productRepository.findOne({ where: { id: term }, relations: {images: true} });
        product = await this.productRepository.findOneBy({ id: term });
      } else {
        // product = await this.productRepository.findOneBy({
        //   slug: term
        // });
        // const queryBuilder = this.productRepository.createQueryBuilder('alias);
        const queryBuilder = this.productRepository.createQueryBuilder('product');
        product = await queryBuilder.where(`UPPER(title)=:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
          // .leftJoinAndSelect('tableName.relation','alias')
          .leftJoinAndSelect('product.images', 'productImages')
          .getOne();  // `select * from Products where slug='xx' or tittle='cdcd'`
      }

      if (!product) {
        const message = new NotFoundException(`The product with ${term} does not exists`);
        return message.getResponse();
      }

      // return {...product,images: product.images.map(img=>img.url)};
      return product;
    } catch (error) {

    }
  }

  async findOnePlaiin(term: string) {
    const { images = [], ...restProductProperties } = await this.findOne(term)

    return { ...restProductProperties, images: images.map((img: ProductImage) => img.url) };

  }


  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    // Create query Runner
    /*
      transaccion una serie de querys q pueden impactar la base de datos(actualizar, eliminar, insertar, etc) pero hasta q le digamos explicitamente si quiero hacer el commit de esta transaccion
      que puede involucrar monton de querys hasta q hagamos commit literalmente se va a impactar la base de datos fisicamente, si nunca llamamos el commit entonces se puede quedar
      ocupado por un cierto tiempo hasta q bote esa conexion, cada vez que usemos una transaccion tenemos que asegurarnos de
      1) Hacer el commit de la transaccion o el rollBack de la transaccion y tambn liberar el queryrunner para decirle ok ya desechalo porqie si no mantiene esa conexion en el queryrunner
    */
    const queryRunner = this.dataSource.createQueryRunner();
    try {

      const { images, ...rest } = updateProductDto


      // le digo a typeORM buscate un producto por el id y adicionalmente carga todas las propiedades que esten en el updateProductDto
      // va a buscar en la base de datos por este id o un objeto q luzca de esta manera
      let product = await this.productRepository.preload({
        id,
        ...rest
      });

      if (!product) {
        // throw new NotFoundException(`Product with id ${ id } not found`)
        const message = new NotFoundException(`The product with ID ${id} does not exists`);
        return message.getResponse();
      }

      await queryRunner.connect(); // conexion a la bd para realizar la transaccion
      await queryRunner.startTransaction(); // iniciar la transaccion

      if (images) {
        // await queryRunner.manager.delete(tabla/entidad a afectar, 'criterio de borrado')
        //  const imgsBD = await queryRunner.manager.delete(ProductImage,{productImage}) // el criterio todas las imagenes, en esas imagenes en este productImage en la columna de product el id q va ser alli va a ser el igual al id del parametro
        const imgsBD = await queryRunner.manager.delete(ProductImage, { product: { id } }); // Voy a borrar todas las ProductImage cuya columna productId sea igual al id del parametro
        // delete * from ProductImage
        console.log(imgsBD);
        product.images = images.map(img => this.producImagetRepository.create({ url: img })); // aun no impactla la bd
        // await queryRunner.manager.save(product) // con consulta a la bd
      } else {
        // con consulta a la bd
        // product.images = await this.producImagetRepository.findBy({ product: { id } });
        // // // product.images 
        // const imgUrl: ProductImage[] | string[] | any = product.images.map(img => img.url)
        // product.images = imgUrl;
        // console.log(product.images);
      }
      
      product.user = user;
      await queryRunner.manager.save(product)

      // const productUpdated = await this.productRepository.save(product)
      await queryRunner.commitTransaction();
      await queryRunner.release(); // cierra la conexion

      // return product
      return this.findOnePlaiin(id) // una opcion
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release(); // cierra la conexion
      this.handleException(error)
    }

  }

  async remove(id: string) {
    try {

      // with array
      // const product: Product = await this.findOne(id);
      // if (!product[0]) {
      //   console.log('here', { product });
      //   console.log(product[0]);
      //   return product;
      // }
      // await this.productRepository.delete({
      //   id: product[0].id
      // });
      // with array

      const product: Product = await this.findOne(id);
      // console.log({product});
      await this.productRepository.delete({
        id: product.id
      })

      // const product: Product = await this.findOne(id)  
      // if (!product.id) {
      //   return product;
      // }
      // await this.productRepository.remove(product)

      return product;
    } catch (error) {
      console.log({ error });
      this.handleException(error)
    }
  }

  async deleteAllProduct() {
    try {
      // select * from 
      const query = await this.productRepository.createQueryBuilder('product')
        .delete() // borrar 
        .where({}) // todo, donde {} es todo *
        .execute() // ejecuta la query
      return query
    } catch (error) {
      this.handleException(error)
    }
  }


  private handleException(error: any) {
    if (error.code == '23505') {
      throw new BadRequestException(`${error.detail}`);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(`Unexpected error, check server logs`);
  }

}
