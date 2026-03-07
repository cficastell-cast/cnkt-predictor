
const express = require('express');
const path = require('path');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Proxy para precio CNKT+ via KyberSwap
app.get('/precio-cnkt', (req, res) => {
  const CNKT = '0x87bdfbe98Ba55104701b2F2e999982a317905637';
  const USDC = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const amount = (1000 * 1e18).toString();
  const url = `https://aggregator-api.kyberswap.com/polygon/api/v1/routes?tokenIn=${CNKT}&tokenOut=${USDC}&amountIn=${amount}&saveGas=0&gasInclude=0`;

  https.get(url, { headers: { 'Accept': 'application/json' } }, (resp) => {
    let data = '';
    resp.on('data', chunk => data += chunk);
    resp.on('end', () => {
      try {
        const json = JSON.parse(data);
        const amountOut = json?.data?.routeSummary?.amountOut;
        if (amountOut) {
          const precio = parseInt(amountOut) / 1e6 / 1000;
          res.json({ ok: true, precio });
        } else {
          res.json({ ok: false });
        }
      } catch(e) { res.json({ ok: false }); }
    });
  }).on('error', () => res.json({ ok: false }));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log('CNKT Predictor corriendo en puerto ' + PORT));