import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    // Verificar se já existe cliente com o mesmo CNPJ
    const existingCliente = await this.clienteRepository.findOne({
      where: { cnpj: createClienteDto.cnpj }
    });

    if (existingCliente) {
      throw new ConflictException('Já existe um cliente com este CNPJ');
    }

    const cliente = this.clienteRepository.create(createClienteDto);
    return this.clienteRepository.save(cliente);
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find();
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ 
      where: { id },
      relations: ['contratos']
    });
    
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    
    return cliente;
  }

  async findOneByCnpj(cnpj: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { cnpj } });
    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado');
    }
    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    
    if (updateClienteDto.cnpj && updateClienteDto.cnpj !== cliente.cnpj) {
      const existingCliente = await this.clienteRepository.findOne({
        where: { cnpj: updateClienteDto.cnpj }
      });

      if (existingCliente) {
        throw new ConflictException('Já existe um cliente com este CNPJ');
      }
    }
    
    this.clienteRepository.merge(cliente, updateClienteDto);
    return this.clienteRepository.save(cliente);
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
  }
}
