import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/auth.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private readonly configService: ConfigService) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }

    async validate(payload: JwtPayload): Promise<User> { // regresa una instancia de un usuario de la bd 
        // este metodo solo  se va a llamar  si el jwt no ha expirado y si la firma del jwt hace match con el payload
        
        const { id } = payload;

        // const userDb = await this.userRepository.findOne({ where: { email }})
        const userDb = await this.userRepository.findOneBy({ id });
        if (!userDb) {
            throw new UnauthorizedException('Token no valid');
        }
        
        // console.log({userDb});
        if (!userDb.isActive) {
            throw new UnauthorizedException('User is inactive. talk with an admin')
        }
        
        // console.log({ payload, userDb });
        // este userDb se agrega a la Request q hemos usado en todo lugar
        // Resquet.user
        // Resquet.header
        // y en la requets voy a tener acceso a todo el proceso del camino desde q entra, pasa por interceptores, por servicios, por controladores, en todo lado donde yo pueda tener acceso a la requet voy a tener acceso a userDb
        return userDb;
    }
}