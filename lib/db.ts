import mongoose from 'mongoose';
import { Product } from './products';
import { hashPassword, verifyPassword } from './utils';


const uri = process.env.DATABASE_URL || "mongodb://skyfit:wYHljWYfZccZL6eI@ac-vfyb3tu-shard-00-00.uauhwgi.mongodb.net:27017,ac-vfyb3tu-shard-00-01.uauhwgi.mongodb.net:27017,ac-vfyb3tu-shard-00-02.uauhwgi.mongodb.net:27017/?ssl=true&replicaSet=atlas-10k5lx-shard-0&authSource=admin&retryWrites=true&w=majority";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  console.log("Connecting to MongoDB (ecommerce database)...");
  try {
    const connection = await mongoose.connect(uri, {
      dbName: 'ecommerce'
    });
    isConnected = true;
    console.log("Successfully connected to ecommerce database.");
    return connection.connection;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

export function mapDbProductToProduct(dbProd: any): Product {
  const images = Array.isArray(dbProd.images) 
    ? dbProd.images.map((img: any) => img.src)
    : (dbProd.thumbnail ? [dbProd.thumbnail] : []);

  // Standard fallback colors and sizes if not present
  const colors = dbProd.colors || ['#1a1a1a', '#e5e7eb', '#3b5cf6'];
  const sizes = dbProd.sizes || ['S', 'M', 'L', 'XL'];

  return {
    id: dbProd._id?.toString() || dbProd.sku || '',
    name: dbProd.name || '',
    price: dbProd.price || 0,
    oldPrice: dbProd.sale_price || dbProd.oldPrice || null,
    desc: dbProd.description || dbProd.short_description || '',
    rating: dbProd.rating?.average || 4.5,
    reviewsCount: dbProd.rating?.count || 10,
    inStock: dbProd.availability === 'In Stock' || dbProd.stock > 0,
    colors: colors,
    sizes: sizes,
    images: images.length > 0 ? images : [''],
    category: dbProd.category_name || 'Fitness',
    has_variants: !!dbProd.has_variants,
    variant_options: dbProd.variant_options || [],
    variants: dbProd.variants || [],
    seo_title: dbProd.seo_title || '',
    seo_description: dbProd.seo_description || '',
    seo_keywords: dbProd.seo_keywords || ''
  };
}

export async function getNewArrivals(limit: number = 8): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log("Fetching new arrivals from database...");
    const rawProducts = await db.collection('products')
      .find({ is_active: true })
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    return rawProducts.map(mapDbProductToProduct);
  } catch (error) {
    console.error("Error in getNewArrivals:", error);
    return [];
  }
}

export async function getPopularProducts(limit: number = 8): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log("Fetching popular products from database...");
    const rawProducts = await db.collection('products')
      .find({ is_active: true })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit)
      .toArray();

    return rawProducts.map(mapDbProductToProduct);
  } catch (error) {
    console.error("Error in getPopularProducts:", error);
    return [];
  }
}

export async function searchProducts(queryText: string, limit: number = 10): Promise<Product[]> {
  try {
    if (!queryText || queryText.trim().length === 0) return [];
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log(`Searching products for: ${queryText}`);
    
    // Fuzzy/partial match regex
    const cleanQuery = queryText.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(cleanQuery, 'i');
    
    const rawProducts = await db.collection('products')
      .find({
        is_active: true,
        $or: [
          { name: { $regex: regex } },
          { category_name: { $regex: regex } },
          { description: { $regex: regex } },
          { sku: { $regex: regex } }
        ]
      })
      .limit(limit)
      .toArray();

    return rawProducts.map(mapDbProductToProduct);
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return [];
  }
}



export async function getProductById(id: string): Promise<Product | null> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log(`Fetching product with ID: ${id} from database...`);
    
    // Check if the id matches _id or sku
    let rawProduct = await db.collection('products').findOne({ _id: id as any });
    if (!rawProduct) {
      rawProduct = await db.collection('products').findOne({ sku: id });
    }

    if (!rawProduct) {
      return null;
    }

    return mapDbProductToProduct(rawProduct);
  } catch (error) {
    console.error(`Error in getProductById for ID ${id}:`, error);
    return null;
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cat = await db.collection('categories').findOne({ slug });
    if (!cat) return null;

    return {
      name: cat.name || '',
      slug: cat.slug || '',
      count: 0,
      icon: getCategoryEmoji(cat.name || ''),
      thumbnail: cat.image?.src || ''
    };
  } catch (error) {
    console.error("Error in getCategoryBySlug:", error);
    return null;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log(`Fetching products for category slug: ${categorySlug}`);
    
    const rawProducts = await db.collection('products')
      .find({
        is_active: true,
        $or: [
          { 'category_ancestors.slug': categorySlug },
          { category_slug: categorySlug }
        ]
      })
      .toArray();

    return rawProducts.map(mapDbProductToProduct);
  } catch (error) {
    console.error(`Error in getProductsByCategory for slug ${categorySlug}:`, error);
    return [];
  }
}


export async function getRelatedProducts(category: string, currentProductId: string, limit: number = 4): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log(`Fetching related products for category ${category}...`);
    
    const sameCategory = await db.collection('products')
      .find({ 
        is_active: true, 
        _id: { $ne: currentProductId as any },
        category_name: category 
      })
      .limit(limit)
      .toArray();

    if (sameCategory.length >= limit) {
      return sameCategory.map(mapDbProductToProduct);
    }

    const otherCategories = await db.collection('products')
      .find({ 
        is_active: true, 
        _id: { $ne: currentProductId as any },
        category_name: { $ne: category } 
      })
      .limit(limit - sameCategory.length)
      .toArray();

    return [...sameCategory, ...otherCategories].map(mapDbProductToProduct);
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    return [];
  }
}

export interface CategoryData {
  name: string;
  slug: string;
  count: number;
  icon: string;
  thumbnail: string;
}

export async function getCategories(limit: number = 12): Promise<CategoryData[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    console.log("Fetching categories from dedicated categories collection...");

    // 1. Get counts for all level-1 categories from products
    const productCounts = await db.collection('products').aggregate([
      { $match: { is_active: true } },
      { $group: {
          _id: { $arrayElemAt: ["$category_ancestors._id", 0] },
          count: { $sum: 1 }
      } }
    ]).toArray();

    const countsMap: Record<string, number> = {};
    for (const item of productCounts) {
      if (item._id) {
        countsMap[item._id.toString()] = item.count;
      }
    }

    // 2. Fetch level 1 categories sorted by sort_order
    const dbCategories = await db.collection('categories')
      .find({ level: 1 })
      .sort({ sort_order: 1 })
      .limit(limit)
      .toArray();

    // 3. Map to CategoryData format, resolving Unsplash images and emojis
    const unsplashImages: Record<string, string> = {
      'CAT-01': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-02': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-03': 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-04': 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-05': 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-06': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-07': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-08': 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-09': 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-10': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-11': 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop&auto=format&q=80',
      'CAT-12': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=300&h=300&fit=crop&auto=format&q=80',
    };

    return dbCategories.map((cat: any) => {
      const idStr = cat._id ? cat._id.toString() : '';
      return {
        name: cat.name || '',
        slug: cat.slug || '',
        count: countsMap[idStr] || 0,
        icon: getCategoryEmoji(cat.name || ''),
        thumbnail: (cat.image?.src ? cat.image.src : '') || unsplashImages[idStr] || ''
      };
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}

// Helper to resolve nice emojis for categories
function getCategoryEmoji(name: string): string {
  const lowercase = name.toLowerCase();
  const emojiMap: Record<string, string> = {
    "women's apparel": '👚',
    "men's apparel": '👕',
    "racket sports": '🎾',
    "team sports": '⚽',
    "outdoor & water sports": '🏄',
    "tech & accessories": '⌚',
    "nutrition & wellness": '🥤',
    'strength': '🏋️',
    'cardio': '🏃',
    'yoga': '🧘',
    'pilates': '🧘',
    'combat': '🥊',
    'boxing': '🥊',
    'accessories': '🎗️',
    'nutrition': '🥤',
    'protein': '🥤',
    'supplements': '💊',
    'apparel': '👕',
    'footwear': '👟',
    'shoes': '👟',
    'fitness': '💪',
    'sports': '⚽',
    'badminton': '🏸',
    'basketball': '🏀',
    'football': '⚽',
    'volleyball': '🏐',
    'cricket': '🏏',
    'biking': '🚲',
    'hiking': '🥾',
    'outdoor': '⛺',
    'recovery': '🩹',
    'rehabilitation': '🩹',
    'massage': '💆',
    'essential': '🪔',
    'dried': '🍇',
    'nuts': '🥜',
    'water': '💧',
    'hydration': '💧',
    'bottles': '💧',
    'racks': '🏋️',
    'plates': '🏋️',
    'dumbbells': '🏋️',
    'barbells': '🏋️',
    'benches': '🏋️',
    'ellipticals': '🏃',
    'rowing': '🚣',
    'treadmills': '🏃',
    'bikes': '🚲',
    'gadgets': '⌚',
    'trackers': '⌚',
    'speakers': '🔊',
    'headphones': '🎧'
  };

  for (const [key, value] of Object.entries(emojiMap)) {
    if (lowercase.includes(key)) {
      return value;
    }
  }
  return '💪'; // Default fitness emoji
}

export async function registerCustomer(data: any): Promise<{ success: boolean; message: string; customer?: any }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const email = data.email.toLowerCase().trim();

    // Check if customer already exists in 'users' collection
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return { success: false, message: 'Email address is already registered.' };
    }

    const hashedPassword = hashPassword(data.password);

    const customer = {
      name: data.name,
      email,
      phone: data.phone,
      address: data.address,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(customer);

    return { 
      success: true, 
      message: 'Registration successful!', 
      customer: { id: result.insertedId.toString(), name: customer.name, email: customer.email } 
    };
  } catch (error) {
    console.error("Error in registerCustomer:", error);
    return { success: false, message: 'Internal server error during registration.' };
  }
}

export async function authenticateCustomer(email: string, password: string): Promise<{ success: boolean; message: string; customer?: any }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cleanEmail = email.toLowerCase().trim();

    // Find customer in 'users' collection
    const customer = await db.collection('users').findOne({ email: cleanEmail });
    if (!customer) {
      return { success: false, message: 'Invalid email address or password.' };
    }

    // Verify password
    const isValid = verifyPassword(password, customer.password);
    if (!isValid) {
      return { success: false, message: 'Invalid email address or password.' };
    }

    return {
      success: true,
      message: 'Authentication successful!',
      customer: { id: customer._id.toString(), name: customer.name, email: customer.email, phone: customer.phone, address: customer.address }
    };
  } catch (error) {
    console.error("Error in authenticateCustomer:", error);
    return { success: false, message: 'Internal server error during login.' };
  }
}

export async function createOrder(orderData: any): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Generate unique order ID if not provided
    const orderId = orderData.orderId || 'SF-' + Math.floor(100000 + Math.random() * 900000);

    const order = {
      orderId,
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email.toLowerCase().trim(),
        phone: orderData.customer.phone,
        address: orderData.customer.address,
        city: orderData.customer.city || 'Kathmandu'
      },
      items: orderData.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        category: item.category,
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null
      })),
      paymentMethod: orderData.paymentMethod || 'cod',
      notes: orderData.notes || '',
      subtotal: orderData.subtotal,
      discount: orderData.discount || 0,
      shippingFee: orderData.shippingFee || 0,
      total: orderData.total,
      totalAmount: orderData.total,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('orders').insertOne(order);

    return {
      success: true,
      message: 'Order created successfully!',
      orderId
    };
  } catch (error) {
    console.error("Error in createOrder:", error);
    return { success: false, message: 'Internal server error during order creation.' };
  }
}

export async function getMostSoldProducts(limit: number = 4): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Aggregate orders to find top selling product IDs
    const topSold = await db.collection('orders').aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.id", totalSold: { $sum: "$items.qty" } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit }
    ]).toArray();

    const products: Product[] = [];
    for (const item of topSold) {
      if (item._id) {
        const prod = await getProductById(item._id);
        if (prod) {
          products.push(prod);
        }
      }
    }

    // Fallback to popular products if empty
    if (products.length === 0) {
      return getPopularProducts(limit);
    }
    return products;
  } catch (error) {
    console.error("Error in getMostSoldProducts:", error);
    return getPopularProducts(limit);
  }
}

export async function getMostWishlistedProducts(limit: number = 4): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    // Aggregate wishlists to find top wishlisted product IDs
    const topWishlisted = await db.collection('wishlists').aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]).toArray();

    const products: Product[] = [];
    for (const item of topWishlisted) {
      if (item._id) {
        const prod = await getProductById(item._id);
        if (prod) {
          products.push(prod);
        }
      }
    }

    // Fallback to new arrivals if empty
    if (products.length === 0) {
      return getNewArrivals(limit);
    }
    return products;
  } catch (error) {
    console.error("Error in getMostWishlistedProducts:", error);
    return getNewArrivals(limit);
  }
}

export async function saveWishlistItem(email: string, productId: string): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cleanEmail = email.toLowerCase().trim();
    
    // Check if already wishlisted
    const existing = await db.collection('wishlists').findOne({ email: cleanEmail, productId });
    if (existing) {
      return { success: true, message: 'Already in wishlist.' };
    }

    await db.collection('wishlists').insertOne({
      email: cleanEmail,
      productId,
      createdAt: new Date()
    });

    return { success: true, message: 'Saved to wishlist.' };
  } catch (error) {
    console.error("Error in saveWishlistItem:", error);
    return { success: false, message: 'Internal server error.' };
  }
}

export async function removeWishlistItem(email: string, productId: string): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cleanEmail = email.toLowerCase().trim();
    await db.collection('wishlists').deleteOne({ email: cleanEmail, productId });

    return { success: true, message: 'Removed from wishlist.' };
  } catch (error) {
    console.error("Error in removeWishlistItem:", error);
    return { success: false, message: 'Internal server error.' };
  }
}

export async function getCustomerWishlist(email: string): Promise<string[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cleanEmail = email.toLowerCase().trim();
    const items = await db.collection('wishlists').find({ email: cleanEmail }).toArray();
    return items.map(item => item.productId);
  } catch (error) {
    console.error("Error in getCustomerWishlist:", error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const rawProducts = await db.collection('products')
      .find({ is_active: true })
      .toArray();

    return rawProducts.map(mapDbProductToProduct);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return [];
  }
}

export async function getCustomerOrders(email: string): Promise<any[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cleanEmail = email.toLowerCase().trim();
    const orders = await db.collection('orders')
      .find({ 'customer.email': cleanEmail })
      .sort({ createdAt: -1 })
      .toArray();

    return orders.map(ord => ({
      ...ord,
      _id: ord._id.toString()
    }));
  } catch (error) {
    console.error("Error in getCustomerOrders:", error);
    return [];
  }
}

export async function updateCustomerProfile(email: string, updateData: { name: string; phone: string; address: string }): Promise<{ success: boolean; message: string; customer?: any }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const cleanEmail = email.toLowerCase().trim();

    const result = await db.collection('users').findOneAndUpdate(
      { email: cleanEmail },
      { 
        $set: { 
          name: updateData.name, 
          phone: updateData.phone, 
          address: updateData.address,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    const updatedUser = result;
    if (!updatedUser) {
      return { success: false, message: 'User not found.' };
    }

    return {
      success: true,
      message: 'Profile updated successfully!',
      customer: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    };
  } catch (error) {
    console.error("Error in updateCustomerProfile:", error);
    return { success: false, message: 'Internal server error during profile update.' };
  }
}

export async function getAllOrders(): Promise<any[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return orders.map(ord => ({
      ...ord,
      _id: ord._id.toString()
    }));
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const result = await db.collection('orders').updateOne(
      { orderId },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return { success: false, message: 'Order not found.' };
    }

    return { success: true, message: 'Order status updated successfully!' };
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return { success: false, message: 'Internal server error during status update.' };
  }
}

export async function getAllUsers(): Promise<any[]> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const users = await db.collection('users')
      .find({})
      .project({ password: 0 }) // Exclude passwords
      .sort({ createdAt: -1 })
      .toArray();

    return users.map(user => ({
      ...user,
      _id: user._id.toString()
    }));
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
}

export async function createProduct(prodData: any): Promise<{ success: boolean; message: string; productId?: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const catName = prodData.category_name || 'Fitness';
    const catDoc = await db.collection('categories').findOne({ name: catName });
    const category_slug = catDoc ? catDoc.slug : catName.toLowerCase().trim().replace(/\s+/g, '-');
    const category_ancestors = catDoc ? (catDoc.ancestors || []) : [];
    const category_id = catDoc ? catDoc._id : null;

    const newProd = {
      sku: prodData.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: prodData.name,
      price: Number(prodData.price),
      sale_price: prodData.sale_price ? Number(prodData.sale_price) : null,
      description: prodData.description || '',
      rating: {
        average: 4.5,
        count: 1
      },
      stock: Number(prodData.stock) || 10,
      availability: Number(prodData.stock) > 0 ? 'In Stock' : 'Out of Stock',
      images: (Array.isArray(prodData.images) ? prodData.images : [prodData.image || ''])
        .filter(Boolean)
        .map((img: any) => typeof img === 'string' ? { src: img, alt: prodData.name || '' } : img),
      colors: prodData.colors || ['#1a1a1a', '#e5e7eb'],
      sizes: prodData.sizes || ['S', 'M', 'L', 'XL'],
      category_name: catName,
      category_slug: category_slug,
      category_id: category_id,
      category_ancestors: category_ancestors,
      has_variants: !!prodData.has_variants,
      variant_options: Array.isArray(prodData.variant_options) ? prodData.variant_options : [],
      variants: Array.isArray(prodData.variants) ? prodData.variants : [],
      seo_title: prodData.seo_title || '',
      seo_description: prodData.seo_description || '',
      seo_keywords: prodData.seo_keywords || '',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection('products').insertOne(newProd);

    return {
      success: true,
      message: 'Product created successfully!',
      productId: result.insertedId.toString()
    };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return { success: false, message: 'Internal server error during product creation.' };
  }
}

export async function updateProduct(prodId: string, prodData: any): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    const catName = prodData.category_name || 'Fitness';
    const catDoc = await db.collection('categories').findOne({ name: catName });
    const category_slug = catDoc ? catDoc.slug : catName.toLowerCase().trim().replace(/\s+/g, '-');
    const category_ancestors = catDoc ? (catDoc.ancestors || []) : [];
    const category_id = catDoc ? catDoc._id : null;

    const updateFields: any = {
      name: prodData.name,
      price: Number(prodData.price),
      sale_price: prodData.sale_price ? Number(prodData.sale_price) : null,
      description: prodData.description,
      stock: Number(prodData.stock),
      availability: Number(prodData.stock) > 0 ? 'In Stock' : 'Out of Stock',
      images: (Array.isArray(prodData.images) ? prodData.images : [prodData.image || ''])
        .filter(Boolean)
        .map((img: any) => typeof img === 'string' ? { src: img, alt: prodData.name || '' } : img),
      category_name: catName,
      category_slug: category_slug,
      category_id: category_id,
      category_ancestors: category_ancestors,
      colors: prodData.colors || [],
      has_variants: !!prodData.has_variants,
      variant_options: Array.isArray(prodData.variant_options) ? prodData.variant_options : [],
      variants: Array.isArray(prodData.variants) ? prodData.variants : [],
      seo_title: prodData.seo_title || '',
      seo_description: prodData.seo_description || '',
      seo_keywords: prodData.seo_keywords || '',
      updated_at: new Date()
    };

    let result = await db.collection('products').updateOne(
      { sku: prodId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      // Try ObjectId search
      try {
        const { ObjectId } = require('mongodb');
        result = await db.collection('products').updateOne(
          { _id: new ObjectId(prodId) },
          { $set: updateFields }
        );
      } catch (e) {}
    }

    if (result.matchedCount === 0) {
      return { success: false, message: 'Product not found.' };
    }

    return { success: true, message: 'Product updated successfully!' };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { success: false, message: 'Internal server error during product update.' };
  }
}

export async function deleteProduct(prodId: string): Promise<{ success: boolean; message: string }> {
  try {
    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("Database connection not established");

    let result = await db.collection('products').deleteOne({ sku: prodId });

    if (result.deletedCount === 0) {
      // Try ObjectId search
      try {
        const { ObjectId } = require('mongodb');
        result = await db.collection('products').deleteOne({ _id: new ObjectId(prodId) });
      } catch (e) {}
    }

    if (result.deletedCount === 0) {
      return { success: false, message: 'Product not found.' };
    }

    return { success: true, message: 'Product deleted successfully!' };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return { success: false, message: 'Internal server error during product deletion.' };
  }
}


