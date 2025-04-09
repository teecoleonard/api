import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { EquipamentosService } from './equipamentos.service';
import { CreateEquipamentoDto } from './dto/create-equipamento.dto';
import { UpdateEquipamentoDto } from './dto/update-equipamento.dto';
import { CreateEquipamentosLoteDto } from './dto/create-equipamentos-lote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

@ApiTags('equipamentos')
@Controller('equipamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EquipamentosController {
  constructor(private readonly equipamentosService: EquipamentosService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar um novo equipamento' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Equipamento criado com sucesso' })
  create(@Body() createEquipamentoDto: CreateEquipamentoDto) {
    return this.equipamentosService.create(createEquipamentoDto);
  }

  @Post('lote')
  @Roles('admin')
  @ApiOperation({ summary: 'Criar múltiplos equipamentos em lote' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Equipamentos criados com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  createBatch(@Body() createEquipamentosLoteDto: CreateEquipamentosLoteDto) {
    return this.equipamentosService.createMany(createEquipamentosLoteDto.equipamentos);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os equipamentos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de equipamentos' })
  findAll() {
    return this.equipamentosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de um equipamento específico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações do equipamento' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Equipamento não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipamentosService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar dados de um equipamento' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Equipamento atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Equipamento não encontrado' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateEquipamentoDto: UpdateEquipamentoDto) {
    return this.equipamentosService.update(id, updateEquipamentoDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um equipamento' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Equipamento removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Equipamento não encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.equipamentosService.remove(id);
  }

  @Post('teste')
  @ApiOperation({ summary: 'Criar equipamento (teste)' })
  criarTeste(@Body() dto: any) {
    console.log('Dados recebidos:', dto);
    return this.equipamentosService.create(dto);
  }
}
