import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';

@ApiTags('empresas')
@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Criar uma nova empresa' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Empresa criada com sucesso' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.create(createEmpresaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as empresas' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de empresas' })
  findAll() {
    return this.empresaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter informações de uma empresa específica' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Informações da empresa' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Empresa não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresaService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Atualizar dados de uma empresa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Empresa atualizada com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Empresa não encontrada' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma empresa' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Empresa removida com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Empresa não encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresaService.remove(id);
  }
}
