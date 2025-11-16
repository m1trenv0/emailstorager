/**
 * Debug script for 17TRACK API raw response
 * Run this with: npx tsx scripts/debug-tracking.ts <trackNumber>
 */

import 'dotenv/config';

async function main() {
  const trackNumber = process.argv[2] || 'LB73247289BE';
  const apiKey = process.env.TRACK17_API_KEY;

  if (!apiKey) {
    console.error('ERROR: TRACK17_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('Testing 17TRACK API (Debug Mode)...');
  console.log('Track Number:', trackNumber);
  console.log('API Key:', apiKey);
  console.log('');

  try {
    const response = await fetch('https://api.17track.net/track/v2.2/gettracklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        '17token': apiKey,
      },
      body: JSON.stringify([
        {
          number: trackNumber,
        },
      ]),
    });

    console.log('Response Status:', response.status, response.statusText);
    console.log('');

    const data = await response.json();

    console.log('RAW API RESPONSE:');
    console.log('═══════════════════════════════════════════');
    console.log(JSON.stringify(data, null, 2));
    console.log('═══════════════════════════════════════════');

    if (data.code !== 0) {
      console.log('');
      console.log('❌ API Error Code:', data.code);
      console.log('Message:', data.msg);
      console.log('');
      console.log('Common error codes:');
      console.log('-1: System error');
      console.log('-18: Invalid API key');
      console.log('-1801: API key not activated');
      console.log('-1802: API key expired');
      console.log('-99: Rate limit exceeded');
    }
  } catch (error) {
    console.error('❌ Fetch Error:', error);
  }
}

main();
