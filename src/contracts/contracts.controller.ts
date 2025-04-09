import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe, Query } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('contratos')
@Controller('contratos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo contrato' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Contrato criado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os contratos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de contratos' })
  findAll() {
    return this.contractsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de um contrato específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do contrato' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contrato não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um contrato' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contrato atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contrato não encontrado' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um contrato' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Contrato removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contrato não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractsService.remove(id);
  }

  @Post('process-from-file')
  @ApiOperation({ summary: 'Criar contrato a partir de arquivo processado' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Contrato criado com sucesso' })
  @ApiQuery({ name: 'fileId', required: true, type: String })
  async createFromExtractedFile(@Query('fileId') fileId: string) {
    const fileData = await this.contractsService['filesService'].processFile(fileId);
    return this.contractsService.createFromExtractedData(fileData.extractedData, fileId);
  }
}
