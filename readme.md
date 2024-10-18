# Visitor Counter for Static Website

This project deployed on vercel presents a simple visitor counter always pointing to my website.

Presents two routes:

- /increment: Increments the counter by 1.
- /show: Returns a svg displaying the current count.

To use for your static website,

- Clone this repository and deploy your own instance on Vercel.
- Create a Vercel KV database, and connect it to the deployment.
- Once deployed, you can add an iframe in your static website (with display:none) pointing to the /increment route.
- You can also access the counter value by using the /show route to get the counter SVG.
