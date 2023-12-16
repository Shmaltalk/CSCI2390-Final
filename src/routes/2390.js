const express = require('express')
const PD = require('probability-distributions');
const NodeCache = require('node-cache');
const { cache } = require('ejs');
const router = express.Router()

const week_in_seconds = 60 * 60 * 24 * 7;

const noised_data_cache = new NodeCache({ stdTTL: 0.1 }); //change to 0.1 to see new noise on refresh

// generate noise value based on laplace distribution
// input: double privacy_param, int num_values
// output: list of length num_values
function generateLaplaceNoise(privacy_param, num_values){
  const vals = PD.rlaplace(num_values, 0, privacy_param);
  return vals;
}

// add laplace noise to given data
function addLaplaceNoise(data){
  const noise = generateLaplaceNoise(3/1.25, data.length)

  // add noise to all values, rounding each noised value to nearest int and adding a lower bound of 0
  // we can round and add cutoffs based on this explanation:
  const noised_data = data.map((row, index) => {
    return {
      ...row,
      count: Math.max(Math.round(row.count + noise[index]), 0),
    };
  });

  return noised_data;
}

// test basic route
router.get('/2390', (req, res) => {
  const addNoise = req.query.addNoise || false;
  if (addNoise) {
    res.send("noise the data!")
  } else {
    const noise = generateLaplaceNoise(3/1, 5)
    res.send(noise)
  }
})

// test route accessing DB
router.get('/2390/db', async (req, res) => {
  const pool = req.app.get('pool')
  let conn
  try {
    conn = await pool.getConnection()
    rows = await conn.query(`SELECT * FROM user`)
    res.json({ status: 200, result: rows })
  } catch (error) {
    console.error(error)
    res.status(500).send('DB broke!')
  } finally {
    if (conn) conn.release() //release to pool
  }
})

router.get('/2390/users_per_group', async (req, res) => {
  const addNoise = req.query.addNoise || false;
  const cachedResult = noised_data_cache.get('users_per_group');
  
  if (addNoise && cachedResult){
    res.json({ status: 200, result: cachedResult })
  } else {

    const pool = req.app.get('pool')
    let conn
    try {
      conn = await pool.getConnection()
      rows = await conn.query("SELECT `group`, COUNT(*) AS count FROM user WHERE (`group` NOT IN ('study_m', 'study_s') OR `group` IS NULL) GROUP BY `group`")
      
      if (addNoise) {
        rows = addLaplaceNoise(rows)
        noised_data_cache.set('users_per_group', rows); // add to cache
      }
      res.json({ status: 200, result: rows })
    
    } catch (error) {
      console.error(error)
      res.status(500).send('DB broke!')
    
    } finally {
      if (conn) conn.release() //release to pool
    }
  }
})

router.get('/2390/posts_per_group', async (req, res) => {
  const addNoise = req.query.addNoise || false;
  const cachedResult = noised_data_cache.get('posts_per_group');

  if (addNoise && cachedResult){
    res.json({ status: 200, result: cachedResult })
  } else {
    const pool = req.app.get('pool')
    let conn
    try {
        conn = await pool.getConnection()
        rows = await conn.query("SELECT `group`, COUNT(*) AS count FROM user, usage_period, interaction, post WHERE user.id = usage_period.idUser AND usage_period.id = interaction.idUsagePeriod AND interaction.id = post.idInteraction AND (`group` NOT IN ('study_m', 'study_s') OR `group` IS NULL) GROUP BY `group`")
        
        if (addNoise) {
          rows = addLaplaceNoise(rows)
          noised_data_cache.set('posts_per_group', rows);
        }

        res.json({ status: 200, result: rows })
    } catch (error) {
        console.error(error)
        res.status(500).send('DB broke!')
    } finally {
        if (conn) conn.release() //release to pool
    }
  }
})

router.get('/2390/emojis_per_group', async (req, res) => {
  const addNoise = req.query.addNoise || false;
  const cachedResult = noised_data_cache.get('emojis_per_group');

  if (addNoise && cachedResult){
    res.json({ status: 200, result: cachedResult })
  } else {
    const pool = req.app.get('pool')
    let conn
    try {
        conn = await pool.getConnection()
        rows = await conn.query("SELECT `group`, post.mainEmoji, COUNT(*) AS count FROM user, usage_period, interaction, post WHERE user.id = usage_period.idUser AND usage_period.id = interaction.idUsagePeriod AND interaction.id = post.idInteraction AND (`group` NOT IN ('study_m', 'study_s') OR `group` IS NULL) GROUP BY `group`, HEX(post.mainEmoji)")
        
        if (addNoise){
          rows = addLaplaceNoise(rows)
          noised_data_cache.set('emoijs_per_group', rows);
        }

        res.json({ status: 200, result: rows })
    } catch (error) {
        console.error(error)
        res.status(500).send('DB broke!')
    } finally {
        if (conn) conn.release() //release to pool
    }
  }
})

router.get('/2390/histogram', async (req, res) => {
  const pool = req.app.get('pool')
  let conn
  try {
      final_rows = []
      conn = await pool.getConnection()
      rows = await conn.query("SELECT COUNT(*) AS count FROM user WHERE `group` = 'test_default'")
      
      for (let i = 0; i < 50; i++) {
        noised_rows = addLaplaceNoise(rows);
        final_rows.push(noised_rows[0])
      }
      
      res.json({ status: 200, result: final_rows })
  } catch (error) {
      console.error(error)
      res.status(500).send('DB broke!')
  } finally {
      if (conn) conn.release() //release to pool
  }  

})

module.exports = router
