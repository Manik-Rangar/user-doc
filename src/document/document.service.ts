import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from '@jkt/models';
import {
  FilterDocumentDto,
  PageDto,
  PageMetaDto,
  ResponseWrapper,
} from '@jkt/dto';
import { ResponseStatus } from '@jkt/dto';
import { Response } from '@jkt/constants';
import { existsSync, unlinkSync } from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
  ) {}

  async upload(
    user: any,
    file: Express.Multer.File,
  ): Promise<ResponseWrapper<{ id: string }>> {
    try {
      const doc = await this.documentModel.create({
        name: file.originalname,
        url: `/documents/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        userId: user.id,
      });

      return new ResponseWrapper(
        ResponseStatus.SUCCESS,
        { id: doc.id },
        Response.DOCUMENT_UPLOADED_SUCCESSFULLY,
      );
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to upload document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDocumentById(id: string): Promise<ResponseWrapper<Document>> {
    const doc = await this.documentModel.findByPk(id);
    if (!doc) {
      throw new HttpException(
        Response.DOCUMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      doc,
      Response.DOCUMENT_FETCHED_SUCCESSFULLY,
    );
  }

  async getDocuments(
    data: FilterDocumentDto,
  ): Promise<ResponseWrapper<PageDto<Document>>> {
    const { limit, page, sortBy, sortOrder } = data;
    const offset = (page - 1) * limit;
    const conditions = {
      ...(data?.userId ? { userId: data.userId } : {}),
    };
    const { rows, count } = await this.documentModel.findAndCountAll({
      where: conditions,
      offset,
      order: [[sortBy, sortOrder]],
    });

    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      new PageDto(
        rows,
        new PageMetaDto({ count, pageOptions: { page, limit, skip: offset } }),
      ),
    );
  }

  async deleteDocument(id: string): Promise<ResponseWrapper<null>> {
    const doc = await this.documentModel.findByPk(id, { raw: true });
    if (!doc) {
      throw new HttpException(
        Response.DOCUMENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    // Security check - verify file path is within allowed directory
    const documentsDir = path.join(process.cwd(), 'shared', 'documents');
    const normalizedPath = path.normalize(doc.path);

    if (!normalizedPath.startsWith(documentsDir)) {
      throw new HttpException('Invalid document path', HttpStatus.FORBIDDEN);
    }

    try {
      // Attempt file deletion
      if (existsSync(normalizedPath)) {
        unlinkSync(normalizedPath);
        console.log(`Deleted file: ${normalizedPath}`);
      } else {
        console.log(`File not found at path: ${normalizedPath}`);
      }

      // Delete database record
      await this.documentModel.destroy({
        where: { id: doc.id },
      });

      return new ResponseWrapper(
        ResponseStatus.SUCCESS,
        null,
        'Document deleted successfully',
      );
    } catch (error) {
      console.log(
        `Failed to delete document ${id}: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        'Failed to delete document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidUUID(id: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  async getDocumentMetadata(id: string): Promise<Document | null> {
    return await this.documentModel.findByPk(id, { raw: true });
  }
}
