import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Esse documento é um exemplo de implementação de um guardião JWT no NestJS.
// Ele utiliza o Passport para autenticação e validação de tokens JWT.