import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested, ArrayMinSize } from 'class-validator';
import { CreateEquipamentoDto } from './create-equipamento.dto';

export class CreateEquipamentosLoteDto {
  @ApiProperty({
    type: [CreateEquipamentoDto],
    description: 'Lista de equipamentos para cadastro em lote',
    example: [
      {
        descricao: 'Betoneira 400L',
        codigo: 'BET001',
        quantidade: 5,
        precoDiaria: 100.00,
        precoSemanal: 500.00,
        precoQuinzenal: 900.00,
        precoMensal: 1500.00
      },
      {
        descricao: 'Andaime 1m²',
        codigo: 'AND001',
        quantidade: 20,
        precoDiaria: 50.00,
        precoSemanal: 250.00,
        precoQuinzenal: 450.00,
        precoMensal: 800.00
      }
    ]
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'Envie pelo menos um equipamento' })
  @ValidateNested({ each: true })
  @Type(() => CreateEquipamentoDto)
  equipamentos: CreateEquipamentoDto[];
}
