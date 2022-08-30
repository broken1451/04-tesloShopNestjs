// tabla

import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { setSlug } from "src/common/utils/slug.util";
import { ProductImage } from './product-images.entity';
import { User } from '../../auth/entities/auth.entity';
import { ApiProperty } from "@nestjs/swagger";


@Entity({
    name: 'products'
}) // cambiar el nombre de la tabla
export class Product {

    @ApiProperty({ example: '500e9e61-04f7-45bf-94cb-2b31340beda7', description: 'Product Id', uniqueItems: true })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'T-shit', description: 'Product Title', uniqueItems: true })
    @Column('text', { unique: true })
    title: string;

    @ApiProperty({ example: 0, description: 'Product price', uniqueItems: false })
    @Column('float', { default: 0 })
    price: number

    @ApiProperty({ example: 'lorem ipsum', description: 'Product Description', uniqueItems: false, default: null })
    @Column({
        type: 'text',
        nullable: true, // puede aceptar null
    })
    description: string

    @ApiProperty({ example: 'adrians_shirt2', description: 'Product slug for SEO', uniqueItems: true })
    @Column({ unique: true, type: 'text' })
    slug: string

    @ApiProperty({ example: 10, description: 'Product stock', uniqueItems: false, default: 0 })
    @Column({ type: 'int', default: 0 })
    stock: number

    @ApiProperty({ example: ["SM", "M", "L"], description: 'Product sizes', uniqueItems: false })
    @Column({ type: 'text', array: true, default: [] })
    sizes: string[]

    @ApiProperty({ example: ['men', 'women', 'kid', 'unisex'], description: 'Product gender', uniqueItems: false })
    @Column({ type: 'text' })
    gender: string

    @ApiProperty({ example: ['shirt', 'polar'], description: 'Product tags', uniqueItems: false })
    @Column({ type: 'text', array: true, default: [] })
    tags: string[]


    // Relaciones, relacionar imagenes con la tabla de imagenes
    // eager cada vez q usemos un metodo find para cargar un producto automaticamente va a cargar  la imagenes
    @ApiProperty({ example: ['"http://imagen4.jpg"', "http://imagen5.jpg"], description: 'Product sizes', uniqueItems: false })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true } // nos ayuda si hacemos alguna operacion por ejem: eliminamos un product elimina todas las images asociadas a ese producto
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }

    )
    user: User

    // antes de insertar en la bd
    @BeforeInsert()
    checkSlugInsert() {
        // if (!this.slug) {
        //     this.slug = this.title;
        // }
        // this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
        this.slug = setSlug(this.slug, this.title);
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        // if (!this.slug) {
        //     this.slug = this.title;
        // }
        // this.slug = this.slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
        this.slug = setSlug(this.slug, this.title);
    }
}

