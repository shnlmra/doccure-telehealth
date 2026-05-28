import { IsString, MinLength } from 'class-validator';

export class AskAiDto {
  @IsString()
  @MinLength(10, { message: 'Please describe symptoms in at least 10 characters.' })
  symptoms: string;
}
