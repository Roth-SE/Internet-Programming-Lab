import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Booking } from '../generated/prisma/client.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Booking[]> {
    return this.prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(eventId: number, dto: CreateBookingDto): Promise<Booking> {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event) throw new NotFoundException(`Event ${eventId} not found`);

      const updated = await tx.event.updateMany({
        where: {
          id: eventId,
          booked: { lte: event.capacity - dto.seats },
        },
        data: { booked: { increment: dto.seats } },
      });

      if (updated.count === 0) {
        const left = event.capacity - event.booked;
        throw new ConflictException(`Only ${left} seat(s) left`);
      }

      return tx.booking.create({
        data: { ...dto, eventId },
      });
    });
  }

  async remove(id: number): Promise<void> {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    await this.prisma.$transaction([
      this.prisma.booking.delete({ where: { id } }),
      this.prisma.event.update({
        where: { id: booking.eventId },
        data: { booked: { decrement: booking.seats } },
      }),
    ]);
  }
}
