import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsOptional, IsInt } from 'class-validator';
import { Difficulty, ProblemCategory } from '../entities/dsa-problem.entity';

export class CreateDsaProblemDto {
    @ApiProperty({ example: 'Two Sum' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'two-sum' })
    @IsString()
    slug: string;

    @ApiProperty({ required: false, example: 'two-sum' })
    @IsOptional()
    @IsString()
    leetcodeSlug?: string;

    @ApiProperty({ required: false, example: 'https://leetcode.com/problems/two-sum/' })
    @IsOptional()
    @IsString()
    leetcodeUrl?: string;

    @ApiProperty({ enum: Difficulty, example: Difficulty.EASY })
    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty({
        example: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9',
            },
        ],
    })
    @IsArray()
    examples: Array<{ input: string; output: string; explanation?: string }>;

    @ApiProperty({ example: ['2 <= nums.length <= 10^4'] })
    @IsArray()
    constraints: string[];

    @ApiProperty({
        example: {
            javascript: 'var twoSum = function(nums, target) {};',
        },
    })
    starterCode: Record<string, string>;

    @ApiProperty({ required: false, example: { cpp: '//...', python: '#...' } })
    @IsOptional()
    codeTemplates?: Record<string, string>;

    @ApiProperty({ required: false, example: [{ lang: 'C++', langSlug: 'cpp' }] })
    @IsOptional()
    languageMeta?: Array<{ lang: string; langSlug: string }>;

    @ApiProperty({
        example: [{ input: '([2,7,11,15], 9)', expected: '[0,1]' }],
    })
    @IsArray()
    testCases: Array<{ input: string; expected: string; isHidden?: boolean }>;

    @ApiProperty({ enum: ProblemCategory, isArray: true, required: false })
    @IsOptional()
    @IsArray()
    categories?: ProblemCategory[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    hints?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    solution?: {
        approach?: string;
        code?: Record<string, string>;
        complexity?: {
            time?: string;
            space?: string;
        };
    };
}
