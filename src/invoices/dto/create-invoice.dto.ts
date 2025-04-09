import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-do-contrato' })
  @IsNotEmpty()
  @IsUUID()
  contratoId: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  @IsString()
  invoiceNumber: string;

  @ApiProperty({ example: '2023-05-15' })
  @IsDateString()
  dataEmissao: string;

  @ApiProperty({ example: '2023-06-15' })
  @IsDateString()
  dataVencimento: string;

  @ApiProperty({ example: 1500.75 })
  @IsNumber()
  valorTotal: number;

  @ApiPropertyOptional({ example: 'Empresa XYZ' })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional({ example: 'Cliente ABC' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ example: '123.456.789-00' })
  @IsOptional()
  @IsString()
  customerDocument?: string;

  @ApiPropertyOptional({ example: 'Descrição da fatura' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ 
    example: [{ item: 'Produto 1', quantity: 2, price: 500.25 }]
  })
  @IsOptional()
  @IsObject()
  items?: any;

  @ApiProperty({ example: 'uuid-do-arquivo' })
  @IsNotEmpty()
  @IsString()
  fileId: string;
}
