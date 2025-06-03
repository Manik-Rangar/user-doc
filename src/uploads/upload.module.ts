// upload.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export interface UploadModuleOptions {
  allowedExtensions?: string[];
  maxFileSize?: number;
}

@Module({})
export class UploadModule {
  static register(options: UploadModuleOptions = {}): DynamicModule {
    const uploadPath = join(process.cwd(), 'shared', 'documents');

    // Create directory if it doesn't exist
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    return {
      module: UploadModule,
      imports: [
        MulterModule.register({
          storage: diskStorage({
            destination: uploadPath,
            filename: (req, file, cb) => {
              const uniqueId =
                Date.now() + '-' + Math.round(Math.random() * 1e9);
              const ext = extname(file.originalname);
              cb(null, `${uniqueId}${ext}`);
            },
          }),
          fileFilter: (req, file, cb) => {
            const ext = extname(file.originalname).toLowerCase().substring(1);
            if (
              options.allowedExtensions &&
              !options.allowedExtensions.includes(ext)
            ) {
              return cb(
                new Error(
                  `Only ${options.allowedExtensions.join(', ')} files are allowed`,
                ),
                false,
              );
            }
            cb(null, true);
          },
          limits: {
            fileSize: options.maxFileSize || 300 * 1024 * 1024, // Default 300MB
          },
        }),
      ],
      exports: [MulterModule],
    };
  }
}
