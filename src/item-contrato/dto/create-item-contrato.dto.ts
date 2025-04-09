import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsDateString, IsOptional, Min } from 'class-validator';
import { PeriodoLocacao } from '../entities/item-contrato.entity';

export class CreateItemContratoDto {
  @ApiProperty({ example: 'uuid-do-contrato' })
  @IsNotEmpty()
  @IsString()
  contratoId: string;

  @ApiProperty({ example: 'uuid-do-equipamento' })
  @IsNotEmpty()
  @IsString()
  equipamentoId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty({ enum: PeriodoLocacao, example: PeriodoLocacao.SEMANAL })
  @IsEnum(PeriodoLocacao)
  periodoLocacao: PeriodoLocacao;

  @ApiProperty({ example: 500.00 })
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @ApiProperty({ example: '2023-05-15' })
  @IsDateString()
  dataRetirada: string;

  @ApiPropertyOptional({ example: '2023-05-22' })
  @IsOptional()
  @IsDateString()
  dataDevolucao?: string;
}
