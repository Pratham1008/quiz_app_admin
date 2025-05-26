"use client";

import { Textarea } from "@/components/ui/textarea";

interface JSONEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function JSONEditor({ value, onChange }: JSONEditorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Quiz JSON</label>
            <Textarea
                rows={16}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`{
  "title": "Sample Quiz",
  "description": "This is a sample quiz",
  "totalQuestions": "2",
  "totalMarks": "10",
  "startTime": "2025-06-01T10:00:00",
  "endTime": "2025-06-01T11:00:00",
  "questions": [
    {
      "question": "What is 2 + 2?",
      "correctAnswer": "4",
      "options": ["3", "4", "5", "6"]
    }
  ]
}`}
            />
        </div>
    );
}
