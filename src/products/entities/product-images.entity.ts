import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';


@Entity({
    name: 'product_images'
})
export class ProductImage {

    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({type: 'text',nullable: true})
    url: string

    @ManyToOne(
        () => Product,
        (product) => product.images,
        { onDelete: 'CASCADE' }// cuando el producto se elimina que quiero q suceda aca, opcion de borrar en cascada 'CASCADE'
    )
    product: Product
}
