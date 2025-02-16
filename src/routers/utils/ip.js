exports.routes = {
    category: 'main',
    path: '/ip',
    method: 'get',
    execution: async (req, res) => {
        const clientIp = req.headers['cf-connecting-ip'] || req.clientIp;
        res.json({
            ip: clientIp,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });
    },
    error: false
}