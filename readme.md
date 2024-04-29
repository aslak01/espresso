ser etter kaffemaskin

can be ran by github CI with env params or in a single run with cli flags

api:

```
  const url = args.i || baseUrl;
  const q = args.q || query;
  const lat = args.lat || latitude;
  const lon = args.lon || longitude;
  const radius = args.rad || rad;
  const category = args.cat || cat;
  const sub_category = args.sc || s_cat;
  const market = args.m || marketplace;
  const outputUrl = args.o || hookUrl;
```
