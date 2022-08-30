import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../entities/auth.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(private readonly reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    console.log("UserRoleGuard");
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())
    console.log("UserRoleGuard ===", validRoles);
    if (!validRoles) return true;
    if (validRoles.length == 0) return true;

    // const validRoles: string[] = this.reflector.getAllAndOverride<string[]>('roles', [
    //   context.getHandler(),
    //   context.getClass(),
    // ]);
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if (!user) {
      throw new BadRequestException('User not found')
    }
    console.log({ userRoles: user.roles });

    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(`User  ${user.fullName} needs a valid role: [${validRoles}]`)
  }
}
