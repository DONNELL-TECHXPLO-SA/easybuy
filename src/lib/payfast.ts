import crypto from "crypto";

export interface PayFastParams {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address?: string;
  m_payment_id: string; // orderId
  amount: string;
  item_name: string;
  passphrase?: string;
}

export function generatePayFastSignature(
  params: Record<string, string>,
  passphrase?: string
): string {
  // 1. Filter out empty values and the signature itself
  const keys = Object.keys(params).filter(
    (key) => params[key] !== "" && key !== "signature"
  );

  // 2. Sort keys alphabetically
  keys.sort();

  // 3. Construct the parameter string
  const paramString = keys
    .map((key) => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, "+")}`)
    .join("&");

  // 4. Append passphrase if present
  const finalString = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : paramString;

  // 5. Generate MD5 hash
  return crypto.createHash("md5").update(finalString).digest("hex");
}

export function getPayFastUrl(params: PayFastParams): string {
  const baseUrl =
    process.env.PAYFAST_SANDBOX === "true"
      ? "https://sandbox.payfast.co.za/eng/process"
      : "https://www.payfast.co.za/eng/process";

  const data: Record<string, string> = {
    merchant_id: params.merchant_id,
    merchant_key: params.merchant_key,
    return_url: params.return_url,
    cancel_url: params.cancel_url,
    notify_url: params.notify_url,
    m_payment_id: params.m_payment_id,
    amount: params.amount,
    item_name: params.item_name,
  };

  if (params.name_first) data.name_first = params.name_first;
  if (params.name_last) data.name_last = params.name_last;
  if (params.email_address) data.email_address = params.email_address;

  const signature = generatePayFastSignature(data, params.passphrase);
  data.signature = signature;

  const query = Object.keys(data)
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  return `${baseUrl}?${query}`;
}
