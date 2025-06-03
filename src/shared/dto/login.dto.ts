import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

const MIN_PASSWORD = 6;
export class LoginRequestDto {
  @ApiProperty({ required: true, example: 'default@imp.com' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @ApiProperty({ required: true, example: '123456' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(MIN_PASSWORD, {
    message: `Password must be at least '${MIN_PASSWORD} characters long.`,
  })
  password: string;
}

export class RequestForgotPasswordDto {
  @ApiProperty({ description: 'Email address' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(MIN_PASSWORD, {
    message: `Password must be at least '${MIN_PASSWORD} characters long.`,
  })
  password: string;

  @ApiProperty({ required: true })
  @IsString()
  token: string;
}
