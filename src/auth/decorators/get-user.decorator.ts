import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";



export const GeTUser = createParamDecorator((data: string, ctx: ExecutionContext) => { // un decorador retorna una funcion q devuelve algo
    // ExecutionContext es el contexto el cual se esta ejecutando la funcion en este momento, es como se encuentra nest en este momento en la aplicacion
    // console.log({ data });
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
        throw new InternalServerErrorException(`User not found(req)`)
    }

    if (data) {
        return user.email
    }
    return user
    // return (!data) ? user : user[data]
});