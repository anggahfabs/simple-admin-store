const db= require('../db');

exports.index = async (req, res)=>{
    const [products] = await db.query(`SELECT p.*, s.qty AS stock_product FROM products p JOIN stock_product s ON s.product_id = p.id`);

    const [pembelian] = await db.query(` SELECT pb.*, p.name FROM pembelian pb JOIN products p ON p.id = pb.product_id ORDER BY pb.id DESC `);

    res.render('admin/index', {products, pembelian});
}

exports.store = async (req, res) => {
  const { product_id, qty } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[product]] = await conn.query(
      'SELECT price FROM products WHERE id=?', [product_id]
    );

    const [[stock_product]] = await conn.query(
      'SELECT qty FROM stock_product WHERE product_id=? FOR UPDATE', [product_id]
    );

    if (stock_product.qty < qty) throw 'Stok tidak cukup';

    const total = product.price * qty;

    await conn.query(
      'INSERT INTO pembelian (product_id, qty, total_price) VALUES (?,?,?)',
      [product_id, qty, total]
    );

    await conn.query(
      'UPDATE stock_product SET qty = qty - ? WHERE product_id=?',
      [qty, product_id]
    );

    await conn.commit();
    res.redirect('/');
  } catch (e) {
    await conn.rollback();
    res.send(e);
  } finally {
    conn.release();
  }
};


exports.cancel = async (req, res) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [[pb]] = await conn.query(
      'SELECT * FROM pembelian WHERE id=? FOR UPDATE', [req.params.id]
    );

    if (pb.status === 'canceled') throw 'Sudah dibatalkan';

    await conn.query(
      'UPDATE pembelian SET status="canceled" WHERE id=?',
      [pb.id]
    );

    await conn.query(
      'UPDATE stock_product SET qty = qty + ? WHERE product_id=?',
      [pb.qty, pb.product_id]
    );

    await conn.commit();
    res.redirect('/');
  } catch (e) {
    await conn.rollback();
    res.send(e);
  } finally {
    conn.release();
  }
};
