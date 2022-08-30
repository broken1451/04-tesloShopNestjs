import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const RawHeaders = createParamDecorator((data: string, ctx: ExecutionContext) => { // un decorador retorna una funcion q devuelve algo
    // ExecutionContext es el contexto el cual se esta ejecutando la funcion en este momento, es como se encuentra nest en este momento en la aplicacion
    // console.log({ data });
    const req = ctx.switchToHttp().getRequest().rawHeaders;
    return req
});