const bostaApiUrl = 'https://stg-app.bosta.co/api/v2';
const bostaApiKey = '4cb078d622c581d10d4f25f84885760138c6d71cf2b8c41acf9ba6ea5a89b8d2';

async function test() {
  const payloads = [
    { name: 'Flat cityCode', p: { type: 10, receiver: { firstName: '@Test', phone: '01012345678' }, dropOffAddress: { firstLine: 'Tst', cityCode: 'EG-01' } } },
    { name: 'Nested city.code', p: { type: 10, receiver: { firstName: '@Test', phone: '01012345678' }, dropOffAddress: { firstLine: 'Tst', city: { code: 'EG-01' } } } }
  ];

  for (let t of payloads) {
    const res = await fetch(`${bostaApiUrl}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': bostaApiKey },
      body: JSON.stringify(t.p)
    });
    console.log(`\nTest [${t.name}] Status:`, res.status);
    console.log(await res.json());
  }
}
test();
