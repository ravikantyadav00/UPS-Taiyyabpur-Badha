import { NextResponse } from 'next/server';

export async function GET() {
  const notices = [
    {
      id: 'notice-1',
      title: 'Annual Sports Meet 2026-27',
      category: 'SPORTS',
      description: 'UPS Taiyyabpur Badha Annual Sports Meet will be organized from 15th October. All students can register with their Class Teacher.',
      content: 'UPS Taiyyabpur Badha Annual Sports Meet will be organized from 15th October. All students can register with their Class Teacher.',
      targetAudience: 'ALL',
      date: '2026-09-20',
      isPublic: true,
      createdAt: '2026-09-20T10:00:00Z',
    },
    {
      id: 'notice-2',
      title: 'Parent Teacher Meeting (PTM)',
      category: 'ACADEMIC',
      description: 'Important PTM for Class 1st to 8th scheduled for Saturday at 9:00 AM. Parents are requested to attend.',
      content: 'Important PTM for Class 1st to 8th scheduled for Saturday at 9:00 AM. Parents are requested to attend.',
      targetAudience: 'PARENTS',
      date: '2026-09-22',
      isPublic: true,
      createdAt: '2026-09-22T09:30:00Z',
    },
    {
      id: 'notice-3',
      title: 'Half Yearly Examination Schedule',
      category: 'EXAM',
      description: 'Half yearly examinations will commence from 1st November 2026. Detailed date sheet is available in the examination office.',
      content: 'Half yearly examinations will commence from 1st November 2026. Detailed date sheet is available in the examination office.',
      targetAudience: 'STUDENTS',
      date: '2026-09-23',
      isPublic: true,
      createdAt: '2026-09-23T11:00:00Z',
    },
  ];

  return NextResponse.json(notices);
}
