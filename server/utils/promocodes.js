export function normalizePromoCode(code) {
  return String(code || '').trim().toUpperCase()
}

export function mapPromoRow(row) {
  if (!row) return null
  const maxUses = row.maxUses !== null && row.maxUses !== undefined ? Number(row.maxUses) : null
  const usageCount = Number(row.usageCount || 0)
  return {
    code: row.code,
    description: row.description || '',
    discountType: row.discountType,
    discountValue: Number(row.discountValue),
    minSubtotal: Number(row.minSubtotal || 0),
    maxUses,
    usageCount,
    isActive: row.isActive === 1,
    expiresAt: row.expiresAt || null,
    lastUsedAt: row.lastUsedAt || null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    remainingUses: maxUses !== null ? Math.max(maxUses - usageCount, 0) : null
  }
}

export function calculateDiscountAmount(promo, amount) {
  const total = Math.max(Number.isFinite(amount) ? amount : 0, 0)
  if (total <= 0) return 0
  let discount = 0

  if (promo.discountType === 'percent') {
    discount = Math.floor(total * (Number(promo.discountValue) / 100))
  } else if (promo.discountType === 'fixed') {
    discount = Math.floor(Number(promo.discountValue))
  }

  if (!Number.isFinite(discount) || discount < 0) {
    discount = 0
  }

  return Math.min(discount, total)
}

export function evaluatePromoAvailability(promo, amount) {
  if (!promo.isActive) {
    return { ok: false, code: 'inactive' }
  }

  if (promo.expiresAt) {
    const expires = new Date(promo.expiresAt).getTime()
    if (!Number.isNaN(expires) && expires < Date.now()) {
      return { ok: false, code: 'expired' }
    }
  }

  if (promo.maxUses !== null && promo.usageCount >= promo.maxUses) {
    return { ok: false, code: 'usage_limit' }
  }

  if (promo.minSubtotal > amount) {
    return { ok: false, code: 'min_subtotal', meta: { minSubtotal: promo.minSubtotal } }
  }

  const discount = calculateDiscountAmount(promo, amount)
  if (discount <= 0) {
    return { ok: false, code: 'no_discount' }
  }

  return { ok: true, discount }
}

export function promoError(code, status = 400, meta) {
  const error = new Error(code)
  error.status = status
  error.code = code
  if (meta) error.meta = meta
  return error
}
