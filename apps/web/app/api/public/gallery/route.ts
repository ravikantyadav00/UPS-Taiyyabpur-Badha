import { NextResponse } from 'next/server';

export async function GET() {
  const gallery = [
    {
      id: 'g-1',
      title: 'विद्यालय भवन एवं प्रांगण (School Building & Campus)',
      imageUrl: '/images/school-building.jpg',
      category: 'CAMPUS',
      createdAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'g-2',
      title: 'विद्यार्थी मध्याह्न भोजन (Mid-Day Meal) ग्रहण करते हुए',
      imageUrl: '/images/school-midday-meal.jpg',
      category: 'EVENTS',
      createdAt: '2026-09-02T00:00:00Z',
    },
  ];

  return NextResponse.json(gallery);
}
