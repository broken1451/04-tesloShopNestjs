import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

    
    @ApiProperty({ default: 10, description: 'how many row do you need', required: false })
    @IsOptional()
    @IsPositive()
    @Type(() => Number) //enableImplicitConversion: true, transforma la data 
    limit: number;


    @ApiProperty({ default: 0, description: 'how many row do you want to skip', required: false })
    @IsOptional()
    @Min(0)
    @Type(() => Number) //enableImplicitConversion: true, transforma la data 
    offset: number;
}