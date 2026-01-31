import { IsOptional, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 120)
  name: string;

  @IsOptional()
  @IsString()
  tgId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 64)
  tgUsername?: string;
}
