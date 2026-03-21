export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateOrderConfirmationMessage(
  orderNumber: string,
  partnerName: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
): string {
  const itemsList = items
    .map((item) => `- ${item.quantity}x ${item.name}: R$ ${(item.price * item.quantity).toFixed(2)}`)
    .join("\n");

  return `🎙️ *PodSpace Club - Pedido Confirmado!*

Olá! Seu pedido em *${partnerName}* foi confirmado.

*Pedido #${orderNumber}*
${itemsList}

*Total: R$ ${total.toFixed(2)}*

Obrigado por comprar no PodSpace Club! 🎧`;
}
