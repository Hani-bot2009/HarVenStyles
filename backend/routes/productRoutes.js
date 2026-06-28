const express = require("express");

const router = express.Router();

const {
  getProducts,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;