import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private readonly jwtService: JwtService) { }


  async create(createAuthDto: CreateUserDto) {
    try {

      const { password, ...restData } = createAuthDto
      const saltOrRounds = 10;

      const user = this.userRepository.create({
        ...restData,
        password: bcrypt.hashSync(password, saltOrRounds)
      });
      await this.userRepository.save(user);
      delete user.password;
      return { ...user, token: this.getJWT({ id: user.id }) }

    } catch (error) {
      this.handleDBError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {

      const { password, email } = loginUserDto;
      // const user = await this.userRepository.findOneBy({email})
      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true, id: true } //Specifies what columns/campos en la bd should be retrieved/recividos.
      });
      if (!user) {
        throw new UnauthorizedException();
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException();
      }

      // TODO retornar jwt
      // const tokenNew = await this.checkAuthStatus(user)
      return { ...user, token: this.getJWT({ id: user.id}) }
    } catch (error) {
      this.handleDBError(error)
    }
  }

  async checkAuthStatus(user: User) {
    const { email} = user
    // const userDb = await this.userRepository.findOne({
    //   where: { id: user.id },
    //   select: { email: true, password: true, id: true, fullName: true } //Specifies what columns/campos en la bd should be retrieved/recividos.
    // });
    // const token = this.getJWT({ id: user.id })
    // return { ...userDb, token}
    const token = this.getJWT({id: user.id})
    return { ...user, token}
  }





  private handleDBError(error: any): never { // never jamas regresara algo esta funcion 
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.response.statusCode == 401) {
      throw new UnauthorizedException('Credential are not valid (email) or (password)');
    }
    throw new InternalServerErrorException('Check server logs');
  }



  private getJWT(payload: JwtPayload): string {
    const token = this.jwtService.sign(payload)
    return token
  }
}
