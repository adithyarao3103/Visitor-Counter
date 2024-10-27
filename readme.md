# Visitor Counter for Static Website

Simple Visitor Counter for Static Website.

Presents the following routes:

## `/dashboard`

Presents the following dashboard (password protected) to create and manage counters
![dashboard](image.png)
( you can put the value of counter in the texbox and click on update to set the counter to the given value )

## `/increment?name=countername`

Increments the counter `countername` by 1.
Use this route in a hidden iframe in your website to increment the counter.

## `/show?name=countername`

Returns a svg displaying the current count of counter `countername`.
It also presents the following themes: 

### Default 

![default](https://visitor-counter-adithyarao3103.vercel.app/show?name=test-counter)

### `&theme=flat`

![default](https://visitor-counter-adithyarao3103.vercel.app/show?name=test-counter&theme=flat)

### `&theme=plastic`

![default](https://visitor-counter-adithyarao3103.vercel.app/show?name=test-counter&theme=plastic)


![default](https://visitor-counter-adithyarao3103.vercel.app/show?name=test-counter&theme=flat&tb=0d1117&cb=4493f8)


- `/set?name=name&value=value&password=password`: Sets the counter to `value`.
- `/remove?name=name&password=password`: Deletes the counter `name`.
- `/`: Redirects to this GitHub page.

To use,

1. Clone this repository and deploy your own instance on Vercel (The project is made to be deployed on Vercel, free plan is enough).
2. Create a Vercel KV database, and connect it to the deployment.
3. Add the environment variable `ADMIN_PASSWORD_HASH` with the value of the `sha256` hash of your password on Vercel and connect it to the deployment.
4. Once deployed, you can create a new counter using `/add` route and you can add an iframe in your static website (with `display:none`) pointing to the `/increment` route.
5. You can also access the counter value by using the `/show` route to get the counter SVG.
