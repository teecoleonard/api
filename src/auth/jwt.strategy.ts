import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'secret_key_change_in_production',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOneById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('Usuário está inativo');
    }
    
    return { 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role 
    };
  }
}


// Esse documento é um exemplo de implementação de uma estratégia JWT no NestJS.
// Ele utiliza o Passport para autenticação e validação de tokens JWT.
