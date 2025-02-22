const { default: tiktok } = require("../../scraper/tiktok");

exports.routes = {
    category: "download",
    path: "/tiktok/search",
    method: "get",
    execution: async (req, res) => {
        try {
            const { query } = req.query
            if (!query) {
                return res.status(400).json({
                    creator,
                    status: false,
                    error: "Missing 'query' parameter",
                })
            }

            const result = await tiktok.search(query);
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
