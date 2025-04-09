import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemContratoController } from './item-contrato.controller';
import { ItemContratoService } from './item-contrato.service';
import { ItemContrato } from './entities/item-contrato.entity';
import { ContractsModule } from '../contracts/contracts.module';
import { EquipamentosModule } from '../equipamentos/equipamentos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemContrato]),
    ContractsModule,
    EquipamentosModule
  ],
  controllers: [ItemContratoController],
  providers: [ItemContratoService],
  exports: [ItemContratoService],
})
export class ItemContratoModule {}
