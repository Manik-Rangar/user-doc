import {
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
  UploadedFile,
  Delete,
  UseGuards,
  Query,
  Res,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from '@jkt/constants';

import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard, PermissionsGuard } from '@jkt/guards';
import {
  FilterDocumentDto,
  PageDto,
  ResponseStatus,
  ResponseWrapper,
} from '@jkt/dto';
import { Document } from '@jkt/models';
import { user } from '@jkt/nest-utils';
import { ModuleType } from '@jkt/enums';
import { Permissions } from '@jkt/nest-utils';
import { Response as ResponseExpress } from 'express';
import { createReadStream, existsSync } from 'fs';
import * as path from 'path';
@UseGuards(PermissionsGuard)
@UseGuards(AdminGuard)
@Controller('documents')
@Permissions(ModuleType.DOCUMENT)
@ApiBearerAuth('token')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload a document file',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG',
        },
      },
    },
  })
  async uploadDocument(
    @user() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentService.upload(user, file);
  }

  @Get('')
  async getDocuments(
    @Query() query: FilterDocumentDto,
  ): Promise<ResponseWrapper<PageDto<Document>>> {
    return this.documentService.getDocuments(query);
  }

  @Get('image/:id')
  async getDocumentPhoto(
    @Param('id') id: string,
    @Res() res: ResponseExpress,
  ): Promise<void> {
    try {
      const doc = await this.documentService.getDocumentMetadata(id);
      if (!doc) {
        throw new HttpException(
          Response.DOCUMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      // Security check - verify file path is within allowed directory
      const safePath = path
        .normalize(doc.path)
        .replace(/^(\.\.(\/|\\|$))+/, '');
      const documentsDir = path.join(process.cwd(), 'shared', 'documents');

      if (!safePath.startsWith(documentsDir)) {
        throw new HttpException('Invalid document path', HttpStatus.FORBIDDEN);
      }

      if (!existsSync(safePath)) {
        throw new HttpException(
          Response.DOCUMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      // Set headers
      res.set({
        'Content-Type': doc.mimetype,
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.name)}"`,
        'Content-Length': doc.size.toString(),
        'Cache-Control': 'private, max-age=3600', // 1 hour cache
      });

      // Stream the file with proper error handling
      const fileStream = createReadStream(safePath);

      fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
        }
      });

      fileStream.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Document download error:', error);
      throw new HttpException(
        'Failed to retrieve document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async getDocument(
    @Param('id') id: string,
  ): Promise<ResponseWrapper<Document>> {
    try {
      const doc = await this.documentService.getDocumentMetadata(id);
      if (!doc) {
        throw new HttpException(
          Response.DOCUMENT_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }

      return new ResponseWrapper(ResponseStatus.SUCCESS, doc);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to retrieve document',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteDocument(
    @Param('id') documentId: string,
  ): Promise<ResponseWrapper<null>> {
    return this.documentService.deleteDocument(documentId);
  }
}
