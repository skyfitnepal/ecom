const mongoose = require('mongoose');

const uri = "mongodb://skyfit:wYHljWYfZccZL6eI@ac-vfyb3tu-shard-00-00.uauhwgi.mongodb.net:27017,ac-vfyb3tu-shard-00-01.uauhwgi.mongodb.net:27017,ac-vfyb3tu-shard-00-02.uauhwgi.mongodb.net:27017/?ssl=true&replicaSet=atlas-10k5lx-shard-0&authSource=admin&retryWrites=true&w=majority";

async function main() {
  try {
    await mongoose.connect(uri, { dbName: 'ecommerce' });
    const db = mongoose.connection.db;

    // Find all distinct category ancestors
    const products = await db.collection('products').find({ is_active: true }).toArray();
    
    // Aggregate top-level (ancestor[0]) and second-level (ancestor[1]) categories
    const topLevel = new Map();
    const secondLevel = new Map();
    const leafLevel = new Map();

    for (const p of products) {
      if (p.category_ancestors && p.category_ancestors.length > 0) {
        const top = p.category_ancestors[0];
        topLevel.set(top._id, { name: top.name, slug: top.slug, count: (topLevel.get(top._id)?.count || 0) + 1 });
        
        if (p.category_ancestors.length > 1) {
          const second = p.category_ancestors[1];
          secondLevel.set(second._id, { name: second.name, slug: second.slug, parent: top.name, count: (secondLevel.get(second._id)?.count || 0) + 1 });
        }
      }
      if (p.category_name) {
        leafLevel.set(p.category_name, { count: (leafLevel.get(p.category_name)?.count || 0) + 1, thumbnail: p.thumbnail || (p.images && p.images[0]?.src) || '' });
      }
    }

    console.log("TOP-LEVEL CATEGORIES:");
    console.log(Array.from(topLevel.values()).sort((a,b) => b.count - a.count));

    console.log("\nSECOND-LEVEL CATEGORIES:");
    console.log(Array.from(secondLevel.values()).sort((a,b) => b.count - a.count).slice(0, 15));

    console.log("\nLEAF CATEGORIES (category_name):");
    console.log(Array.from(leafLevel.entries()).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.count - a.count).slice(0, 20));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
