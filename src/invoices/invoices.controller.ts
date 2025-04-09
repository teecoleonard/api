import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('faturas')
@Controller('faturas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova fatura' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Fatura criada com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as faturas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de faturas' })
  findAll() {
    return this.invoicesService.findAll();
  }

  @Get('contrato/:id')
  @ApiOperation({ summary: 'Listar faturas de um contrato específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de faturas do contrato' })
  findByContrato(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findByContrato(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de uma fatura específica' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações da fatura' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Fatura não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de uma fatura' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Fatura atualizada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Fatura não encontrada' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma fatura' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Fatura removida com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Fatura não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoicesService.remove(id);
  }

  @Post('process-from-file')
  @ApiOperation({ summary: 'Criar fatura a partir de arquivo processado' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Fatura criada com sucesso' })
  @ApiQuery({ name: 'fileId', required: true, type: String })
  @ApiQuery({ name: 'contratoId', required: false, type: String })
  async createFromExtractedFile(
    @Query('fileId') fileId: string,
    @Query('contratoId') contratoId?: string
  ) {
    const fileData = await this.invoicesService['filesService'].processFile(fileId);
    return this.invoicesService.createFromExtractedData(fileData.extractedData, fileId, contratoId);
  }
}
