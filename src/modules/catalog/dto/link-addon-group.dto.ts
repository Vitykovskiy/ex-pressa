import { IsString } from 'class-validator';

export class LinkAddonGroupDto {
  @IsString()
  productGroupId: string;

  @IsString()
  addonGroupId: string;
}
