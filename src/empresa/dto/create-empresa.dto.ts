import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateEmpresaDto {
  @ApiProperty({ example: 'ALG LOCAÇÕES DE EQUIPAMENTOS' })
  @IsNotEmpty()
  @IsString()
  nome: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsNotEmpty()
  @IsString()
  cnpj: string;

  @ApiProperty({ example: 'Rua das Empresas, 123' })
  @IsNotEmpty()
  @IsString()
  endereco: string;

  @ApiProperty({ example: '(11) 1234-5678' })
  @IsNotEmpty()
  @IsString()
  telefone: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  pix?: string;

  @ApiProperty({ example: 'Nome do Responsável' })
  @IsNotEmpty()
  @IsString()
  responsavel: string;
}
