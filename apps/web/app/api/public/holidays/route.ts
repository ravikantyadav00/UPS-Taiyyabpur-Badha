import { NextResponse } from 'next/server';

export async function GET() {
  const holidays = [
    {
      id: 'h-1',
      title: 'Gandhi Jayanti',
      description: 'National Holiday',
      startDate: '2026-10-02',
      endDate: '2026-10-02',
      type: 'OFFICIAL',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'h-2',
      title: 'Dussehra',
      description: 'Festival Holiday',
      startDate: '2026-10-24',
      endDate: '2026-10-25',
      type: 'FESTIVAL',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'h-3',
      title: 'Diwali Break',
      description: 'Festival Holidays',
      startDate: '2026-11-12',
      endDate: '2026-11-16',
      type: 'FESTIVAL',
      createdAt: '2026-09-01T00:00:00Z',
    },
  ];

  return NextResponse.json(holidays);
}
