import { IsArray, IsString, IsNotEmpty, IsOptional, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class TeamMemberItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Должность обязательна' })
  role!: string;

  @IsString()
  @IsNotEmpty({ message: 'Имя участника обязательно' })
  name!: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class SetTeamMembersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberItemDto)
  items!: TeamMemberItemDto[];
}