import { Controller, Get, Post, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Request, BadRequestException, HttpStatus, HttpCode, ParseUUIDPipe, Body, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { FileUploadDto } from './dto/file-upload.dto';
import { FileVersionDto } from './dto/file-version.dto';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload de arquivo para processamento' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Arquivo enviado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Formato de arquivo não suportado' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }
    
    const savedFile = await this.filesService.create(file, req.user.id);
    
    return {
      id: savedFile.id,
      originalName: savedFile.originalName,
      filename: savedFile.filename,
      type: savedFile.type,
      size: savedFile.size,
      version: savedFile.currentVersion,
      uploadedAt: savedFile.createdAt,
    };
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Processar e extrair dados de um arquivo enviado' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Arquivo processado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Arquivo não encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Erro ao processar arquivo' })
  async processFile(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.processFile(id);
  }

  @Post(':id/versions')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Adicionar uma nova versão a um arquivo existente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileVersionDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Nova versão adicionada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Arquivo não encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Tipo de arquivo incompatível com a versão original' })
  async addVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() fileVersionDto: { comment?: string },
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }
    
    const updatedFile = await this.filesService.addVersion(
      id, 
      file, 
      req.user.id, 
      fileVersionDto.comment
    );
    
    return {
      id: updatedFile.id,
      originalName: updatedFile.originalName,
      filename: updatedFile.filename,
      type: updatedFile.type,
      size: updatedFile.size,
      version: updatedFile.currentVersion,
      updatedAt: updatedFile.updatedAt,
    };
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Listar todas as versões de um arquivo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de versões do arquivo' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Arquivo não encontrado' })
  async getVersions(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.getVersions(id);
  }

  @Get(':id/versions/:versionNumber')
  @ApiOperation({ summary: 'Obter uma versão específica de um arquivo' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações da versão do arquivo' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Versão do arquivo não encontrada' })
  async getVersion(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number
  ) {
    return this.filesService.getVersion(id, versionNumber);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os arquivos do usuário' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de arquivos' })
  async findAll(@Request() req) {
    return this.filesService.findAll(req.user.id);
  }

  @Get('all')
  @ApiOperation({ summary: 'Listar todos os arquivos (apenas admin)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de todos os arquivos' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Acesso negado' })
  async findAllAdmin(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new BadRequestException('Acesso restrito a administradores');
    }
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de um arquivo específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do arquivo' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Arquivo não encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filesService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um arquivo' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Arquivo removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Arquivo não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.filesService.remove(id);
  }
}
