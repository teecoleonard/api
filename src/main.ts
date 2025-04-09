import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Função para configurar diretórios necessários
function setupDirectories() {
  const uploadsDir = join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Função para configurar o Swagger
function setupSwagger(app, configService: ConfigService, port: number) {
  const config = new DocumentBuilder()
    .setTitle('File Processor API')
    .setDescription('API para processamento e extração de dados de arquivos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configuração adicional para evitar problemas de HTTPS
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
      validatorUrl: null, // Desabilitar validação que causa problemas SSL
    },
    explorer: true,
  };

  const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();
  app.use('/api-docs-assets', express.static(swaggerUiAssetPath));

  SwaggerModule.setup('api', app, document, customOptions);

  console.log(`Swagger disponível em: http://localhost:${port}/api`);
}

// Função para configurar CORS
function setupCors(app) {
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
  });
}

function logLocalIps(port: number) {
  const networkInterfaces = require('os').networkInterfaces();
  const localIps: string[] = [];

  for (const [, interfaces] of Object.entries(networkInterfaces)) {
    if (Array.isArray(interfaces)) {
      for (const iface of interfaces) {
        if (
          iface &&
          typeof iface === 'object' &&
          'family' in iface &&
          'internal' in iface &&
          'address' in iface &&
          iface.family === 'IPv4' &&
          !iface.internal
        ) {
          localIps.push(iface.address);
        }
      }
    }
  }

  if (localIps.length > 0) {
    console.log('Para acessar de outros dispositivos na mesma rede, use:');
    localIps.forEach((ip) => {
      console.log(`http://${ip}:${port}`);
      console.log(`Documentação da API: http://${ip}:${port}/api`);
    });
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  setupDirectories();

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );


  const windowMs = configService.get<number>('RATE_LIMIT_WINDOW_MS') || 15 * 60 * 1000;
  const max = configService.get<number>('RATE_LIMIT_MAX_REQUESTS') || 100;
  app.use(
    rateLimit({
      windowMs,
      max,
      message: 'Muitas requisições deste IP, por favor tente novamente mais tarde',
    }),
  );

  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      validateCustomDecorators: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((err) => {
          const constraints = err.constraints
            ? Object.values(err.constraints).join(', ')
            : 'Erro de validação';
          return `${err.property}: ${constraints}`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  // Configurar CORS
  setupCors(app);

  // Configurar Swagger
  const port = configService.get<number>('PORT') || 3000;
  setupSwagger(app, configService, port);

  // Servir arquivos estáticos
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Iniciar o servidor
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://localhost:${port}`);

  // Exibir IPs locais
  logLocalIps(port);
}

bootstrap();
