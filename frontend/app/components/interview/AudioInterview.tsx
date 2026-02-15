'use client';

import CommunicationAssessment, { SectionScore } from './CommunicationAssessment';

interface AudioInterviewProps {
    onBack: () => void;
    onComplete?: (scores: SectionScore[]) => void;
}

export default function AudioInterview({ onBack, onComplete }: AudioInterviewProps) {
    return <CommunicationAssessment onBack={onBack} onComplete={onComplete} />;
}
