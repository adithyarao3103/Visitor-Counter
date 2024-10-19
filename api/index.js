import { inject } from '@vercel/analytics';
 
inject();

module.exports = async function handler(req, res) {
res.writeHead(301, {
    Location: 'https://github.com/adithyarao3103/Visitor-Counter'
});
res.end();
};