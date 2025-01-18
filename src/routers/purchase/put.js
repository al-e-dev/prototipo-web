const Data = require('../../models/data');

exports.routes = {
    category: 'purchase',
    path: '/purchase/:id',
    method: 'put',
    execution: async (req, res) => {
        const { id } = req.params;
        const { service, email, password, name, pin, expiry_days } = req.body;
        const expiry_date = new Date();
        expiry_date.setDate(expiry_date.getDate() + parseInt(expiry_days));

        if (isNaN(expiry_date.getTime())) {
            return res.status(400).send('Fecha de expiración inválida');
        }

        const existingData = await Data.findOne({ purchase_id: id });

        if (!existingData) {
            return res.status(404).send('Datos no encontrados');
        }

        const updatedData = {
            service: service || existingData.service,
            'details.account.email': email || existingData.details.account.email,
            'details.account.password': password || existingData.details.account.password,
            'details.account.expiry_date': expiry_date || existingData.details.account.expiry_date,
            'details.profile.name': name || existingData.details.profile.name,
            'details.profile.pin': pin || existingData.details.profile.pin,
            'details.profile.email': email || existingData.details.profile.email,
            'details.profile.expiry_date': expiry_date || existingData.details.profile.expiry_date
        };

        await Data.findOneAndUpdate({ purchase_id: id }, updatedData);
        res.status(200).send('Datos actualizados');
    },
    error: false
};