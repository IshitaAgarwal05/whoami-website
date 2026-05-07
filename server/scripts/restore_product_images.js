const supabase = require('../db/supabaseClient');

const mapping = {
  1: '/products/thing/thing.webp',
  2: '/products/st-bm/st-bm.webp',
  3: '/products/hp-bm1/hp-bm1.webp',
  4: '/products/hp-bm2/hp-bm2.webp',
  5: '/products/snitch-ball/snitch-ball.webp',
  6: '/products/sorting-hat/sorting-hat.webp',
  7: '/products/nimbus/nimbus.webp',
  8: '/products/demadog/demadog.webp',
  9: '/products/wall-hanging/wall-hanging.webp',
  10: '/products/throne/throne.webp',
  11: '/products/snitch-bh/snitch-bh.webp',
  12: '/products/groot/groot.webp',
  13: '/products/dema-bm/demogorgon_bm_1.webp',
  14: '/products/vader/vader-1.webp',
  16: '/products/taooine/tatooine-1.webp',
  17: '/products/hanging-keys/hanging-keys.webp',
  18: '/products/deathly-hallows/deathly-hallows-1.webp',
  21: '/products/hp-face-keychain/hp-face-keychain.webp',
  26: '/products/phm-grace/phm-grace1.webp',
  29: '/products/got-dragon-eggs/draon-eggs.webp',
  30: '/products/got-bm1/got-bm-1.webp',
  31: '/products/st-wh/st-wh.webp',
  32: '/products/sorting-hat-kc/sorting-hat-kc.webp',
  33: '/products/grogu/grogu-1.webp',
  34: '/products/hp-bm3/hp-bm3.webp'
};

async function restoreImages() {
    console.log('Restoring images...');
    for (const [id, img] of Object.entries(mapping)) {
        await supabase.from('products').update({ image_url: img }).eq('internal_id', parseInt(id));
        console.log(`Updated product ${id} -> ${img}`);
    }
    console.log('Done mapping.');
}

restoreImages();
