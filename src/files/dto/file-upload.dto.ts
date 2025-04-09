import { ApiProperty } from '@nestjs/swagger';

export class FileUploadDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'Arquivo a ser processado (PDF, DOCX, XLSX ou XLS)' 
  })
  file: any;
}
