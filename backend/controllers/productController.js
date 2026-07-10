import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { z } from 'zod';

const paginationSchema = z.object({
  page: z.string().default('1').transform(Number).pipe(z.number().min(1)),
  limit: z.string().default('20').transform(Number).pipe(z.number().min(1).max(100)),
  category: z.string().optional(),
  subtype: z.string().optional(),
  search: z.string().optional(),
  isSale: z.enum(['true', 'false']).optional(),
  tags: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? Number(val) : undefined),
});

const productSchema = z.object({
  name: z.string().min(2).max(200),
  type: z.enum(['laptops', 'accessories', 'storage', 'data', 'games']),
  subtype: z.string().max(100).optional().transform(val => val === '' ? undefined : val),
  price: z.coerce.number().min(0),
  oldPrice: z.coerce.number().min(0).optional().transform(val => (val === undefined || val === 0) ? undefined : val),
  description: z.string().max(5000).optional().transform(val => val === '' ? undefined : val),
  image: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  images: z.array(z.string().url().or(z.literal('')).transform(val => val === '' ? undefined : val)).optional().default([]),
  specs: z.record(z.any()).optional(),
  stockCount: z.coerce.number().int().min(0).default(0),
  storageCapacity: z.coerce.number().int().min(0).default(0),
  gbSize: z.coerce.number().int().min(0).default(0),
  dataDetails: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isBrandActive: z.coerce.boolean().default(false),
  brands: z.array(z.string()).default([]),
  isSale: z.coerce.boolean().default(false),
}).refine((data) => {
  // For non-data products, price must be positive
  if (data.type !== 'data' && data.price <= 0) {
    return false;
  }
  // For data products, if price is 0, gbSize must be provided
  if (data.type === 'data' && data.price === 0 && (!data.gbSize || data.gbSize <= 0)) {
    return false;
  }
  return true;
}, {
  message: "Invalid price configuration: non-data products must have positive price, and free data products must have gbSize",
  path: ["price"]
});

export async function listProducts(req, res, next) {
  try {
    const { page, limit, category, subtype, search, isSale, tags, minPrice, maxPrice } = paginationSchema.parse(req.query);
    
    const filter = {};
    if (category) filter.type = category;
    if (subtype) filter.subtype = subtype;
    if (isSale !== undefined) filter.isSale = isSale === 'true';
    
    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    
    // Tags filtering
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }
    
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: regex }, { description: regex }];
    }
    
    const skip = (page - 1) * limit;
    
    // Fetch products, count, and available subcategories in parallel
    const subCategoriesPromise = category
      ? Category.findOne({ type: category }).lean().then(cat =>
          cat ? cat.subCategories.map(s => ({ id: s._id.toString(), name: s.name, slug: s.slug })) : []
        )
      : Promise.resolve([]);

    const [docs, total, availableSubCategories] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      subCategoriesPromise,
    ]);
    
    const products = docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug || '',
      type: doc.type,
      subtype: doc.subtype || '',
      price: doc.price,
      oldPrice: doc.oldPrice,
      description: doc.description || '',
      image: doc.image || '',
      images: doc.images || [],
      specs: doc.specs || {},
      stockCount: doc.stockCount || 0,
      storageCapacity: doc.storageCapacity || 0,
      gbSize: doc.gbSize || 0,
      dataDetails: Array.isArray(doc.dataDetails) ? doc.dataDetails : [],
      isSale: !!doc.isSale,
      isBrandActive: !!doc.isBrandActive,
      brands: Array.isArray(doc.brands) ? doc.brands : [],
      tags: Array.isArray(doc.tags) ? doc.tags.map(tag => ({
        id: tag,
        name: tag,
        slug: tag.toLowerCase().replace(/\s+/g, '-')
      })) : [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    
    res.json({
      products,
      availableSubCategories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + docs.length < total,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid query parameters', details: err.errors });
    }
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    console.log('Received product data:', req.body);
    const body = productSchema.parse(req.body);
    console.log('Validated product data:', body);
    
    const product = await Product.create(body);
    
    const dto = {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug || '',
      type: product.type,
      subtype: product.subtype || '',
      price: product.price,
      oldPrice: product.oldPrice,
      description: product.description || '',
      image: product.image || '',
      images: product.images || [],
      specs: product.specs || {},
      stockCount: product.stockCount || 0,
      storageCapacity: product.storageCapacity || 0,
      gbSize: product.gbSize || 0,
      isSale: !!product.isSale,
      isBrandActive: !!product.isBrandActive,
      brands: Array.isArray(product.brands) ? product.brands : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    res.status(201).json({ product: dto });
  } catch (err) {
    console.error('Create product error details:', err);
    if (err instanceof z.ZodError) {
      console.error('Zod validation errors:', err.errors);
      return res.status(400).json({ 
        error: 'Invalid product data', 
        details: err.errors,
        receivedData: req.body 
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Product with this name already exists' });
    }
    next(err);
  }
}

const updateProductSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  type: z.enum(['laptops', 'accessories', 'storage', 'data', 'games']).optional(),
  subtype: z.string().max(100).optional().transform(val => val === '' ? undefined : val),
  price: z.coerce.number().min(0).optional(),
  oldPrice: z.coerce.number().min(0).optional().transform(val => (val === undefined || val === 0) ? undefined : val),
  description: z.string().max(5000).optional().transform(val => val === '' ? undefined : val),
  image: z.string().url().optional().or(z.literal('')).transform(val => val === '' ? undefined : val),
  images: z.array(z.string().url().or(z.literal('')).transform(val => val === '' ? undefined : val)).optional(),
  specs: z.record(z.any()).optional(),
  stockCount: z.coerce.number().int().min(0).optional(),
  storageCapacity: z.coerce.number().int().min(0).optional(),
  gbSize: z.coerce.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
  isBrandActive: z.coerce.boolean().optional(),
  brands: z.array(z.string()).optional(),
  isSale: z.coerce.boolean().optional(),
}).refine((data) => {
  // If price is being updated, validate it based on product type
  if (data.price !== undefined) {
    // For non-data products, price must be positive
    if (data.type !== 'data' && data.price <= 0) {
      return false;
    }
    // For data products, if price is 0, gbSize must be provided and positive
    if (data.type === 'data' && data.price === 0 && (!data.gbSize || data.gbSize <= 0)) {
      return false;
    }
  }
  return true;
}, {
  message: "Invalid price configuration: non-data products must have positive price, and free data products must have gbSize",
  path: ["price"]
});

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const body = updateProductSchema.parse(req.body);
    
    // Build update object only with provided fields
    const updateData = {};
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }
    
    const product = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const dto = {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug || '',
      type: product.type,
      subtype: product.subtype || '',
      price: product.price,
      oldPrice: product.oldPrice,
      description: product.description || '',
      image: product.image || '',
      images: product.images || [],
      specs: product.specs || {},
      stockCount: product.stockCount || 0,
      storageCapacity: product.storageCapacity || 0,
      gbSize: product.gbSize || 0,
      isSale: !!product.isSale,
      isBrandActive: !!product.isBrandActive,
      brands: Array.isArray(product.brands) ? product.brands : [],
      tags: Array.isArray(product.tags) ? product.tags : [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
    res.json({ product: dto });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid product data', details: err.errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Product with this name already exists' });
    }
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getTags(req, res, next) {
  try {
    // Get all unique tags from products
    const products = await Product.find({}, 'tags').lean();
    const tagSet = new Set();
    
    products.forEach(product => {
      if (Array.isArray(product.tags)) {
        product.tags.forEach(tag => {
          if (tag && tag.trim()) {
            tagSet.add(tag.trim());
          }
        });
      }
    });
    
    // Convert to array of tag objects with id, name, slug
    const tags = Array.from(tagSet).map(tag => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      name: tag,
      slug: tag.toLowerCase().replace(/\s+/g, '-')
    }));
    
    res.json({ tags });
  } catch (err) {
    next(err);
  }
}
