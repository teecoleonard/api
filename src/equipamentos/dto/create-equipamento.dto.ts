import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, IsInt } from 'class-validator';

export class CreateEquipamentoDto {
  @ApiProperty({ example: 'Betoneira 400L' })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiProperty({ example: 'EQ001' })
  @IsNotEmpty()
  @IsString()
  codigo: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  quantidade: number;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  @Min(0)
  precoDiaria: number;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  precoSemanal: number;

  @ApiProperty({ example: 900.00 })
  @IsNumber()
  @Min(0)
  precoQuinzenal: number;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  precoMensal: number;
}
