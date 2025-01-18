const Data = require('../models/data');

exports.routes = {
    category: 'purchase',
    path: '/purchase',
    method: 'get',
    execution: async (req, res) => {
        const data = await Data.find();
        res.status(200).json(data);
    },
    error: false
}