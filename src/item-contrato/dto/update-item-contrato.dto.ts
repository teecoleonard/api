import { PartialType } from '@nestjs/swagger';
import { CreateItemContratoDto } from './create-item-contrato.dto';

export class UpdateItemContratoDto extends PartialType(CreateItemContratoDto) {}
