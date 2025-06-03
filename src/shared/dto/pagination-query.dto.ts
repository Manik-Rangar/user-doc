import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  MAX_PAGE_SIZE,
  PAGE_SIZE,
  SORT_ORDER,
  SORT_ORDER_LIST,
} from '@jkt/constants';

export class PaginationQueryDto {
  @ApiProperty({
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: PAGE_SIZE,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  @IsOptional()
  limit: number = PAGE_SIZE;

  @ApiProperty({
    default: 'createdAt',
  })
  @IsOptional()
  sortBy: string = 'createdAt';

  @ApiProperty({
    default: SORT_ORDER.DESC,
  })
  @IsOptional()
  @IsIn(SORT_ORDER_LIST)
  sortOrder: string = SORT_ORDER.DESC;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}
