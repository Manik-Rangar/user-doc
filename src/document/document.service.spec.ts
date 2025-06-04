import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getModelToken } from '@nestjs/sequelize';
import { Document } from '@jkt/models';
import { FilterDocumentDto, ResponseStatus } from '@jkt/dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from '@jkt/constants';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('DocumentService', () => {
  let service: DocumentService;
  let documentModel: typeof Document;

  const mockDocument = {
    id: 'test-doc-id',
    name: 'test.pdf',
    url: '/documents/test.pdf',
    mimetype: 'application/pdf',
    size: 1024,
    path: path.join(process.cwd(), 'shared', 'documents', 'test.pdf'),
    userId: 'test-user-id',
  };

  const mockUser = {
    id: 'test-user-id',
    name: 'Test User',
  };

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.pdf',
    encoding: '7bit',
    mimetype: 'application/pdf',
    size: 1024,
    destination: path.join(process.cwd(), 'shared', 'documents'),
    filename: 'test.pdf',
    path: path.join(process.cwd(), 'shared', 'documents', 'test.pdf'),
    buffer: Buffer.from('test'),
    stream: null as any,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getModelToken(Document),
          useValue: {
            create: jest.fn(),
            findByPk: jest.fn(),
            findAndCountAll: jest.fn(),
            destroy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentModel = module.get<typeof Document>(getModelToken(Document));
  });

  describe('upload', () => {
    it('should upload document successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'create')
        .mockResolvedValue(mockDocument as any);

      const result = await service.upload(mockUser, mockFile);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual({ id: mockDocument.id });
      expect(result.message).toBe(Response.DOCUMENT_UPLOADED_SUCCESSFULLY);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentModel.create).toHaveBeenCalledWith({
        name: mockFile.originalname,
        url: `/documents/${mockFile.filename}`,
        mimetype: mockFile.mimetype,
        size: mockFile.size,
        path: mockFile.path,
        userId: mockUser.id,
      });
    });

    it('should throw error if upload fails', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'create')
        .mockRejectedValue(new Error('Failed'));

      await expect(service.upload(mockUser, mockFile)).rejects.toThrow(
        new HttpException(
          'Failed to upload document',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getDocumentById', () => {
    it('should return document by id', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findByPk')
        .mockResolvedValue(mockDocument as any);

      const result = await service.getDocumentById('test-doc-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response).toEqual(mockDocument);
      expect(result.message).toBe(Response.DOCUMENT_FETCHED_SUCCESSFULLY);
    });

    it('should throw error if document not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(documentModel, 'findByPk').mockResolvedValue(null);

      await expect(service.getDocumentById('non-existent-id')).rejects.toThrow(
        new HttpException(Response.DOCUMENT_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('getDocuments', () => {
    const filterDto = new FilterDocumentDto();
    filterDto.page = 1;
    filterDto.limit = 10;
    filterDto.sortBy = 'createdAt';
    filterDto.sortOrder = 'DESC';
    filterDto.userId = 'test-user-id';

    it('should return paginated documents', async () => {
      const mockDocuments = {
        rows: [mockDocument],
        count: 1,
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findAndCountAll')
        .mockResolvedValue(mockDocuments as any);

      const result = await service.getDocuments(filterDto);

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.response?.data).toEqual(mockDocuments.rows);
      expect(result.response?.meta.count).toBe(mockDocuments.count);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentModel.findAndCountAll).toHaveBeenCalledWith({
        where: { userId: filterDto.userId },
        offset: 0,
        order: [[filterDto.sortBy, filterDto.sortOrder]],
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findByPk')
        .mockResolvedValue(mockDocument as any);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(documentModel, 'destroy').mockResolvedValue(1);

      const result = await service.deleteDocument('test-doc-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.message).toBe('Document deleted successfully');
      expect(fs.unlinkSync).toHaveBeenCalledWith(mockDocument.path);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentModel.destroy).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
      });
    });

    it('should throw error if document not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(documentModel, 'findByPk').mockResolvedValue(null);

      await expect(service.deleteDocument('non-existent-id')).rejects.toThrow(
        new HttpException(Response.DOCUMENT_NOT_FOUND, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw error if file path is invalid', async () => {
      const invalidDocument = {
        ...mockDocument,
        path: '/invalid/path/test.pdf',
      };

      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findByPk')
        .mockResolvedValue(invalidDocument as any);

      await expect(service.deleteDocument('test-doc-id')).rejects.toThrow(
        new HttpException('Invalid document path', HttpStatus.FORBIDDEN),
      );
    });

    it('should handle file not found during deletion', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findByPk')
        .mockResolvedValue(mockDocument as any);
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(documentModel, 'destroy').mockResolvedValue(1);

      const result = await service.deleteDocument('test-doc-id');

      expect(result.status).toBe(ResponseStatus.SUCCESS);
      expect(result.message).toBe('Document deleted successfully');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentModel.destroy).toHaveBeenCalledWith({
        where: { id: mockDocument.id },
      });
    });

    it('should throw error if file deletion fails', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findByPk')
        .mockResolvedValue(mockDocument as any);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to delete file');
      });

      await expect(service.deleteDocument('test-doc-id')).rejects.toThrow(
        new HttpException(
          'Failed to delete document',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
    });
  });

  describe('getDocumentMetadata', () => {
    it('should return document metadata', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest
        .spyOn(documentModel, 'findByPk')
        .mockResolvedValue(mockDocument as any);

      const result = await service.getDocumentMetadata('test-doc-id');

      expect(result).toEqual(mockDocument);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(documentModel.findByPk).toHaveBeenCalledWith('test-doc-id', {
        raw: true,
      });
    });

    it('should return null if document not found', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      jest.spyOn(documentModel, 'findByPk').mockResolvedValue(null);

      const result = await service.getDocumentMetadata('non-existent-id');

      expect(result).toBeNull();
    });
  });
});
