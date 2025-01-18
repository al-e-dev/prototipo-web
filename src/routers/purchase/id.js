const Data = require('../../models/data');

exports.routes = {
    category: 'purchase',
    path: '/purchase/:id',
    method: 'get',
    execution: async (req, res) => {
        const { id } = req.params;
        const data = await Data.findOne({ purchase_id: id });
        if (!data) {
            return res.status(404).send('Datos no encontrados');
        }
        res.status(200).json(data)
    },
    error: false
};