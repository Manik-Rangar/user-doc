// import {
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus,
//   Inject,
// } from '@nestjs/common';
// import { HttpArgumentsHost } from '@nestjs/common/interfaces';
// import { BaseExceptionFilter } from '@nestjs/core';
// import { Request, Response } from 'express';
// import { LoggerService } from '@bukmuk/logger';

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// type TKeyVal = { [key: string]: any };

// type TValidationError = {
//   status: HttpStatus;
//   errors: Array<TKeyVal>;
// };

// @Catch()
// export class ExceptionFilter extends BaseExceptionFilter {
//   constructor(@Inject(LoggerService) private logger: LoggerService) {
//     super();
//   }

//   private validationError(errors: TKeyVal): TValidationError {
//     const _errors: Array<TKeyVal> = [];

//     Object.keys(errors).forEach((field: string) => {
//       const _error: TKeyVal = errors[field];
//       _errors.push({
//         [field]: _error.kind,
//       });
//     });

//     return {
//       status: HttpStatus.BAD_REQUEST,
//       errors: _errors,
//     };
//   }

//   private dupKey(info: TKeyVal) {
//     const errors: Array<TKeyVal> = [];

//     Object.keys(info).forEach((key: string) => {
//       errors.push({
//         [key]: `${info[key]} already exists.`,
//       });
//     });

//     return errors;
//   }

//   catch(exception, host: ArgumentsHost) {
//     if (!exception) {
//       return;
//     }
//     const name: string = exception.constructor.name;

//     const ctx: HttpArgumentsHost = host.switchToHttp();

//     const res: Response = ctx.getResponse<Response>(),
//       req: Request = ctx.getRequest<Request>();

//     const requestPayload = {
//       requestMethod: req.method,
//       requestUrl: req.url,
//       status: req.statusCode,
//       userAgent: req.headers['user-agent'],
//       remoteIp: req.socket.remoteAddress,
//       serverIp: req.socket.localAddress,
//       referer: req.headers['referer'],
//       trace: req.headers['X-Cloud-Trace-Context'],
//       body: {
//         req: req.body,
//         res: {},
//       },
//     };

//     this.logger.error(exception.message, exception.stack, requestPayload);

//     if (name === 'ValidationError') {
//       const { status, errors }: TValidationError = this.validationError(
//         exception['errors']
//       );

//       return res.status(status).json({
//         statusCode: status,
//         timestamp: new Date().toISOString(),
//         path: req.url,
//         errors,
//       });
//     }

//     if (name === 'TokenExpiredError' || name === 'JsonWebTokenError') {
//       return res.status(HttpStatus.UNAUTHORIZED).json({
//         statusCode: HttpStatus.UNAUTHORIZED,
//         timestamp: new Date().toISOString(),
//         path: req.url,
//         errors: [{ message: 'Unauthorized.' }],
//       });
//     }

//     if (name === 'HttpException') {
//       const statusCode: HttpStatus = (exception as HttpException).getStatus(),
//         message: string = (exception as HttpException).message;

//       return res.status(statusCode).json({
//         statusCode,
//         timestamp: new Date().toISOString(),
//         path: req.url,
//         errors: [{ message }],
//       });
//     }

//     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
//       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//       timestamp: new Date().toISOString(),
//       path: req.url,
//       errors: [{ message: 'Something went wrong, please retry.' }],
//     });
//   }
// }
