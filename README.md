<img width="2048" height="512" alt="image" src="https://github.com/user-attachments/assets/6d97ce35-8d71-462e-8d50-597589f2b87c" />

This repository contains the typescript client library for [kingdom-auth](https://github.com/5000K/kingdom-auth).

While kingdom-auth is in open preview (pre-release), it is not distributed via npm.

Please refer to the [main repo](https://github.com/5000K/kingdom-auth) for info on how to set-up kingdom auth.

### Example Usage

```ts
import {KingdomAuth} from "kingdom-auth";

async function authExample(){
  const client = new KingdomAuth("http://localhost:14414")

  const providers = await client.loadProviders();

  // authenticate - the provider should probably be selected by your user!
  await client.authenticate(providers[0])

  // get the token (send this to your services)
  const token = await client.getToken();
}
```

The token given out by the client will be short-lived (defaults to 90 seconds). The intended design is to use client.getToken whenever you need a token, the client will make sure that it's always up to date.

The token will be signed with the private key you specified when setting up your kingdom-auth instance. Use the corresponding public key to verify the token within your services (e.g. in an authentication-middleware). It's a JWT as per [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519).
