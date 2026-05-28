import { IsUUID } from 'class-validator';

export class BookAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsUUID()
  scheduleId: string;
}
