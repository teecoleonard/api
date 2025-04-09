import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }
    
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    
    // Criar uma cópia do usuário sem a senha
    const { password, ...result } = user;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    // Remover senhas do resultado
    return users.map(user => {
      const { password, ...result } = user;
      return result as User;
    });
  }

  async findOneById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    // Não permitir alteração de email para um já existente
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateData.email }
      });
      
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }
    }
    
    this.usersRepository.merge(user, updateData);
    await this.usersRepository.save(user);
    
    // Criar uma cópia do usuário sem a senha
    const { password, ...result } = user;
    return result as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOneById(id);
    
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    
    await this.usersRepository.remove(user);
  }
}
