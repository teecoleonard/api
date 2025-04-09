import { IsString, IsNumber, IsInt } from 'class-validator';

export class CreateEquipamentoTesteDto {
  @IsString()
  descricao: string;

  @IsString()
  codigo: string;

  @IsInt()
  quantidade: number;

  @IsNumber()
  precoDiaria: number;

  @IsNumber()
  precoSemanal: number;

  @IsNumber()
  precoQuinzenal: number;

  @IsNumber()
  precoMensal: number;
}
