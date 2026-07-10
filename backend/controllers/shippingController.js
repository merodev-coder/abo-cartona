import { ShippingMethod } from '../models/ShippingMethod.js';

// ── Shipping Methods ──────────────────────────────────────────────

export async function listShippingMethods(req, res, next) {
  try {
    const methods = await ShippingMethod.find().sort({ createdAt: 1 });
    res.json({ methods });
  } catch (err) {
    next(err);
  }
}

export async function createShippingMethod(req, res, next) {
  try {
    const { name, depositType } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const method = await ShippingMethod.create({ name, depositType });
    res.status(201).json({ method });
  } catch (err) {
    next(err);
  }
}

export async function updateShippingMethod(req, res, next) {
  try {
    const { id } = req.params;
    const { name, depositType, isActive } = req.body;
    const method = await ShippingMethod.findByIdAndUpdate(
      id,
      { name, depositType, isActive },
      { new: true, runValidators: true }
    );
    if (!method) return res.status(404).json({ error: 'Method not found' });
    res.json({ method });
  } catch (err) {
    next(err);
  }
}

export async function deleteShippingMethod(req, res, next) {
  try {
    const { id } = req.params;
    const method = await ShippingMethod.findByIdAndDelete(id);
    if (!method) return res.status(404).json({ error: 'Method not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ── Per-Method Governorates ───────────────────────────────────────

export async function addGovernorateToMethod(req, res, next) {
  try {
    const { id } = req.params;
    const { name, cost } = req.body;
    if (!name || cost === undefined) return res.status(400).json({ error: 'Name and cost are required' });
    const method = await ShippingMethod.findByIdAndUpdate(
      id,
      { $push: { governorates: { name, cost: Number(cost) } } },
      { new: true }
    );
    if (!method) return res.status(404).json({ error: 'Method not found' });
    res.json({ method });
  } catch (err) {
    next(err);
  }
}

export async function updateGovernorateInMethod(req, res, next) {
  try {
    const { id, govId } = req.params;
    const { name, cost } = req.body;
    const method = await ShippingMethod.findOneAndUpdate(
      { _id: id, 'governorates._id': govId },
      {
        $set: {
          ...(name !== undefined && { 'governorates.$.name': name }),
          ...(cost !== undefined && { 'governorates.$.cost': Number(cost) }),
        },
      },
      { new: true }
    );
    if (!method) return res.status(404).json({ error: 'Not found' });
    res.json({ method });
  } catch (err) {
    next(err);
  }
}

export async function removeGovernorateFromMethod(req, res, next) {
  try {
    const { id, govId } = req.params;
    const method = await ShippingMethod.findByIdAndUpdate(
      id,
      { $pull: { governorates: { _id: govId } } },
      { new: true }
    );
    if (!method) return res.status(404).json({ error: 'Method not found' });
    res.json({ method });
  } catch (err) {
    next(err);
  }
}
