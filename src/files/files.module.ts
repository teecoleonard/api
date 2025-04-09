import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { FileVersion } from './entities/file-version.entity';
import { PdfExtractor } from './extractors/pdf.extractor';
import { DocxExtractor } from './extractors/docx.extractor';
import { ExcelExtractor } from './extractors/excel.extractor';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promises as fsPromises } from 'fs';
import { FileValidator } from './validators/file.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, FileVersion]),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = join(__dirname, '..', '..', 'uploads');
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.docx', '.xlsx', '.xls'];
        const ext = extname(file.originalname).toLowerCase();
        
        // Verificar extensão
        if (!allowedExtensions.includes(ext)) {
          return cb(new Error(`Formato de arquivo não suportado. Formatos permitidos: ${allowedExtensions.join(', ')}`), false);
        }
        
        // Verificar tipo MIME
        const allowedMimeTypes = [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel'
        ];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(new Error(`Tipo MIME não suportado: ${file.mimetype}`), false);
        }
        
        cb(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService, PdfExtractor, DocxExtractor, ExcelExtractor, FileValidator],
  exports: [FilesService],
})
export class FilesModule {}
