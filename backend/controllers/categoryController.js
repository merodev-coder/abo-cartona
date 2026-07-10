import { Category } from '../models/Category.js';
import { z } from 'zod';

const subCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().max(100).optional(),
});

const categorySchema = z.object({
  type: z.enum(['laptops', 'accessories', 'storage', 'data', 'games']),
  label: z.string().min(1).max(100),
  subCategories: z.array(subCategorySchema).default([]),
});

// GET /api/categories — list all categories
export async function listCategories(req, res, next) {
  try {
    const categories = await Category.find({}).sort({ type: 1 }).lean();
    res.json({
      categories: categories.map((c) => ({
        id: c._id.toString(),
        type: c.type,
        label: c.label,
        subCategories: c.subCategories.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          slug: s.slug,
        })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// Default subcategories seeded when a category is first accessed
const DEFAULT_SUBCATEGORIES = {
  storage: [{ name: 'تخزين', slug: 'storage' }],
};

const LABEL_MAP = {
  laptops: 'لابتوب',
  accessories: 'إكسسوار',
  storage: 'قطع كمبيوتر',
  data: 'داتا',
  games: 'ألعاب',
};

// GET /api/categories/:type/subcategories — get subcategories for a specific type
export async function getSubCategories(req, res, next) {
  try {
    const { type } = req.params;
    let category = await Category.findOne({ type }).lean();

    // Auto-seed the category with defaults if it doesn't exist yet
    if (!category && DEFAULT_SUBCATEGORIES[type]) {
      const created = await Category.create({
        type,
        label: LABEL_MAP[type] || type,
        subCategories: DEFAULT_SUBCATEGORIES[type],
      });
      category = created.toObject();
    } else if (!category) {
      return res.json({ subCategories: [] });
    }

    res.json({
      subCategories: category.subCategories.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        slug: s.slug,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/categories — create a new category with subcategories
export async function createCategory(req, res, next) {
  try {
    const body = categorySchema.parse(req.body);

    // Auto-generate slugs for subcategories
    body.subCategories = body.subCategories.map((s) => ({
      ...s,
      slug:
        s.slug ||
        s.name
          .toLowerCase()
          .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
          .replace(/^-|-$/g, ''),
    }));

    const category = await Category.create(body);
    res.status(201).json({
      category: {
        id: category._id.toString(),
        type: category.type,
        label: category.label,
        subCategories: category.subCategories.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          slug: s.slug,
        })),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid category data', details: err.errors });
    }
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Category for this type already exists' });
    }
    next(err);
  }
}

// PATCH /api/admin/categories/:id — update category (label, subCategories)
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const body = categorySchema.partial().parse(req.body);

    if (body.subCategories) {
      body.subCategories = body.subCategories.map((s) => ({
        ...s,
        slug:
          s.slug ||
          s.name
            .toLowerCase()
            .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
            .replace(/^-|-$/g, ''),
      }));
    }

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({
      category: {
        id: category._id.toString(),
        type: category.type,
        label: category.label,
        subCategories: category.subCategories.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          slug: s.slug,
        })),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid category data', details: err.errors });
    }
    next(err);
  }
}

// POST /api/admin/categories/:type/subcategories — add a subcategory to a category
// Auto-creates the category if it doesn't exist yet (upsert)
export async function addSubCategory(req, res, next) {
  try {
    const { type } = req.params;
    const validTypes = ['laptops', 'accessories', 'storage', 'data', 'games'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid category type' });
    }

    const { name } = z.object({ name: z.string().min(1).max(100) }).parse(req.body);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A]+/g, '-')
      .replace(/^-|-$/g, '');

    const category = await Category.findOneAndUpdate(
      { type },
      {
        $setOnInsert: { type, label: LABEL_MAP[type] || type },
        $push: { subCategories: { name, slug } },
      },
      { new: true, upsert: true, runValidators: true }
    );

    const added = category.subCategories[category.subCategories.length - 1];
    res.status(201).json({
      subCategory: {
        id: added._id.toString(),
        name: added.name,
        slug: added.slug,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid subcategory data', details: err.errors });
    }
    next(err);
  }
}

// DELETE /api/admin/categories/:type/subcategories/:subId
export async function removeSubCategory(req, res, next) {
  try {
    const { type, subId } = req.params;
    const category = await Category.findOneAndUpdate(
      { type },
      { $pull: { subCategories: { _id: subId } } },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
