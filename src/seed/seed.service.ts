import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';


@Injectable()
export class SeedService {

  constructor(private readonly productService: ProductsService, @InjectRepository(User) private readonly userRepository: Repository<User>) { }

  async runSeed() {
    await this.deleteTable();

    const user = await this.insertUser();

    await this.insertNewProducts(user);
    return "SEED EXECUTED"
  }

  private async insertUser() {
    const seedUser = initialData.users;
    
    const users: User[] = [];
    seedUser.forEach(user => {
      users.push(this.userRepository.create(user));
    });

    const userDb = await this.userRepository.save(seedUser)
    return userDb[0];

  }

  private async deleteTable() {

    await this.productService.deleteAllProduct();
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete()
      .where({})
      .execute();
  }


  private async insertNewProducts(user: User) {
    this.productService.deleteAllProduct();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user))
    });

    const resp = await Promise.all(insertPromises)
    return true;
  }
}
