const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// Proxy precio CNKT+ via KyberSwap (evita CORS)
app.get('/precio-cnkt', async (req, res) => {
  try {
    const CNKT  = '0x87bdfbe98Ba55104701b2F2e999982a317905637';
    const USDC  = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
    const MONTO = '1000000000000000000000'; // 1000 CNKT+
    const url = `https://aggregator-api.kyberswap.com/polygon/api/v1/routes?tokenIn=${CNKT}&tokenOut=${USDC}&amountIn=${MONTO}`;
    const r = await fetch(url, { headers: { 'x-client-id': 'cnkt-predictor' } });
    const d = await r.json();
    const outAmt = d?.data?.routeSummary?.amountOut;
    if (!outAmt) return res.json({ ok: false });
    const precio = parseFloat(outAmt) / 1e6 / 1000;
    res.json({ ok: true, precio });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log('CNKT Predictor corriendo en puerto ' + PORT);
});