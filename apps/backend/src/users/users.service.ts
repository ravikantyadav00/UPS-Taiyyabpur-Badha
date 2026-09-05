import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { school: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found`);
    }
    // Omit passwordHash and refreshTokenHash before returning
    const { passwordHash, refreshTokenHash, ...userWithoutHashes } = user;
    return userWithoutHashes;
  }

  async findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { mobile: identifier },
          { username: identifier },
        ],
      },
      include: { school: true },
    });
  }

  async updateRefreshTokenHash(userId: string, refreshTokenHash: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async updateLastLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
