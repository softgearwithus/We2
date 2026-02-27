import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateApplicationDto {
    @IsUUID()
    @IsNotEmpty()
    placementId: string;
}
