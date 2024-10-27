# Visitor Counter for Static Website

This project deployed on vercel presents a simple visitor counter.

> [!Important]
> Each vercel deployment will have one single variable to store the value of the counter. Using it on multiple sites will lead to every site incrementing a single counter, which is not the intended behavior.

This presents the following routes:

- `/increment`: Increments the counter by 1.
- `/show`: Returns a svg displaying the current count.
- `/set?value=val`: Sets the counter to `val`.
- `/`: Redirects to this GitHub page.

To use on your static website,

- Clone this repository and deploy your own instance on Vercel.
- Create a Vercel KV database, and connect it to the deployment.
- Once deployed, you can add an iframe in your static website (with `display:none`) pointing to the `/increment` route.
- You can also access the counter value by using the `/show` route to get the counter SVG.

### Todo

- [ ] Add a `/add?name=name` route to add a new counter. This should create a new variable in the database, which can be accessed via `/increment?name=name` and `/show?name=name` routes. This will allow to use one single deployment on multiple sites.
