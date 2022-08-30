import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),// crea la tabla en la bd 
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService ) => { // se inyecta el servicio como en cualquier constructor o cualquier clases, solo q aca es una funcion 
        // console.log('process.env.JWT_SECRET ', process.env.JWT_SECRET);
        // console.log('configServiceT ', configService.get('JWT_SECRET'));
        return {
          // secret: process.env.JWT_SECRET,
          secret: configService.get('JWT_SECRET') || '',
          signOptions: {
            expiresIn: '4h'
          }
        }
      } // es la funcion que voy a mandar a llamar cuando se intente registrar de manera asincrono el modulo 
    })
    // JwtModule.register({
      // secret: process.env.JWT_SECRET,
      // signOptions: {
      //   expiresIn: '4h' 
      // }
    // })
  ],
  exports: [TypeOrmModule, ConfigModule, JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule {}
