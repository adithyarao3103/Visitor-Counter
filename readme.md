# Visitor Counter for Static Website

This project deployed on vercel presents a simple visitor counter.

This presents the following routes:

- `/add?name=name&password=password`: Adds a new counter.
- `/increment?name=name`: Increments the counter `name` by 1.
- `/show?name=name`: Returns a svg displaying the current count.
- `/set?value=val`: Sets the counter to `val`.
- `/`: Redirects to this GitHub page.

To use on your static website,

- Clone this repository and deploy your own instance on Vercel.
- Create a Vercel KV database, and connect it to the deployment.
- Once deployed, you can add an iframe in your static website (with `display:none`) pointing to the `/increment` route.
- You can also access the counter value by using the `/show` route to get the counter SVG.
