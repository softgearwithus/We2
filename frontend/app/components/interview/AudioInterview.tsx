'use client';

import CommunicationAssessment from './CommunicationAssessment';

interface AudioInterviewProps {
    onBack: () => void;
}

export default function AudioInterview({ onBack }: AudioInterviewProps) {
    return <CommunicationAssessment onBack={onBack} />;
}
