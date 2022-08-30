import { IsString, MinLength, IsNumber, IsPositive, IsOptional, IsInt, IsArray, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateProductDto {

    @ApiProperty({ description: 'Product title(unique)', required: true, nullable: false, minLength: 1 })
    @IsString()
    @MinLength(1)
    title: string

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty()
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    slug?: string

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty()
    @IsString({ each: true }) // cada uno de los elementos  del arreglo  tiene q ser string
    @IsArray()
    sizes: string[];

    @ApiProperty()
    @IsString({ each: true }) // cada uno de los elementos  del arreglo  tiene q ser string
    @IsArray()
    @IsOptional()
    tags: string[];

    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;

    @ApiProperty()
    @IsString({ each: true }) // cada uno de los elementos  del arreglo  tiene q ser string
    @IsArray()
    @IsOptional()
    images?: string[];

}
