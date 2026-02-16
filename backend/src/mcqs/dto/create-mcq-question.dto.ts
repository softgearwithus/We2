import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';

export class CreateMcqQuestionDto {
    @ApiProperty({ enum: McqCategory, example: McqCategory.SUBJECT })
    @IsEnum(McqCategory)
    category: McqCategory;

    @ApiProperty({ example: 'english', description: 'Subject key or company name' })
    @IsString()
    @IsNotEmpty()
    group: string;

    @ApiProperty({ example: 'Which sentence is grammatically correct?' })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ example: ['She is going to school.', 'She are going to school.'] })
    @IsArray()
    @ArrayMinSize(2)
    options: string[];

    @ApiProperty({ example: 0, description: 'Zero-based index of correct option' })
    @IsInt()
    @Min(0)
    correctOptionIndex: number;

}
