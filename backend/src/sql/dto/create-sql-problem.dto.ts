import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { SqlDifficulty } from '../entities/sql-problem.entity';

export class CreateSqlProblemDto {
    @ApiProperty({ example: 'Recyclable and Low Fat Products' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'recyclable-and-low-fat-products' })
    @IsString()
    slug: string;

    @ApiProperty({ required: false, example: 'recyclable-and-low-fat-products' })
    @IsOptional()
    @IsString()
    leetcodeSlug?: string;

    @ApiProperty({ required: false, example: 'https://leetcode.com/problems/recyclable-and-low-fat-products/' })
    @IsOptional()
    @IsString()
    leetcodeUrl?: string;

    @ApiProperty({ enum: SqlDifficulty, example: SqlDifficulty.EASY })
    @IsEnum(SqlDifficulty)
    difficulty: SqlDifficulty;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty({
        example: [
            {
                input: 'Products table',
                output: 'product_id',
                explanation: 'Return IDs matching recyclable and low-fat conditions.',
            },
        ],
    })
    @IsArray()
    examples: Array<{ input: string; output: string; explanation?: string }>;

    @ApiProperty({ example: ['Only products with low_fats = "Y" and recyclable = "Y".'] })
    @IsArray()
    constraints: string[];

    @ApiProperty({
        example: {
            sql: '-- Write your SQL query here',
        },
    })
    starterCode: Record<string, string>;

    @ApiProperty({ required: false, example: { mysql: '-- Write your SQL query here' } })
    @IsOptional()
    codeTemplates?: Record<string, string>;

    @ApiProperty({ required: false, example: [{ lang: 'SQL', langSlug: 'sql' }] })
    @IsOptional()
    languageMeta?: Array<{ lang: string; langSlug: string }>;

    @ApiProperty({
        example: [{ input: 'Products', expected: 'product_id' }],
    })
    @IsArray()
    testCases: Array<{ input: string; expected: string; isHidden?: boolean }>;

    @ApiProperty({ required: false, isArray: true })
    @IsOptional()
    @IsArray()
    categories?: string[];

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
