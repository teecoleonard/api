import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber, IsObject, IsUUID } from 'class-validator';

export class CreateReturnDto {
  @ApiProperty({ example: 'uuid-do-contrato' })
  @IsNotEmpty()
  @IsUUID()
  contratoId: string;

  @ApiProperty({ example: 'DEV-2023-001' })
  @IsNotEmpty()
  @IsString()
  returnNumber: string;

  @ApiProperty({ example: '2023-06-15' })
  @IsDateString()
  dataDevolucao: string;

  @ApiPropertyOptional({ example: 'Cliente ABC' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  customerDocument?: string;

  @ApiPropertyOptional({ example: 'Fim do período de locação' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 'Nome do Responsável' })
  @IsNotEmpty()
  @IsString()
  responsavelRecebimento: string;

  @ApiPropertyOptional({ 
    example: [{ item: 'Betoneira 400L', quantidade: 1, condicao: 'Bom estado' }]
  })
  @IsOptional()
  @IsObject()
  items?: any;

  @ApiPropertyOptional({ example: 500.25 })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiPropertyOptional({ example: 'Equipamentos devolvidos em bom estado' })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ example: 'uuid-do-arquivo' })
  @IsNotEmpty()
  @IsString()
  fileId: string;
}
