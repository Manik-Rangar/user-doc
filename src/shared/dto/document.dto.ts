import { PaginationQueryDto } from './pagination-query.dto';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FilterDocumentDto extends PaginationQueryDto {
  @ApiProperty({ description: 'User ID (UUID)', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
