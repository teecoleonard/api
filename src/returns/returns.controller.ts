import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnDto } from './dto/update-return.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('devolucoes')
@Controller('devolucoes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo registro de devolução' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Registro de devolução criado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  create(@Body() createReturnDto: CreateReturnDto) {
    return this.returnsService.create(createReturnDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros de devolução' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de registros de devolução' })
  findAll() {
    return this.returnsService.findAll();
  }

  @Get('contrato/:id')
  @ApiOperation({ summary: 'Listar devoluções de um contrato específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de devoluções do contrato' })
  findByContrato(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.findByContrato(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de um registro de devolução específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do registro de devolução' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Registro de devolução não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um registro de devolução' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Registro de devolução atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Registro de devolução não encontrado' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateReturnDto: UpdateReturnDto) {
    return this.returnsService.update(id, updateReturnDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um registro de devolução' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Registro de devolução removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Registro de devolução não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.returnsService.remove(id);
  }

  @Post('process-from-file')
  @ApiOperation({ summary: 'Criar devolução a partir de arquivo processado' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Devolução criada com sucesso' })
  @ApiQuery({ name: 'fileId', required: true, type: String })
  @ApiQuery({ name: 'contratoId', required: false, type: String })
  async createFromExtractedFile(
    @Query('fileId') fileId: string,
    @Query('contratoId') contratoId?: string
  ) {
    const fileData = await this.returnsService['filesService'].processFile(fileId);
    return this.returnsService.createFromExtractedData(fileData.extractedData, fileId, contratoId);
  }
}
