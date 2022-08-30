import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity({
    name: 'users'
}) // cambiar el nombre de la tabla
export class User { 

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', { unique: true })
    email: string;

    @Column('text', {
        select: false // Indicates if column is always selected by QueryBuilder and find operations. Default value is "true".
    })
    password: string;

    @Column('text')
    fullName: string;

    @Column('bool', { default: true })
    isActive: boolean;

    @Column({ type: 'text', array: true, default: ['user'] })
    roles: string[];

    @OneToMany(
        () => Product,
        (product) => product.user
    )
    product: Product

    @BeforeInsert()
    checkFieldsbeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsbeforeUpdate() {
        this.checkFieldsbeforeInsert();
    }

}
