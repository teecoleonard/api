import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { StatusContrato } from '../entities/contract.entity';
import { IsDateAfter } from '../../common/validators/date-range.validator';

export class CreateContractDto {
  @ApiProperty({ example: 'CONT-2023-001' })
  @IsNotEmpty()
  @IsString()
  numeroContrato: string;

  @ApiProperty({ example: 'uuid-do-cliente' })
  @IsNotEmpty()
  @IsUUID()
  clienteId: string;

  @ApiProperty({ example: 'uuid-da-empresa' })
  @IsNotEmpty()
  @IsUUID()
  empresaId: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsDateString()
  dataInicio: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  @IsDateAfter('dataInicio', { message: 'A data de fim deve ser posterior à data de início' })
  dataFim?: string;

  @ApiProperty({ example: 10000.50 })
  @IsNumber()
  @Min(0)
  valorTotal: number;

  @ApiPropertyOptional({ enum: StatusContrato, example: StatusContrato.ATIVO })
  @IsOptional()
  @IsEnum(StatusContrato)
  status?: StatusContrato;

  @ApiProperty({ example: 'Contrato de locação de equipamentos' })
  @IsNotEmpty()
  @IsString()
  descricao: string;

  @ApiPropertyOptional({ example: 'uuid-do-arquivo' })
  @IsOptional()
  @IsString()
  fileId?: string;
}
