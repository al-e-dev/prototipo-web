const { default: tiktok } = require("../../scraper/tiktok");

exports.routes = {
    category: "download",
    path: "/tiktok/download",
    method: "get",
    execution: async (req, res) => {
        try {
            const { url } = req.query
            if (!url) {
                return res.status(400).json({
                    creator,
                    status: false,
                    error: "Missing 'url' parameter",
                })
            }

            const result = await tiktok.download(url);
            res.status(200).json({
                creator,
                status: true,
                data: result,
            })
        } catch (err) {
            res.status(500).json({
                creator,
                status: false,
                error: err.message || "Internal Server Error",
            })
        }
    },
    error: false,
};
