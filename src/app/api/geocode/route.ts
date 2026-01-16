import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!lat || !lon) {
        return NextResponse.json({ error: 'Missing lat or lon parameters' }, { status: 400 });
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'LoyalApp/1.0 (contact@loyalapp.com.ar)'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json(
            { error: 'Failed to geocode location' },
            { status: 500 }
        );
    }
}
