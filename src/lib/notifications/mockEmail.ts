type OrderConfirmationEmailInput = {
  customerName?: string | null;
  customerEmail?: string | null;
  orderId: string;
  total: number;
  statusLabel: string;
};

const buildTemplate = (payload: OrderConfirmationEmailInput) => {
  return [
    '<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px;">',
    '  <h1 style="margin: 0 0 12px; font-size: 22px; color: #111827;">Pizza Palace Order Confirmation</h1>',
    `  <p style=\"margin: 0 0 8px; color: #374151;\">Hi ${payload.customerName ?? "Customer"},</p>`,
    '  <p style="margin: 0 0 16px; color: #374151;">Thanks for your order. Here are your order details:</p>',
    '  <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">',
    `    <tr><td style=\"padding: 6px 0; color: #6b7280;\">Order ID</td><td style=\"padding: 6px 0; text-align: right; font-weight: 600;\">${payload.orderId}</td></tr>`,
    `    <tr><td style=\"padding: 6px 0; color: #6b7280;\">Total</td><td style=\"padding: 6px 0; text-align: right; font-weight: 600;\">$${payload.total.toFixed(2)}</td></tr>`,
    `    <tr><td style=\"padding: 6px 0; color: #6b7280;\">Status</td><td style=\"padding: 6px 0; text-align: right; font-weight: 600;\">${payload.statusLabel}</td></tr>`,
    "  </table>",
    '  <p style="margin: 0; color: #6b7280; font-size: 13px;">This is a development mock email rendered in console output.</p>',
    "</div>",
  ].join("\n");
};

export const sendMockOrderConfirmationEmail = (
  payload: OrderConfirmationEmailInput,
) => {
  const template = buildTemplate(payload);

  console.log("\n================ MOCK EMAIL START ================");
  console.log(`To: ${payload.customerEmail ?? "unknown@example.com"}`);
  console.log("Subject: Your Pizza Palace Order Confirmation");
  console.log(template);
  console.log("================ MOCK EMAIL END ==================\n");
};
