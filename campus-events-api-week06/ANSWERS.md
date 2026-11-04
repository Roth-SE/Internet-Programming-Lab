# Week 06 Answers

## 1. Is DELETE still idempotent?

Yes. An operation is idempotent when making the same request once or many times leaves the server in the same final state. After the first `DELETE /events/2` the event is gone, and after the second call it is still gone, so the state is unchanged. Idemgio a different status (204 then 404) does not break it.

## 2. Who blocks the response without CORS, and why can curl read it?

The browser blocks it. The request reaches the API and the API replies, but the browser refuses to give the response to the Vue app's JavaScript because the origin (`localhost:5173`) differs from the API's (`localhost:3000`) and the response has no `Access-Control-Allow-Origin` header. CORS is a browser-enforced security rule, and curl is not a browser, so it does not enforce it and prints the response.

## 3. Who creates EventsService, when, and how many?

Nest's dependency injection container creates it. The service is marked `@Injectable()` and listed as a provider in the module, and when the app starts the container builds it and passes it into the `EventsController` constructor. By default providers are singletons, so exactly one `EventsService` is created and shared (the `BookingsService` gets the same instance too).

## 4. Which line refuses `"booked": 50`, and what happens without it?

In `src/setup.ts`, `forbidNonWhitelisted: true` in the `ValidationPipe` options refuses it with a 400 saying `property booked should not exist`. Without it, `whitelist: true` still removes `booked` silently, so the request goes through but the client is never told. Without both options, `booked` would stay on the DTO object, and in a path that copies the DTO onto the event (like `update` with `Object.assign`) a client could set `booked` to any number.

## 5. Why is the seats rule in BookingsService?

The service holds the data and the business rules, and it is the only place every request must pass through. The controller should only map HTTP to service calls, so putting the rule there would mix concerns and it could be skipped by other callers. A rule that exists only in the Vue form can be bypassed by anyone using curl or another client, and it would not be safe against two bookings made at nearly the same time. The form check is only for user convenience.

