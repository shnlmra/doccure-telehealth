import { IsUUID, IsString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class PrescriptionItemDto {
  @IsString()
  medicationName: string;

  @IsString()
  dosage: string;

  @IsString()
  instructions: string;
}

export class CreateMedicalRecordDto {
  @IsUUID()
  appointmentId: string;

  @IsUUID()
  patientId: string;

  @IsString()
  diagnosis: string;

  @IsString()
  @IsOptional()
  notes?: string; // Captures clinical summary & instructions

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescriptionItemDto)
  @IsOptional()
  prescriptions?: PrescriptionItemDto[];
}
