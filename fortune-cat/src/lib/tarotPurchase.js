export const TAROT_PRODUCT_SKU = 'ait.0000014507.7a21835a.fa07ab6a60.0134034509'

// Persist the entitlement before acknowledging delivery to Toss.
export async function purchaseTarot(grant, suppliedIAP) {
  const IAP = suppliedIAP || (await import('@apps-in-toss/web-framework')).IAP
  const { orders } = await IAP.getPendingOrders()
  const pending = orders.filter(order => order.sku === TAROT_PRODUCT_SKU)
  if (pending.length) {
    for (const order of pending) {
      await grant(order.orderId)
      await IAP.completeProductGrant({ params: { orderId: order.orderId } })
    }
    return
  }
  return new Promise((resolve, reject) => {
    let cleanup
    cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: TAROT_PRODUCT_SKU,
        processProductGrant: async ({ orderId }) => {
          try {
            await grant(orderId)
            return true
          } catch (error) {
            reject(error)
            return false
          }
        },
      },
      onEvent: event => {
        if (event.type === 'success') { cleanup?.(); resolve() }
      },
      onError: error => { cleanup?.(); reject(error || new Error('결제가 취소됐어요.')) },
    })
  })
}
