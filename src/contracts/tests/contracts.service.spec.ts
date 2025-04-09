import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContractsService } from '../contracts.service';
import { Contract, StatusContrato } from '../entities/contract.entity';
import { FilesService } from '../../files/files.service';
import { ClientesService } from '../../clientes/clientes.service';
import { EmpresaService } from '../../empresa/empresa.service';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

const mockFilesService = {
  findOne: jest.fn(),
};

const mockClientesService = {
  findOne: jest.fn(),
};

const mockEmpresaService = {
  findOne: jest.fn(),
  findAll: jest.fn(),
};

describe('ContractsService', () => {
  let service: ContractsService;
  let contractRepository: Repository<Contract>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        {
          provide: getRepositoryToken(Contract),
          useFactory: mockRepository,
        },
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
        {
          provide: ClientesService,
          useValue: mockClientesService,
        },
        {
          provide: EmpresaService,
          useValue: mockEmpresaService,
        },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
    contractRepository = module.get(getRepositoryToken(Contract));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of contracts', async () => {
      const mockContracts = [{ id: '1', numeroContrato: 'CONT-2023-001' }];
      jest.spyOn(contractRepository, 'find').mockResolvedValue(mockContracts as any);

      const result = await service.findAll();
      expect(result).toEqual(mockContracts);
      expect(contractRepository.find).toHaveBeenCalledWith({
        relations: ['cliente', 'empresa', 'file'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single contract', async () => {
      const mockContract = { 
        id: '1', 
        numeroContrato: 'CONT-2023-001',
        status: StatusContrato.ATIVO 
      };
      jest.spyOn(contractRepository, 'findOne').mockResolvedValue(mockContract as any);

      const result = await service.findOne('1');
      expect(result).toEqual(mockContract);
      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cliente', 'empresa', 'file', 'itensContrato', 'itensContrato.equipamento', 'faturas', 'devolucoes'],
      });
    });

    it('should throw NotFoundException when contract is not found', async () => {
      jest.spyOn(contractRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cliente', 'empresa', 'file', 'itensContrato', 'itensContrato.equipamento', 'faturas', 'devolucoes'],
      });
    });
  });

  describe('create', () => {
    it('should successfully create a contract', async () => {
      const createDto = {
        numeroContrato: 'CONT-2023-001',
        dataInicio: '2023-01-01',
        dataFim: '2023-12-31',
        valorTotal: 10000,
        descricao: 'Contrato de teste',
        clienteId: '1',
        empresaId: '1',
        fileId: '1',
      };

      const mockCliente = { id: '1', razaoSocial: 'Cliente Teste' };
      const mockEmpresa = { id: '1', nome: 'Empresa Teste' };
      const mockFile = { id: '1', documentType: null };
      const mockCreatedContract = { ...createDto, cliente: mockCliente, empresa: mockEmpresa, file: mockFile };

      mockClientesService.findOne.mockResolvedValue(mockCliente);
      mockEmpresaService.findOne.mockResolvedValue(mockEmpresa);
      mockFilesService.findOne.mockResolvedValue(mockFile);
      
      jest.spyOn(contractRepository, 'create').mockReturnValue(mockCreatedContract as any);
      jest.spyOn(contractRepository, 'save').mockResolvedValue(mockCreatedContract as any);

      const result = await service.create(createDto as any);
      
      expect(result).toEqual(mockCreatedContract);
      expect(contractRepository.create).toHaveBeenCalled();
      expect(contractRepository.save).toHaveBeenCalled();
    });
  });

  // Você pode adicionar mais testes conforme necessário
});
