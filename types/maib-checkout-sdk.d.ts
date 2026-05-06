// types/maib-checkout-sdk.d.ts
declare module 'maib-checkout-sdk' {
  export class MaibCheckoutSdk {
    static readonly SANDBOX_BASE_URL: string
    static readonly PRODUCTION_BASE_URL: string
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
    checkoutDetails(checkoutId: string, token: string): Promise<Record<string, unknown>>
    paymentRefund(paymentId: string, data: Record<string, unknown>, token: string): Promise<Record<string, unknown>>
  }
}