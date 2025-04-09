import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ContractsModule } from './contracts/contracts.module';
import { ReturnsModule } from './returns/returns.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { EmpresaModule } from './empresa/empresa.module';
import { ClientesModule } from './clientes/clientes.module';
import { EquipamentosModule } from './equipamentos/equipamentos.module';
import { ItemContratoModule } from './item-contrato/item-contrato.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env' 
    }),
    
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get<number>('RATE_LIMIT_WINDOW_MS', 60), // Tempo em segundos
        limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS', 100), // Limite de requisições
      }),
    }),
    
    TypeOrmModule.forRoot(typeOrmConfig),
    
    AuthModule,
    UsersModule,
    FilesModule,
    InvoicesModule,
    ContractsModule,
    ReturnsModule,
    EmpresaModule,
    ClientesModule,
    EquipamentosModule,
    ItemContratoModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
