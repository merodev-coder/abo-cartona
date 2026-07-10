import { Brand } from '../models/Brand.js';
import { z } from 'zod';

const brandSchema = z.object({
  name: z.string().min(1).max(100),
  logo: z.string().url().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

const updateBrandSchema = brandSchema.partial();

export async function listBrands(req, res, next) {
  try {
    const brands = await Brand.find({}).sort({ name: 1 }).lean();
    res.json({
      brands: brands.map((b) => ({
        id: b._id.toString(),
        name: b.name,
        slug: b.slug,
        logo: b.logo || '',
        description: b.description || '',
        isActive: b.isActive,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createBrand(req, res, next) {
  try {
    const body = brandSchema.parse(req.body);
    const brand = await Brand.create(body);
    res.status(201).json({
      brand: {
        id: brand._id.toString(),
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo || '',
        description: brand.description || '',
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid brand data', details: err.errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Brand with this name already exists' });
    }
    next(err);
  }
}

export async function updateBrand(req, res, next) {
  try {
    const { id } = req.params;
    const body = updateBrandSchema.parse(req.body);
    const brand = await Brand.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json({
      brand: {
        id: brand._id.toString(),
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo || '',
        description: brand.description || '',
        isActive: brand.isActive,
        createdAt: brand.createdAt,
        updatedAt: brand.updatedAt,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid brand data', details: err.errors });
    }
    next(err);
  }
}

export async function deleteBrand(req, res, next) {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
