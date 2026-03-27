import { IsString, IsOptional, IsObject } from 'class-validator';

export class VapiPayloadDto {
  @IsObject()
  message: {
    type: string; // 'transcript', 'function-call', etc.
    transcript?: string;
    transcriptType?: 'final' | 'partial';
    functionCall?: {
      name: string;
      parameters: any;
    };
    call?: {
      id: string;
      status: string;
    };
  };
}
