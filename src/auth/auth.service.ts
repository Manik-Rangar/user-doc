import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { checkHash, toHash } from '@jkt/nest-utils';
import {
  RequestForgotPasswordDto,
  LoginRequestDto,
  ForgotPasswordDto,
  ResponseWrapper,
  ResponseStatus,
} from '@jkt/dto';
import { OTP, User } from '@jkt/models';
import { Op } from 'sequelize';
import { OtpType } from '@jkt/enums';
import { Response } from '@jkt/constants';
const OTP_EXPIRY = 10;
const OTP_TOKEN_TYPE = 'temp';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(OTP)
    private otpModel: typeof OTP,
  ) {}

  async login(
    loginRequest: LoginRequestDto,
  ): Promise<ResponseWrapper<{ token: string; user: { id; email; name } }>> {
    const user = await this.userModel.findOne({
      where: { email: loginRequest.email },
      raw: true,
    });

    if (!user || !(await checkHash(loginRequest?.password, user.password))) {
      throw new HttpException(
        Response.INVALID_CREDENTIALS,
        HttpStatus.BAD_REQUEST,
      );
    }

    const payload = {
      id: user.id,
      user: { id: user.id, email: user.email, name: user.name },
    };

    return new ResponseWrapper(ResponseStatus.SUCCESS, {
      token: this.jwtService.sign(payload),
      user,
    });
  }

  async requestForgorPassword(
    requestForgorPassword: RequestForgotPasswordDto,
  ): Promise<ResponseWrapper<{ tempToken: string }>> {
    const { email } = requestForgorPassword;

    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      throw new HttpException(Response.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const tempToken = await this.generateTemporaryToken(
      user.id,
      OtpType.FORGOT_PASSWORD,
    );

    // await this.notify.send({
    //   email: {
    //     to: user.email,
    //     subject: ADMIN_EMAIL_RESET,
    //     template: 'admin-reset-password',
    //     context: {
    //       name: user.name,
    //       link: `${this.configService.get('adminAppBase')}${
    //         ADMIN_ROUTES.auth.createPassword
    //       }?token=${tempToken}`,
    //     },
    //   },
    // });
    return new ResponseWrapper(
      ResponseStatus.SUCCESS,
      { tempToken },
      Response.PASSOWRD_RESET_SENT,
    );
  }

  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    const validTempToken = await this.otpModel.findOne({
      where: {
        id: forgotPassword.token,
        expiration: { [Op.gt]: new Date() },
      },
    });

    if (!validTempToken) {
      throw new HttpException(Response.INVALID_TOKEN, HttpStatus.UNAUTHORIZED);
    }
    await this.otpModel.destroy({ where: { id: validTempToken.id } });
    await this.userModel.update(
      {
        password: await toHash(forgotPassword.password),
      },
      {
        where: { id: validTempToken.userId },
        returning: true,
      },
    );
  }
  async generateTemporaryToken(
    userId: string,
    type = OTP_TOKEN_TYPE,
    expiryInMinutes = OTP_EXPIRY,
  ): Promise<string> {
    const expiryInMilliSeconds = expiryInMinutes * 60 * 1000;
    const expiration = new Date(Date.now() + expiryInMilliSeconds);

    await this.otpModel.destroy({ where: { userId, type } });
    const res = await this.otpModel.create({
      userId,
      type: type,
      otp: '000000',
      expiration,
    });
    return res.id;
  }
}
