// document.module.ts
import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Document } from '@jkt/models';
import { UploadModule } from 'src/uploads/upload.module';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
  imports: [
    SequelizeModule.forFeature([Document]),
    UploadModule.register({
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
      maxFileSize: 30 * 1024 * 1024, // 30MB
    }),
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
