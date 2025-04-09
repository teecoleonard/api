import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientesService } from '../clientes.service';
import { Cliente } from '../entities/cliente.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Mock do repositório TypeORM
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
  merge: jest.fn(),
});

describe('ClientesService', () => {
  let service: ClientesService;
  let clienteRepository: Repository<Cliente>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientesService,
        {
          provide: getRepositoryToken(Cliente),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ClientesService>(ClientesService);
    clienteRepository = module.get(getRepositoryToken(Cliente));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of clients', async () => {
      const mockClientes = [
        { id: '1', razaoSocial: 'Empresa 1', cnpj: '12345678901234' },
        { id: '2', razaoSocial: 'Empresa 2', cnpj: '56789012345678' },
      ];
      jest.spyOn(clienteRepository, 'find').mockResolvedValue(mockClientes as any);

      const result = await service.findAll();
      expect(result).toEqual(mockClientes);
      expect(clienteRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single client', async () => {
      const mockCliente = { 
        id: '1', 
        razaoSocial: 'Empresa Teste', 
        cnpj: '12345678901234' 
      };
      jest.spyOn(clienteRepository, 'findOne').mockResolvedValue(mockCliente as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCliente);
      expect(clienteRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['contratos']
      });
    });

    it('should throw NotFoundException when client is not found', async () => {
      jest.spyOn(clienteRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(clienteRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['contratos']
      });
    });
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const createDto = {
        razaoSocial: 'Nova Empresa',
        cnpj: '12345678901234',
        endereco: 'Endereço Teste',
        telefone: '(11) 1234-5678',
      };

      jest.spyOn(clienteRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(clienteRepository, 'create').mockReturnValue(createDto as any);
      jest.spyOn(clienteRepository, 'save').mockResolvedValue({ id: '1', ...createDto } as any);

      const result = await service.create(createDto as any);
      expect(result).toEqual({ id: '1', ...createDto });
      expect(clienteRepository.findOne).toHaveBeenCalledWith({ where: { cnpj: createDto.cnpj } });
      expect(clienteRepository.create).toHaveBeenCalledWith(createDto);
      expect(clienteRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException when CNPJ already exists', async () => {
      const createDto = {
        razaoSocial: 'Nova Empresa',
        cnpj: '12345678901234',
        endereco: 'Endereço Teste',
        telefone: '(11) 1234-5678',
      };

      const existingCliente = { ...createDto, id: '1' };
      jest.spyOn(clienteRepository, 'findOne').mockResolvedValue(existingCliente as any);

      await expect(service.create(createDto as any)).rejects.toThrow(ConflictException);
      expect(clienteRepository.findOne).toHaveBeenCalledWith({ where: { cnpj: createDto.cnpj } });
    });
  });

  // Você pode adicionar mais testes conforme necessário
});
