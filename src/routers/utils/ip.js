exports.routes = {
    category: 'main',
    path: '/ip',
    method: 'get',
    execution: async (req, res) => {
        res.json({
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });
    },
    error: false
}