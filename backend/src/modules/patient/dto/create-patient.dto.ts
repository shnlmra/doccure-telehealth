import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdatePatientProfileDto {
  @IsString()
  name: string;

  @IsDateString()
  @IsOptional()
  birthday?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsString()
  @IsOptional()
  contactNumber?: string;

  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
