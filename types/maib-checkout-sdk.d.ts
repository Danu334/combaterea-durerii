// types/maib-checkout-sdk.d.ts
declare module 'maib-checkout-sdk' {
  export class MaibCheckoutSdk {
    static readonly SANDBOX_BASE_URL: string
    /** Production base URL (the SDK has no PRODUCTION_BASE_URL — use this). */
    static readonly DEFAULT_BASE_URL: string
    static validateCallbackSignature(
      body: string,
      signatureHeader: string,
      signatureTimestamp: string,
      signatureKey: string
    ): boolean
  }

  export class MaibCheckoutApiRequest {
    static create(baseUrl: string): MaibCheckoutApiRequest
    generateToken(clientId: string, clientSecret: string): Promise<{ accessToken: string }>
    checkoutRegister(data: Record<string, unknown>, token: string): Promise<{ checkoutId: string; checkoutUrl: string }>
    checkoutCancel(checkoutId: string, token: string): Promise<Record<string, unknown>>
    checkoutDetails(checkoutId: string, token: string): Promise<Record<string, unknown>>
    paymentDetails(paymentId: string, token: string): Promise<Record<string, unknown>>
    /** Refund a payment. refundData requires { amount, reason }. */
    paymentRefund(paymentId: string, refundData: { amount: number; reason: string }, token: string): Promise<Record<string, unknown>>
  }
}
