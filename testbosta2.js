async function run() {
  const citiesRes = await fetch('https://stg-app.bosta.co/api/v0/cities');
  const d = await citiesRes.json();
  const cairo = d.data.find(c => c.code === 'EG-01');
  console.log('Cairo Data:', cairo);
}
run();
