import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { IsCNPJ } from '../../common/validators/cnpj.validator';

export class CreateClienteDto {
  @ApiProperty({ example: 'Empresa Cliente LTDA' })
  @IsNotEmpty()
  @IsString()
  razaoSocial: string;

  @ApiProperty({ example: '12.345.678/0001-90' })
  @IsNotEmpty()
  @IsString()
  @IsCNPJ()
  cnpj: string;

  @ApiPropertyOptional({ example: '123456789' })
  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @ApiProperty({ example: 'Av. Cliente, 1000' })
  @IsNotEmpty()
  @IsString()
  endereco: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsNotEmpty()
  @IsString()
  telefone: string;
}
