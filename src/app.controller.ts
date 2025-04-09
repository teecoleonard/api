import { Controller, Get, Redirect } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Redirect('/api', 301)
  redirectToSwagger() {
    return { url: '/api' };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      appName: 'file-processor-api',
      environment: process.env.NODE_ENV || 'development'
    };
  }
}
