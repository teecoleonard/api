import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('clientes')
@Controller('clientes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo cliente' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Cliente criado com sucesso' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Já existe um cliente com este CNPJ' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de clientes' })
  findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de um cliente específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do cliente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Get('cnpj/:cnpj')
  @ApiOperation({ summary: 'Buscar cliente por CNPJ' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do cliente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente não encontrado' })
  findOneByCnpj(@Param('cnpj') cnpj: string) {
    return this.clientesService.findOneByCnpj(cnpj);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados de um cliente' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Cliente atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente não encontrado' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Já existe um cliente com este CNPJ' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um cliente' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Cliente removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Cliente não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }
}
