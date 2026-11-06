/**
 * Configuração central do site — Ótica Real Santa Rita.
 * Tudo que muda com frequência (contatos, mensagens do WhatsApp, promoção) fica aqui.
 * O conteúdo editorial (vitrine, Instagram, lojas) está em index.html, em blocos fáceis de copiar.
 */

export const SITE = {
  name: 'Ótica Real Santa Rita',
  instagram: 'https://www.instagram.com/oticarealsantarita/',

  stores: {
    loja1: {
      label: 'Loja 1',
      whatsapp: '553534710901',
      phone: '(35) 3471-0901',
      address: 'R. Comendador Custódio Ribeiro, 120 a - Centro, Santa Rita do Sapucaí - MG, 37540-000',
    },
    loja2: {
      label: 'Loja 2',
      whatsapp: '553534731297',
      phone: '(35) 3473-1297',
      address: 'R. Barão do Rio Branco, 229 E - Centro, Santa Rita do Sapucaí - MG, 37540-000',
    },
  },

  /** Assuntos oferecidos no seletor de WhatsApp. */
  topics: [
    { id: 'conhecer', label: 'Conhecer os óculos disponíveis', text: 'Olá! Quero conhecer os óculos disponíveis.' },
    { id: 'armacao', label: 'Saber mais sobre uma armação', text: 'Olá! Gostaria de saber mais sobre uma armação.' },
    { id: 'agendar', label: 'Agendar um atendimento', text: 'Olá! Quero agendar um atendimento.' },
    { id: 'lentes', label: 'Conhecer as lentes disponíveis', text: 'Olá! Gostaria de conhecer as lentes disponíveis.' },
  ],

  hero: {
    /** Tempo (s) que cada óculos permanece na vitrine antes da troca. */
    hold: 5.8,
  },
};

export const whatsappUrl = (storeId, text) => {
  const store = SITE.stores[storeId];
  const query = new URLSearchParams({ phone: store.whatsapp, text, type: 'phone_number', app_absent: '0' });
  return `https://api.whatsapp.com/send/?${query.toString()}`;
};

export const mapsEmbedUrl = (storeId) =>
  `https://www.google.com/maps?q=${encodeURIComponent(`Ótica Real Santa Rita ${SITE.stores[storeId].address}`)}&output=embed`;
