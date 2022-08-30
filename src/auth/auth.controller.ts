import { Controller, Get, Post, Body, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IncomingHttpHeaders } from 'http';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { RawHeaders } from './decorators/get-rawHeaders.decorator';
import { GeTUser } from './decorators/get-user.decorator';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/auth.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/validRoles';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }


  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('/check-status')
  @Auth()
  checkAuthStatus(@GeTUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('/private')
  // @UseGuards(AuthGuard('estrategia q definimos por defecto'))
  @UseGuards(AuthGuard('jwt'))
  // testRpivateRoute(@GeTUser('nombre') user: User) {
  // testRpivateRoute(@GeTUser(['nombre', 'roles', 'fullName']) user: User) {
  testPivateRoute(
    @GeTUser() user: User, // decorador de propiedad
    @GeTUser('email') userEmail: string,
    @Req() req: Express.Request,
    @RawHeaders() rawHeaders: string[], // decorador de propiedad
    @Headers() headers: IncomingHttpHeaders) {
    // testPivateRoute(@Req() req: Express.Request) {
    // console.log({req});
    return {
      ok: true,
      user,
      userEmail,
      rawHeaders,
      headers
    }
  }


  // @SetMetadata('roles',['admin','super-user']) // agregar informacion extra al metodo, controlador que quiero ejecutar 
  @Get('/private2')
  // @RoleProtected() cualquier persona puede ver el servicio
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser, ValidRoles.user)
  @UseGuards(AuthGuard('jwt'), UserRoleGuard) // (autenticacion , autorizacion)
  testPivateRoute2(@GeTUser() user: User) {
    return {
      ok: true,
      user
    }
  }

  @Get('/private3')
  @ApiBearerAuth('JWT-auth')
  // @Auth(ValidRoles.admin, ValidRoles.superUser)
  @Auth() // con cualquier usuario q este en bd y con cualquier rol q tenga 
  testPivateRoute3(@GeTUser() user: User) {
    return {
      ok: true,
      user
    }
  }

}
