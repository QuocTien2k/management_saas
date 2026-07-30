import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../../common/types/jwt-payload.interface';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // Băm các token ngẫu nhiên trước khi lưu DB
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Sinh cặp Access Token & Refresh Token
  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // Hết hạn sau 7 ngày

    // Lưu RefreshToken vào DB
    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      refreshTokenExpiresAt,
    };
  }

  // 1. Đăng ký tài khoản thường (Signup)
  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      if (existingUser.deletedAt) {
        throw new ConflictException('Email này thuộc tài khoản đã bị xóa trước đó');
      }
      throw new ConflictException('Email đã được đăng ký trong hệ thống');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullname: dto.fullname,
        password: passwordHash,
        provider: AuthProvider.LOCAL,
        status: 'ACTIVE', // Chuyển thẳng sang ACTIVE theo phản hồi của user
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      fullname: newUser.fullname,
      role: newUser.role,
      status: newUser.status,
    };
  }

  // 2. Đăng nhập thường (Login)
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    if (user.provider !== AuthProvider.LOCAL || !user.password) {
      throw new BadRequestException(
        `Tài khoản này đã được đăng ký thông qua ${user.provider}. Vui lòng đăng nhập theo hình thức tương ứng.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  // 3. Đăng nhập qua Google (Google Login)
  async googleLogin(dto: GoogleLoginDto) {
    let googlePayload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      googlePayload = ticket.getPayload();
    } catch (error) {
      throw new UnauthorizedException('Token Google không hợp lệ hoặc đã hết hạn');
    }

    if (!googlePayload || !googlePayload.email) {
      throw new BadRequestException('Không lấy được email từ thông tin Google');
    }

    const googleId = googlePayload.sub;
    const email = googlePayload.email;
    const fullname = googlePayload.name || 'Người dùng Google';
    const avatar = googlePayload.picture || null;

    // Tìm user theo googleId trước
    let user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (user) {
      if (user.deletedAt) {
        throw new UnauthorizedException('Tài khoản liên kết với Google đã bị xóa');
      }
      if (user.status === 'INACTIVE') {
        throw new UnauthorizedException('Tài khoản liên kết với Google đã bị khóa');
      }
    } else {
      // Nếu chưa có googleId, tìm theo email
      user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        if (user.deletedAt) {
          throw new UnauthorizedException('Tài khoản liên kết với Email này đã bị xóa');
        }
        if (user.status === 'INACTIVE') {
          throw new UnauthorizedException('Tài khoản liên kết với Email này đã bị khóa');
        }

        // Liên kết tài khoản Google
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            provider: AuthProvider.GOOGLE,
            avatar: user.avatar || avatar, // Cập nhật avatar nếu trống
          },
        });
      } else {
        // Tạo mới hoàn toàn
        user = await this.prisma.user.create({
          data: {
            email,
            fullname,
            avatar,
            provider: AuthProvider.GOOGLE,
            googleId,
            status: 'ACTIVE',
          },
        });
      }
    }

    const tokens = await this.generateTokens(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  // 4. Đăng xuất (Logout)
  async logout(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      return;
    }
    const tokenHash = this.hashToken(rawRefreshToken);

    // Xóa/Thu hồi RefreshToken trong DB
    await this.prisma.refreshToken.deleteMany({
      where: { tokenHash },
    });
  }

  // 5. Làm mới token (RefreshToken Rotation)
  async refresh(rawRefreshToken: string) {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Thiếu Refresh Token');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const dbToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
      // Nếu token không hợp lệ hoặc đã hết hạn, thu hồi toàn bộ token liên quan để tránh replay attack
      if (dbToken) {
        await this.prisma.refreshToken.deleteMany({
          where: { userId: dbToken.userId },
        });
      }
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
    }

    // Xóa token cũ ngay khi sử dụng (Xoay vòng token)
    await this.prisma.refreshToken.delete({
      where: { id: dbToken.id },
    });

    // Sinh cặp token mới
    const tokens = await this.generateTokens(dbToken.user);

    return {
      user: {
        id: dbToken.user.id,
        email: dbToken.user.email,
        fullname: dbToken.user.fullname,
        role: dbToken.user.role,
      },
      ...tokens,
    };
  }

  // 6. Quên mật khẩu (Forgot Password)
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Không tìm thấy tài khoản với email này');
    }

    if (user.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException('Tài khoản này được đăng ký qua MXH, không thể đổi mật khẩu thường');
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawResetToken);
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Hết hạn sau 15 phút

    // Lưu token đổi mật khẩu vào DB
    await this.prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // In log mã token ra console (dùng cho debug/development)
    // console.log(`[FORGOT PASSWORD] Reset Token cho ${dto.email}: ${rawResetToken}`);
    // console.log(`[FORGOT PASSWORD] Đường dẫn giả định: http://localhost:3001/reset-password?token=${rawResetToken}`);

    // Gửi email khôi phục mật khẩu thực tế
    await this.mailService.sendPasswordResetEmail(user.email, user.fullname, rawResetToken);

    return {
      message: 'Mã khôi phục mật khẩu đã được gửi đến email của bạn',
      // Chỉ trả về token trong môi trường phát triển để dev dễ test
      resetToken: process.env.NODE_ENV !== 'production' ? rawResetToken : undefined,
    };
  }

  // 7. Đặt lại mật khẩu (Reset Password)
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);

    const dbToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!dbToken || dbToken.isUsed || dbToken.expiresAt < new Date()) {
      throw new BadRequestException('Mã khôi phục mật khẩu không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật mật khẩu mới của User
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: dbToken.userId },
      data: { password: passwordHash },
    });

    // Đánh dấu token đã được sử dụng
    await this.prisma.passwordResetToken.update({
      where: { id: dbToken.id },
      data: { isUsed: true },
    });

    return {
      message: 'Đặt lại mật khẩu thành công',
    };
  }
}
