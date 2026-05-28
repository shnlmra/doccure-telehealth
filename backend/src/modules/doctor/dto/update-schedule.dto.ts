import { IsDateString, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDoctorScheduleDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeSlots?: string[];
}
