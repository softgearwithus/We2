import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsIn,
    IsInt,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class MarketGlobalStatsDto {
    @ApiProperty()
    @IsString()
    totalActiveJobs: string;

    @ApiProperty()
    @IsString()
    newJobsToday: string;

    @ApiProperty()
    @IsNumber()
    remoteWorkPercentage: number;

    @ApiProperty()
    @IsString()
    averageHiringTime: string;
}

class JobTrendDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    role: string;

    @ApiProperty()
    @IsNumber()
    demandGrowth: number;

    @ApiProperty()
    @IsString()
    averageSalary: string;

    @ApiProperty()
    @IsString()
    openingsGlobally: string;

    @ApiProperty()
    @IsString()
    icon: string;

    @ApiProperty()
    @IsString()
    color: string;
}

class TopLanguageDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNumber()
    share: number;

    @ApiProperty({ enum: ['up', 'down', 'stable'] })
    @IsIn(['up', 'down', 'stable'])
    trending: 'up' | 'down' | 'stable';

    @ApiProperty()
    @IsString()
    color: string;
}

class MarketInsightDto {
    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty({ enum: ['High', 'Medium', 'Low'] })
    @IsIn(['High', 'Medium', 'Low'])
    impactLevel: 'High' | 'Medium' | 'Low';

    @ApiProperty()
    @IsString()
    date: string;
}

class ProfileEnhancementDto {
    @ApiProperty({ enum: ['Skill', 'Project', 'Certification'] })
    @IsIn(['Skill', 'Project', 'Certification'])
    category: 'Skill' | 'Project' | 'Certification';

    @ApiProperty()
    @IsString()
    id: string;

    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    rationale: string;

    @ApiProperty({ enum: ['Beginner', 'Intermediate', 'Advanced'] })
    @IsIn(['Beginner', 'Intermediate', 'Advanced'])
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export class MarketRadarPayloadDto {
    @ApiProperty({ type: MarketGlobalStatsDto })
    @ValidateNested()
    @Type(() => MarketGlobalStatsDto)
    globalStats: MarketGlobalStatsDto;

    @ApiProperty({ type: [JobTrendDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => JobTrendDto)
    jobTrends: JobTrendDto[];

    @ApiProperty({ type: [TopLanguageDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TopLanguageDto)
    topLanguages: TopLanguageDto[];

    @ApiProperty({ type: [MarketInsightDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MarketInsightDto)
    insights: MarketInsightDto[];

    @ApiProperty({ type: [ProfileEnhancementDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProfileEnhancementDto)
    enhancements: ProfileEnhancementDto[];
}

export class PublishMarketRadarDto {
    @ApiProperty({ type: MarketRadarPayloadDto })
    @IsObject()
    @ValidateNested()
    @Type(() => MarketRadarPayloadDto)
    payload: MarketRadarPayloadDto;
}
