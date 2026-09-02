# Signal

Signal is a continuous internet download speed test for finding the best place to put a Wi-Fi router. Unlike short speed tests that stop after a few seconds, Signal keeps collecting real measurements while you walk around with your device.

## How it works

1. Press **Start continuous test**.
2. The browser requests a cache-busted 5 MB download from Cloudflare's speed-test endpoint.
3. Signal measures the time from request start until the complete response is received.
4. It calculates throughput with `(bytes downloaded * 8) / seconds / 1,000,000` to produce Mbps.
5. The live chart keeps the latest 60 samples and reports current, peak, and average throughput.
6. Pause at a location and use **Mark this spot** to remember the strongest sustained reading.

Every sample includes concrete proof in the interface: transferred megabytes, elapsed seconds, the calculated Mbps value, and the host that served the HTTP request.

## Important limitations

- This measures the path from your browser to the Cloudflare test server, not a guaranteed maximum from your internet provider.
- Wi-Fi interference, VPNs, browser throttling, device power settings, and other network activity affect results.
- For router placement, compare locations using the same device, at the same time, with the same orientation. Let each location run for at least 30 seconds.
- The graph is capped visually at 600 Mbps. A connection above that value is still measured, but points are clipped at the chart ceiling.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Stack

- Vanilla JavaScript and HTML
- Canvas for the live graph
- Vite for local development and production builds
- Cloudflare speed-test endpoint for the download payload

## Search topics

Continuous internet speed test, real download speed measurement, Wi-Fi router placement, best router location, live Mbps graph, browser bandwidth test.