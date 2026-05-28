import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateDoctorProfileDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['Cardiologist', 'Dermatologist', 'General Physician', 'Urologist', 'Pediatrician'], {
    message: 'Specialization must be one of: Cardiologist, Dermatologist, General Physician, Urologist, Pediatrician',
  })
  specialization: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  profilePicture?: string;

  @IsString()
  licenseNumber: string;
}
