import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ItemContratoService } from './item-contrato.service';
import { CreateItemContratoDto } from './dto/create-item-contrato.dto';
import { UpdateItemContratoDto } from './dto/update-item-contrato.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('itens-contrato')
@Controller('itens-contrato')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ItemContratoController {
  constructor(private readonly itemContratoService: ItemContratoService) {}

  @Post()
  @ApiOperation({ summary: 'Adicionar um item ao contrato' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Item adicionado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Contrato ou equipamento não encontrado' })
  create(@Body() createItemContratoDto: CreateItemContratoDto) {
    return this.itemContratoService.create(createItemContratoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os itens de contrato' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de itens' })
  findAll() {
    return this.itemContratoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de um item específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do item' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemContratoService.findOne(id);
  }

  @Get('contrato/:id')
  @ApiOperation({ summary: 'Listar todos os itens de um contrato específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de itens do contrato' })
  findByContrato(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemContratoService.findByContrato(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um item de contrato' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item não encontrado' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateItemContratoDto: UpdateItemContratoDto) {
    return this.itemContratoService.update(id, updateItemContratoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um item de contrato' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Item removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Item não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemContratoService.remove(id);
  }
}
