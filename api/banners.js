export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const banners = [
    {
      id: 'b_placeholder_01',
      image: 'https://placehold.co/1200x500/png?text=TOLSOVKA',
      href: null,
      active: 1,
      order: 1
    }
  ];
  res.status(200).json(banners);
}
