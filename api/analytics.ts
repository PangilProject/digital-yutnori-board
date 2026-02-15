import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize the GA4 client outside the handler (cold start optimization)
// The private key must handle newlines correctly when loaded from environment variables
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const PROPERTY_ID = process.env.GA4_PROPERTY_ID;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers to allow requests from any origin (or specify your domain)
  // Since this is a public landing page, allowing all is usually fine for GET requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!PROPERTY_ID) {
      throw new Error('GA4_PROPERTY_ID is not set');
    }

    // Set Cache-Control header for 1 minute (60 seconds)
    // s-maxage=60 tells Vercel's edge cache to hold it for 1 min
    // stale-while-revalidate=30 allows serving stale content while updating in background
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

    // Run batch report for optimization (single API call)
    const [response] = await analyticsDataClient.batchRunReports({
      property: `properties/${PROPERTY_ID}`,
      requests: [
        // Request 1: Total Users & Page Views
        {
          dateRanges: [
            {
              startDate: '2023-01-01', // Adjust start date as needed, or use '365daysAgo'
              endDate: 'today',
            },
          ],
          metrics: [
            { name: 'activeUsers' },
            { name: 'screenPageViews' },
          ],
        },
        // Request 2: Total Game Starts
        {
          dateRanges: [
            {
              startDate: '2023-01-01',
              endDate: 'today',
            },
          ],
          metrics: [
            { name: 'eventCount' },
          ],
          dimensionFilter: {
            filter: {
              fieldName: 'eventName',
              stringFilter: {
                value: 'game_start',
              },
            },
          },
        },
      ],
    });

    // Parse Response 1
    const report1 = response.reports?.[0];
    const totalUsers = parseInt(report1?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    const totalPageViews = parseInt(report1?.rows?.[0]?.metricValues?.[1]?.value || '0', 10);

    // Parse Response 2
    const report2 = response.reports?.[1];
    const totalGameStarts = parseInt(report2?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

    return res.status(200).json({
      totalUsers,
      totalPageViews,
      totalGameStarts,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('GA4 API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch analytics data',
      message: error.message 
    });
  }
}
