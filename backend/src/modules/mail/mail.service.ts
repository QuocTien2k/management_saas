import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: this.configService.get<number>('MAIL_PORT') === 465, // true nếu dùng port 465, false cho 587
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  //Gửi email chung
  async sendMail(to: string, subject: string, html: string): Promise<boolean> {
    const from =
      this.configService.get<string>('MAIL_FROM') || 'no-reply@saas.com';
    try {
      await this.transporter.sendMail({
        from: `"Project Management SaaS" <${from}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(`Gửi email thất bại tới ${to}:`, error);
      return false;
    }
  }

  // Gửi email khôi phục mật khẩu
  async sendPasswordResetEmail(
    email: string,
    fullname: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f5f7;
            color: #333333;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e1e4e8;
          }
          .header {
            background-color: #4f46e5;
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
          }
          .content {
            padding: 40px;
          }
          .content p {
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 20px;
            color: #4b5563;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
          }
          .footer p {
            font-size: 13px;
            color: #9ca3af;
            margin: 0 0 8px;
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
          }
          .warning {
            font-size: 13px !important;
            color: #9ca3af !important;
            line-height: 18px !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Khôi phục mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${fullname}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn tại hệ thống Quản lý Dự án SaaS.</p>
            <p>Vui lòng click vào nút bên dưới để tiến hành đặt lại mật khẩu mới:</p>
            <div class="button-container">
              <a href="${resetLink}" class="button" target="_blank">Đặt lại mật khẩu</a>
            </div>
            <p class="warning">Lưu ý: Liên kết khôi phục mật khẩu này sẽ hết hạn sau <strong>15 phút</strong> vì lý do bảo mật.</p>
            <div class="divider"></div>
            <p class="warning">Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn được bảo mật an toàn.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Project Management SaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(email, 'Yêu cầu khôi phục mật khẩu', html);
  }

  // Gửi email mời tham gia Workspace
  async sendWorkspaceInvitationEmail(
    email: string,
    workspaceName: string,
    invitedByFullname: string,
    token: string,
  ): Promise<boolean> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND') || 'http://localhost:3000';
    const invitationLink = `${frontendUrl}/workspace-invitations/accept?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f5f7;
            color: #333333;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e1e4e8;
          }
          .header {
            background-color: #4f46e5;
            padding: 32px;
            text-align: center;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
          }
          .content {
            padding: 40px;
          }
          .content p {
            font-size: 16px;
            line-height: 24px;
            margin: 0 0 20px;
            color: #4b5563;
          }
          .button-container {
            text-align: center;
            margin: 32px 0;
          }
          .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 600;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
            transition: background-color 0.2s;
          }
          .button:hover {
            background-color: #4338ca;
          }
          .footer {
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
          }
          .footer p {
            font-size: 13px;
            color: #9ca3af;
            margin: 0 0 8px;
          }
          .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 24px 0;
          }
          .warning {
            font-size: 13px !important;
            color: #9ca3af !important;
            line-height: 18px !important;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Mời tham gia không gian làm việc</h1>
          </div>
          <div class="content">
            <p>Xin chào,</p>
            <p><strong>${invitedByFullname}</strong> đã mời bạn tham gia không gian làm việc <strong>${workspaceName}</strong> tại hệ thống Quản lý Dự án SaaS.</p>
            <p>Vui lòng click vào nút bên dưới để chấp nhận lời mời:</p>
            <div class="button-container">
              <a href="${invitationLink}" class="button" target="_blank">Chấp nhận lời mời</a>
            </div>
            <p class="warning">Lưu ý: Liên kết này sẽ hết hạn sau <strong>7 ngày</strong> vì lý do bảo mật.</p>
            <div class="divider"></div>
            <p class="warning">Nếu bạn nhận được email này do nhầm lẫn, vui lòng bỏ qua nó.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Project Management SaaS. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(
      email,
      `Lời mời tham gia không gian làm việc ${workspaceName}`,
      html,
    );
  }
}
