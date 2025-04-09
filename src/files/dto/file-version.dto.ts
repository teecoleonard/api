import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class FileVersionDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Nova versão do arquivo' 
  })
  file: any;
  
  @ApiPropertyOptional({ 
    example: 'Correção de valores', 
    description: 'Comentário sobre as alterações nesta versão' 
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
