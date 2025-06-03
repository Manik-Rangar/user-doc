import { IsOptional, IsString } from 'class-validator';

export const STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
};
export enum ResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

export class ResponseWrapper<T> {
  @IsString()
  status: ResponseStatus;

  @IsOptional()
  response?: T;

  @IsOptional()
  @IsString()
  message?: string;

  @IsString()
  timestamp: string;

  constructor(status: ResponseStatus, response?: T, message?: string) {
    this.status = status;
    this.response = response;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}
