import { DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import * as express from 'express';

/**
 * Configuração do documento Swagger
 */
export const createSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('File Processor API')
    .setDescription('API para processamento e extração de dados de arquivos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
};

/**
 * Opções personalizadas para o UI do Swagger
 */
export const createSwaggerUIOptions = (port: number, host: string) => {
  return {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      filter: true,
      url: `http://${host}:${port}/api-json`,
      validatorUrl: null,
      docExpansion: 'list',
      syntaxHighlight: {
        activate: true,
        theme: 'agate',
      },
    },
    customSiteTitle: 'File Processor API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    // Não usar HTTPS
    customfavIcon: '/api/favicon-32x32.png',
    explorer: true,
  };
};

/**
 * Configura o Express para servir recursos do Swagger
 */
export const setupSwaggerAssets = (app: any) => {
  const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath();

  app.use('/api', (req, res, next) => {
    res.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';");
    next();
  }, express.static(swaggerUiAssetPath));
};
