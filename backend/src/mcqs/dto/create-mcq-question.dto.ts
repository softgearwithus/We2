import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { McqCategory } from '../entities/mcq-question.entity';

export class CreateMcqQuestionDto {
    @ApiProperty({ enum: McqCategory, example: McqCategory.SUBJECT })
    @IsEnum(McqCategory)
    category: McqCategory;

    @ApiProperty({ example: 'english', description: 'Subject key or company name' })
    @IsString()
    @IsNotEmpty()
    group: string;

    @ApiProperty({ example: 'arrays', description: 'Topic name for company MCQs', required: false })
    @IsOptional()
    @IsString()
    topic?: string;

    @ApiProperty({ example: 60, description: 'Duration in minutes constraint for the module', required: false })
    @IsOptional()
    @IsInt()
    topicDurationMinutes?: number;

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

    @ApiProperty({ example: true, description: 'Manually marks question sub-module as new', required: false })
    @IsOptional()
    isNew?: boolean;

}
